/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Type definitions for @periakteon/dunamisjs
 */

import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * HTTP methods supported by the framework
 */
export type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

/**
 * Class constructor type
 */
export type ClassConstructor<T = any> = new (...args: any[]) => T;

/**
 * Controller class type
 */
export interface ControllerClass {
  new (...args: any[]): any;
}

/**
 * Middleware function type
 */
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Route handler function type
 */
export type RouteHandlerFunction = RequestHandler;

/**
 * Framework error types
 */
export enum ErrorType {
  INVALID_PARAMETER = "INVALID_PARAMETER",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

/**
 * Framework configuration options interface
 */
export interface FrameworkOptions {
  /** Global routing prefix */
  routePrefix?: string;
  /** Whether to enable automatic CORS */
  enableCors?: boolean;
  /** Whether to enable validation */
  enableValidation?: boolean;
  /** Whether to enable global error handling */
  enableErrorHandler?: boolean;
  /** Custom express middleware */
  middleware?: MiddlewareFunction[];
}
