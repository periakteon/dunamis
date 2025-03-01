/**
 * Express middleware utilities for Dunamis.js
 *
 * This file contains utilities for handling middleware in Express routes.
 */

import { RequestHandler, NextFunction, Response } from "express";
import { MiddlewareFunction } from "../types";
import { Request } from "./types";

/**
 * Creates an Express-compatible middleware handler from a Dunamis.js middleware function
 *
 * @param middleware - The middleware function to convert
 * @returns Express request handler
 */
export function createMiddlewareHandler(middleware: MiddlewareFunction): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction): void {
    try {
      // Execute the middleware
      const result = middleware(req, res, next);

      // Handle promises - if the middleware returns a promise, catch any errors
      if (result instanceof Promise) {
        result.catch((error: Error) => {
          next(error);
        });
      }
    } catch (error) {
      // Handle synchronous errors
      next(error);
    }
  };
}

/**
 * Converts an array of Dunamis.js middleware functions to Express request handlers
 *
 * @param middleware - Array of middleware functions
 * @returns Array of Express request handlers
 */
export function convertMiddlewareToHandlers(middleware: MiddlewareFunction[]): RequestHandler[] {
  return middleware.map(createMiddlewareHandler);
}

/**
 * Combines multiple middleware arrays into a single array of Express request handlers
 *
 * @param middlewareArrays - Arrays of middleware functions to combine
 * @returns Combined array of Express request handlers
 */
export function combineMiddleware(...middlewareArrays: MiddlewareFunction[][]): RequestHandler[] {
  const combinedMiddleware: MiddlewareFunction[] = [];

  for (const middleware of middlewareArrays) {
    combinedMiddleware.push(...middleware);
  }

  return convertMiddlewareToHandlers(combinedMiddleware);
}
