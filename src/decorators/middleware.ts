/**
 * Middleware decorators for Dunamis.js
 *
 * These decorators are used to apply middleware to controllers and methods.
 * Middleware can be used for authentication, validation, logging, etc.
 */

import { ClassConstructor, MiddlewareFunction } from "../types";
import { MetadataStorage } from "../metadata/MetadataStorage";
import { MiddlewareMetadata } from "../metadata/types";
import { METADATA_KEY } from "../constants";
import { defineMetadata, getMetadata } from "../utils/metadata";

/**
 * Apply middleware to a controller or controller method
 *
 * @param middleware - Express middleware function or array of middleware functions
 * @returns Decorator function for class or method
 *
 * @example
 * // Apply middleware to a controller
 * @UseMiddleware(loggerMiddleware)
 * @JSONController('/users')
 * class UserController {
 *   // ...
 * }
 *
 * @example
 * // Apply middleware to a method
 * @UseMiddleware([authMiddleware, validateUserMiddleware])
 * @Get('/:id')
 * getUser(@Param('id') id: string) {
 *   // ...
 * }
 */
export function UseMiddleware(middleware: MiddlewareFunction | MiddlewareFunction[]) {
  const middlewareArray = Array.isArray(middleware) ? middleware : [middleware];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any, propertyKey?: string | symbol): void {
    if (propertyKey) {
      // Method decorator
      applyMethodMiddleware(
        target.constructor as ClassConstructor,
        propertyKey.toString(),
        middlewareArray
      );
    } else {
      // Class decorator
      applyControllerMiddleware(target as ClassConstructor, middlewareArray);
    }
  };
}

/**
 * Apply middleware to a controller
 *
 * @param target - The controller class
 * @param middleware - Array of middleware functions
 */
function applyControllerMiddleware(
  target: ClassConstructor,
  middleware: MiddlewareFunction[]
): void {
  // Get existing middleware or initialize empty array
  const existingMiddleware =
    getMetadata<MiddlewareFunction[]>(METADATA_KEY.CONTROLLER_MIDDLEWARE, target) || [];

  // Combine with new middleware
  const newMiddleware = [...existingMiddleware, ...middleware];

  // Store updated middleware in metadata
  defineMetadata(METADATA_KEY.CONTROLLER_MIDDLEWARE, newMiddleware, target);

  // Register each middleware in the metadata storage
  const metadataStorage = MetadataStorage.getInstance();

  for (const middlewareFn of middleware) {
    const metadata: MiddlewareMetadata = {
      target,
      middleware: middlewareFn,
    };

    metadataStorage.addMiddlewareMetadata(metadata);
  }
}

/**
 * Apply middleware to a controller method
 *
 * @param target - The controller class
 * @param methodName - The method name
 * @param middleware - Array of middleware functions
 */
function applyMethodMiddleware(
  target: ClassConstructor,
  methodName: string,
  middleware: MiddlewareFunction[]
): void {
  // Generate a unique key for the method
  const metadataKey = `${METADATA_KEY.METHOD_MIDDLEWARE}:${methodName}`;

  // Get existing middleware or initialize empty array
  const existingMiddleware = getMetadata<MiddlewareFunction[]>(metadataKey, target) || [];

  // Combine with new middleware
  const newMiddleware = [...existingMiddleware, ...middleware];

  // Store updated middleware in metadata
  defineMetadata(metadataKey, newMiddleware, target);

  // Register each middleware in the metadata storage
  const metadataStorage = MetadataStorage.getInstance();

  for (const middlewareFn of middleware) {
    const metadata: MiddlewareMetadata = {
      target,
      method: methodName,
      middleware: middlewareFn,
    };

    metadataStorage.addMiddlewareMetadata(metadata);
  }
}
