/**
 * Controller decorators for Dunamis.js
 *
 * These decorators are used to define controller classes and their routes.
 * The main decorator is @JSONController which marks a class as a controller
 * and defines a base route prefix for all routes in the controller.
 */

import { ClassConstructor, MiddlewareFunction } from "../types";
import { MetadataStorage } from "../metadata/MetadataStorage";
import { ControllerMetadata, MiddlewareMetadata } from "../metadata/types";
import { METADATA_KEY } from "../constants";
import { defineMetadata } from "../utils/metadata";

/**
 * Options for the JSONController decorator
 */
export interface JSONControllerOptions {
  /**
   * Route prefix for all routes in the controller
   */
  prefix?: string;

  /**
   * Middleware to apply to all routes in the controller
   */
  middleware?: MiddlewareFunction[];
}

/**
 * Decorator factory for creating a JSON REST controller
 *
 * @param prefixOrOptions - Either a route prefix string or options object
 * @returns Class decorator
 *
 * @example
 * // Basic usage with prefix
 * @JSONController('/users')
 * class UserController {
 *   // ...
 * }
 *
 * @example
 * // Advanced usage with options
 * @JSONController({
 *   prefix: '/users',
 *   middleware: [authMiddleware]
 * })
 * class UserController {
 *   // ...
 * }
 */
export function JSONController(prefixOrOptions: string | JSONControllerOptions = "") {
  const options: JSONControllerOptions =
    typeof prefixOrOptions === "string" ? { prefix: prefixOrOptions } : prefixOrOptions;

  const prefix = options.prefix || "";
  const middleware = options.middleware || [];

  return function <T extends { new (...args: any[]): any }>(target: T): void {
    // Store metadata on the controller class
    defineMetadata(METADATA_KEY.CONTROLLER, true, target);
    defineMetadata(METADATA_KEY.CONTROLLER_PREFIX, prefix, target);
    defineMetadata(METADATA_KEY.CONTROLLER_MIDDLEWARE, middleware, target);

    // Register controller metadata in central storage
    const metadata: ControllerMetadata = {
      target: target as ClassConstructor,
      prefix,
      middleware,
    };

    MetadataStorage.getInstance().addControllerMetadata(metadata);
    
    // Register middleware metadata for each middleware function
    const metadataStorage = MetadataStorage.getInstance();
    for (const middlewareFn of middleware) {
      const middlewareMetadata: MiddlewareMetadata = {
        target: target as ClassConstructor,
        middleware: middlewareFn,
      };
      
      metadataStorage.addMiddlewareMetadata(middlewareMetadata);
    }
  };
}
