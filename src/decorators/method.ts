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
 * @param httpMethod - HTTP method to use (GET, POST, etc.)
 * @param pathOrOptions - Either a route path string or options object
 * @returns Method decorator
 */
function createMethodDecorator(httpMethod: HttpMethod, pathOrOptions: string | MethodOptions = "") {
  const options: MethodOptions =
    typeof pathOrOptions === "string" ? { path: pathOrOptions } : pathOrOptions;

  const path = options.path || "";
  const middleware = options.middleware || [];

  return function (
    target: object,
    methodName: string,
    _descriptor?: TypedPropertyDescriptor<() => void>
  ): void {
    // Get the constructor from the prototype
    const constructor = target.constructor as ClassConstructor;

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
