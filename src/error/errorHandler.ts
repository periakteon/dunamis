import { Response, NextFunction, Application } from "express";
import { Request } from "../express/types";
import { HttpError } from "./HttpError";
import { ClassConstructor } from "../types";

/**
 * Generic error response interface
 */
export interface ErrorResponse {
  /**
   * Optional additional error details
   */
  [key: string]: any;

  /**
   * Error message
   */
  message: string;

  /**
   * HTTP status code
   */
  status: number;
}

/**
 * Type for error handler function
 *
 * @param error The error that was thrown
 * @param req The Express request object
 * @param res The Express response object
 * @returns void
 */
export type ErrorHandlerFunction = (
  error: Error | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/**
 * Express error handler middleware
 *
 * @param err Error object
 * @param _req Express request
 * @param res Express response
 * @param _next Express next function
 * @returns void
 */
export function errorHandler(
  err: Error | HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const response: ErrorResponse = {
    message: err.message || "Internal Server Error",
    status: err instanceof HttpError ? err.status : 500,
  };

  // Include additional data if available
  if (err instanceof HttpError && err.data) {
    Object.assign(response, err.data);
  }

  // Send the error response
  res.status(response.status).json(response);
}

/**
 * Applies the error handler middleware to an Express app
 *
 * @param app Express application
 */
export function useErrorHandler(app: Application): void {
  // Not found handler - should be added before the error handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      message: "Not Found",
      status: 404,
    });
  });

  // Global error handler
  app.use(errorHandler);
}

/**
 * Default error handler implementation for controller-level error handling
 *
 * @param error The error that was thrown
 * @param _req The Express request object
 * @param res The Express response object
 */
export function defaultControllerErrorHandler(
  error: Error | HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const response = {
    message: error.message || "Internal Server Error",
    status: error instanceof HttpError ? error.status : 500,
  };

  // Include additional data if available
  if (error instanceof HttpError && error.data) {
    Object.assign(response, { data: error.data });
  }

  // Send the error response
  res.status(response.status).json(response);
}

/**
 * Creates an error handling middleware for a controller
 *
 * @param controller The controller class
 * @param errorHandler The error handler function
 * @returns An Express middleware function
 */
export function createControllerErrorHandlingMiddleware(
  controller: ClassConstructor,
  errorHandler: ErrorHandlerFunction = defaultControllerErrorHandler
): (err: Error, req: Request, res: Response, next: NextFunction) => void {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Skip if the controller instance doesn't match
    if (!(req.controller instanceof controller)) {
      return next(err);
    }

    try {
      // Call the error handler
      errorHandler(err, req, res, next);
    } catch (handlerError) {
      // If the error handler throws, pass it to the next middleware
      next(handlerError);
    }
  };
}
