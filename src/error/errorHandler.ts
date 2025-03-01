import { Request, Response, NextFunction, Application } from 'express';
import { HttpError } from './HttpError';

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
    message: err.message || 'Internal Server Error',
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
      message: 'Not Found',
      status: 404
    });
  });

  // Global error handler
  app.use(errorHandler);
} 