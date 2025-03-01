import { ZodSchema } from 'zod';
import { ValidationType, ValidationOptions, createZodValidationMiddleware } from '../validation/zod';
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
 *   page: z.string().transform(Number).default('1'),
 *   limit: z.string().transform(Number).default('10')
 * });
 * 
 * @Get('/users')
 * @ValidateQuery(PaginationSchema)
 * getUsers(@Query() pagination: z.infer<typeof PaginationSchema>) {
 *   // pagination is fully typed and validated with defaults applied
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
 *   id: z.string().uuid()
 * });
 * 
 * @Get('/users/:id')
 * @ValidateParams(UserIdSchema)
 * getUser(@Param('id') id: string) {
 *   // id is guaranteed to be a valid UUID
 * }
 * ```
 */
export const ValidateParams = createValidationDecorator(ValidationType.PARAMS); 