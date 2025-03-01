/**
 * HTTP method decorators for Dunamis.js
 *
 * These decorators are used to define routes for controller methods.
 * The decorators include @Get, @Post, @Put, @Delete, and @Patch.
 */

import { ClassConstructor, HttpMethod, MiddlewareFunction } from "../types";
import { MetadataStorage } from "../metadata/MetadataStorage";
import { MethodMetadata } from "../metadata/types";
import { METADATA_KEY } from "../constants";
import { defineMetadata } from "../utils/metadata";

/**
 * Options for HTTP method decorators
 */
export interface MethodOptions {
  /**
   * Route path for the method
   */
  path?: string;

  /**
   * Middleware to apply to the method
   */
  middleware?: MiddlewareFunction[];
}

/**
 * Base decorator factory for HTTP methods
 * 
 * Note: This implementation supports both TypeScript 5.0 Stage 3 decorators
 * and the previous Stage 2 decorator format for backward compatibility.
 *
 * @param httpMethod - HTTP method to use (GET, POST, etc.)
 * @param pathOrOptions - Either a route path string or options object
 * @returns Method decorator
 */
function createMethodDecorator(httpMethod: HttpMethod, pathOrOptions: string | MethodOptions = "") {
  const options: MethodOptions =
    typeof pathOrOptions === "string" ? { path: pathOrOptions } : pathOrOptions;

  const path = options.path || "";
  const middleware = options.middleware || [];

  // This function signature supports both Stage 2 and Stage 3 decorators
  return function(
    target: object | (new (...args: any[]) => any),
    methodNameOrContext: string | symbol | ClassMethodDecoratorContext,
    _descriptor?: PropertyDescriptor
  ): void | undefined {
    let methodName: string;
    let constructor: ClassConstructor;

    // Handle both Stage 3 and Stage 2 decorator formats
    if (typeof methodNameOrContext === 'string' || typeof methodNameOrContext === 'symbol') {
      // Stage 2 decorator format
      methodName = methodNameOrContext.toString();
      constructor = target.constructor as ClassConstructor;
    } else {
      // Stage 3 decorator format (TypeScript 5.0+)
      methodName = methodNameOrContext.name.toString();
      constructor = (target as object).constructor as ClassConstructor;
    }

    // Store metadata on the method
    defineMetadata(METADATA_KEY.METHOD, httpMethod, constructor, methodName);
    defineMetadata(METADATA_KEY.METHOD_PATH, path, constructor, methodName);
    defineMetadata(METADATA_KEY.METHOD_MIDDLEWARE, middleware, constructor, methodName);

    // Register method metadata in central storage
    const metadata: MethodMetadata = {
      target: constructor,
      method: methodName,
      httpMethod,
      path,
      middleware,
    };

    MetadataStorage.getInstance().addMethodMetadata(metadata);

    // For Stage 3 decorators, return undefined to keep the original method
    return undefined;
  };
}

/**
 * Decorator for GET routes
 *
 * @param pathOrOptions - Either a route path string or options object
 * @returns Method decorator
 *
 * @example
 * // Basic usage with path
 * @Get('/profile')
 * getProfile() {
 *   // ...
 * }
 *
 * @example
 * // Advanced usage with options
 * @Get({
 *   path: '/profile',
 *   middleware: [authMiddleware]
 * })
 * getProfile() {
 *   // ...
 * }
 */
export function Get(pathOrOptions: string | MethodOptions = "") {
  return createMethodDecorator("get", pathOrOptions);
}

/**
 * Decorator for POST routes
 *
 * @param pathOrOptions - Either a route path string or options object
 * @returns Method decorator
 */
export function Post(pathOrOptions: string | MethodOptions = "") {
  return createMethodDecorator("post", pathOrOptions);
}

/**
 * Decorator for PUT routes
 *
 * @param pathOrOptions - Either a route path string or options object
 * @returns Method decorator
 */
export function Put(pathOrOptions: string | MethodOptions = "") {
  return createMethodDecorator("put", pathOrOptions);
}

/**
 * Decorator for DELETE routes
 *
 * @param pathOrOptions - Either a route path string or options object
 * @returns Method decorator
 */
export function Delete(pathOrOptions: string | MethodOptions = "") {
  return createMethodDecorator("delete", pathOrOptions);
}

/**
 * Decorator for PATCH routes
 *
 * @param pathOrOptions - Either a route path string or options object
 * @returns Method decorator
 */
export function Patch(pathOrOptions: string | MethodOptions = "") {
  return createMethodDecorator("patch", pathOrOptions);
}

/**
 * Decorator for OPTIONS routes
 *
 * @param pathOrOptions - Either a route path string or options object
 * @returns Method decorator
 */
export function Options(pathOrOptions: string | MethodOptions = "") {
  return createMethodDecorator("options", pathOrOptions);
}

/**
 * Decorator for HEAD routes
 *
 * @param pathOrOptions - Either a route path string or options object
 * @returns Method decorator
 */
export function Head(pathOrOptions: string | MethodOptions = "") {
  return createMethodDecorator("head", pathOrOptions);
}
