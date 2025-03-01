/**
 * Error handling decorators for Dunamis.js
 */
import { ClassConstructor } from "../types";
import { MetadataStorage } from "../metadata/MetadataStorage";
import { ErrorHandlerFunction, defaultControllerErrorHandler } from "../error/errorHandler";

/**
 * Decorator to apply an error handler to a controller class.
 * The error handler will be used to handle errors thrown by controller methods.
 *
 * @param handlerOrTarget - Error handler function or controller class
 * @returns Decorator function or void
 *
 * @example
 * // With custom error handler
 * @ErrorHandler((err, req, res) => {
 *   res.status(500).json({ message: 'Custom error handler', error: err.message });
 * })
 * @JSONController('/users')
 * class UserController {
 *   // ...
 * }
 *
 * @example
 * // With default error handler
 * @ErrorHandler()
 * @JSONController('/posts')
 * class PostController {
 *   // ...
 * }
 */
export function ErrorHandler(
  handlerOrTarget?: ErrorHandlerFunction | ClassConstructor
): ClassDecorator | void {
  // If handlerOrTarget is a class constructor, it means the decorator was called without parameters
  if (typeof handlerOrTarget === "function" && isClassConstructor(handlerOrTarget as Function)) {
    return applyErrorHandler(handlerOrTarget as ClassConstructor);
  }

  // Otherwise, return a decorator function
  return (target: Function): void => {
    applyErrorHandler(target as ClassConstructor, handlerOrTarget as ErrorHandlerFunction);
  };
}

/**
 * For testing purposes - a version of the decorator that always returns a ClassDecorator
 * This avoids TypeScript errors in tests
 */
export function createErrorHandlerDecorator(handler?: ErrorHandlerFunction): ClassDecorator {
  return (target: Function): void => {
    applyErrorHandler(target as ClassConstructor, handler);
  };
}

/**
 * Apply an error handler to a controller class
 *
 * @param target - Controller class
 * @param handler - Error handler function
 */
function applyErrorHandler(
  target: ClassConstructor,
  handler: ErrorHandlerFunction = defaultControllerErrorHandler
): void {
  const metadataStorage = MetadataStorage.getInstance();

  // Check if target is a controller
  if (!metadataStorage.isController(target)) {
    throw new Error(
      `@ErrorHandler can only be applied to controller classes. ${target.name} is not a controller.`
    );
  }

  // Store error handler metadata
  metadataStorage.addErrorHandlerMetadata({
    target,
    handler,
  });
}

/**
 * Check if a function is a class constructor
 *
 * @param func - Function to check
 * @returns True if the function is a class constructor
 */
function isClassConstructor(func: Function): boolean {
  return func.toString().substring(0, 5) === "class";
}
