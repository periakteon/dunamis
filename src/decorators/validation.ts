import { ZodSchema } from 'zod';
import { ValidationType, ValidationOptions, createZodValidationMiddleware, InferSchemaType } from '../validation/zod';
import { getMetadataStorage } from '../utils/getMetadataStorage';

/**
 * Decorator factory that creates a validation decorator for a specific validation type
 * 
 * @param validationType The part of the request to validate (body, query, params)
 * @returns A decorator function
 */
function createValidationDecorator(validationType: ValidationType) {
  /**
   * Validates request data using a Zod schema
   * 
   * @param schema The Zod schema to validate against
   * @param options Configuration options for validation
   * @returns A method decorator
   */
  return function <T extends ZodSchema>(schema: T, options?: ValidationOptions): MethodDecorator {
    return function (
      target: Object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      const metadataStorage = getMetadataStorage();

      // Register middleware to run before the controller method
      metadataStorage.addMiddlewareMetadata({
        target: target.constructor as any,
        method: propertyKey.toString(),
        middleware: createZodValidationMiddleware(schema, validationType, options),
      });

      // Store schema metadata for documentation and improved typing
      const existingMetadata = Reflect.getOwnMetadata(`zod:${validationType}`, target.constructor, propertyKey.toString()) || {};
      Reflect.defineMetadata(
        `zod:${validationType}`,
        { ...existingMetadata, schema },
        target.constructor,
        propertyKey.toString()
      );

      return descriptor;
    };
  };
}

/**
 * Validates request body using a Zod schema
 * 
 * @param schema The Zod schema to validate against 
 * @param options Configuration options for validation
 * @returns A method decorator
 * 
 * @example
 * ```typescript
 * const UserSchema = z.object({
 *   name: z.string().min(3),
 *   email: z.string().email()
 * });
 * 
 * @Post('/users')
 * @ValidateBody(UserSchema)
 * createUser(@Body() user: z.infer<typeof UserSchema>) {
 *   // user is fully typed and validated
 * }
 * ```
 */
export const ValidateBody = createValidationDecorator(ValidationType.BODY);

/**
 * Validates request query parameters using a Zod schema
 * 
 * @param schema The Zod schema to validate against
 * @param options Configuration options for validation
 * @returns A method decorator
 * 
 * @example
 * ```typescript
 * const PaginationSchema = z.object({
 *   page: z.coerce.number().int().default(1),
 *   limit: z.coerce.number().int().default(10)
 * });
 * 
 * @Get('/users')
 * @ValidateQuery(PaginationSchema)
 * getUsers(@Query() query: z.infer<typeof PaginationSchema>) {
 *   // query is fully typed and validated with defaults applied
 *   return this.userService.findAll(query.page, query.limit);
 * }
 * 
 * // Or for individual query params
 * @Get('/users')
 * @ValidateQuery(PaginationSchema)
 * getUsers(@Query('page') page: number, @Query('limit') limit: number) {
 *   // page and limit are validated, transformed, and type-safe
 *   return this.userService.findAll(page, limit);
 * }
 * ```
 */
export const ValidateQuery = createValidationDecorator(ValidationType.QUERY);

/**
 * Validates request parameters using a Zod schema
 * 
 * @param schema The Zod schema to validate against
 * @param options Configuration options for validation
 * @returns A method decorator
 * 
 * @example
 * ```typescript
 * const UserIdSchema = z.object({
 *   id: z.coerce.number().int().positive()
 * });
 * 
 * @Get('/users/:id')
 * @ValidateParams(UserIdSchema)
 * getUser(@Param('id') id: number) {
 *   // id is validated, transformed to a number, and guaranteed to be positive
 *   return this.userService.findById(id);
 * }
 * ```
 */
export const ValidateParams = createValidationDecorator(ValidationType.PARAMS);

/**
 * Helper type for extracting types from validation decorators
 * 
 * @template S The Zod schema type
 */
export type ZodValidated<S extends ZodSchema> = InferSchemaType<S>; 