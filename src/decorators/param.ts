/**
 * Parameter decorators for Dunamis.js
 *
 * These decorators are used to extract data from the request object
 * and inject it into controller method parameters.
 * Basic parameter decorators include @Param, @Query, and @Body.
 */

import { ClassConstructor } from "../types";
import { MetadataStorage } from "../metadata/MetadataStorage";
import { ParameterMetadata } from "../metadata/types";
import { METADATA_KEY, ParameterType } from "../constants";
import { defineMetadata } from "../utils/metadata";

/**
 * Options for parameter decorators
 */
export interface ParameterOptions {
  /**
   * Additional custom options
   */
  [key: string]: unknown;

  /**
   * Whether the parameter is required
   * @default true
   */
  required?: boolean;

  /**
   * Default value for the parameter if not provided
   */
  defaultValue?: unknown;
}

/**
 * Create a parameter decorator
 *
 * @param type - The parameter type (body, query, param, etc.)
 * @param name - Optional parameter name (e.g., the name of the route param)
 * @param options - Optional parameter options
 * @returns Parameter decorator
 */
function createParameterDecorator(type: ParameterType, name?: string, options?: ParameterOptions) {
  return function (target: object, methodName: string | symbol, parameterIndex: number): void {
    // Store metadata on the parameter
    const paramName = name || parameterIndex.toString();

    // Define metadata using reflection API
    defineMetadata(
      METADATA_KEY.PARAMETER_TYPE,
      type,
      target.constructor,
      `${String(methodName)}_${parameterIndex}`
    );

    defineMetadata(
      METADATA_KEY.PARAMETER_NAME,
      paramName,
      target.constructor,
      `${String(methodName)}_${parameterIndex}`
    );

    defineMetadata(
      METADATA_KEY.PARAMETER_INDEX,
      parameterIndex,
      target.constructor,
      `${String(methodName)}_${parameterIndex}`
    );

    if (options) {
      defineMetadata(
        METADATA_KEY.PARAMETER_OPTIONS,
        options,
        target.constructor,
        `${String(methodName)}_${parameterIndex}`
      );
    }

    // Register parameter metadata in central storage
    const metadata: ParameterMetadata = {
      target: target.constructor as ClassConstructor,
      method: String(methodName),
      index: parameterIndex,
      type,
      name: paramName,
      options,
    };

    MetadataStorage.getInstance().addParameterMetadata(metadata);
  };
}

/**
 * Extracts a route parameter from the request.
 *
 * @param name - The name of the route parameter
 * @param options - Optional parameter options
 * @returns Parameter decorator
 *
 * @example
 * @Get('/users/:id')
 * getUser(@Param('id') id: string) {
 *   // id will contain the route parameter 'id'
 *   return this.userService.findById(id);
 * }
 */
export function Param(name: string, options?: ParameterOptions) {
  return createParameterDecorator(ParameterType.PARAM, name, options);
}

/**
 * Extracts a query parameter from the request.
 *
 * @param name - The name of the query parameter
 * @param options - Optional parameter options
 * @returns Parameter decorator
 *
 * @example
 * @Get('/users')
 * getUsers(@Query('page') page: number, @Query('limit') limit: number) {
 *   // page and limit will contain the query parameters
 *   return this.userService.findAll(page, limit);
 * }
 */
export function Query(name: string, options?: ParameterOptions) {
  return createParameterDecorator(ParameterType.QUERY, name, options);
}

/**
 * Extracts the request body or a specific property from it.
 *
 * @param name - Optional name of a specific property in the body
 * @param options - Optional parameter options
 * @returns Parameter decorator
 *
 * @example
 * // Extract entire body
 * @Post('/users')
 * createUser(@Body() userData: CreateUserDto) {
 *   return this.userService.create(userData);
 * }
 *
 * // Extract specific property from body
 * @Post('/users')
 * createUser(@Body('email') email: string) {
 *   return this.userService.findByEmail(email);
 * }
 */
export function Body(name?: string, options?: ParameterOptions) {
  return createParameterDecorator(ParameterType.BODY, name, options);
}
