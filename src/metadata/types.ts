import { ClassConstructor, HttpMethod, MiddlewareFunction } from "../types";
import { ParameterType } from "../constants";
import { ErrorHandlerFunction } from "../error/errorHandler";

/**
 * Base interface for all metadata objects
 */
export interface BaseMetadata {
  target: ClassConstructor;
}

/**
 * Controller metadata interface
 */
export interface ControllerMetadata extends BaseMetadata {
  /**
   * Controller class
   */
  target: ClassConstructor;

  /**
   * Route prefix for the controller
   */
  prefix: string;

  /**
   * Middleware functions for the controller
   */
  middleware: MiddlewareFunction[];
}

/**
 * Method metadata interface
 */
export interface MethodMetadata extends BaseMetadata {
  /**
   * Controller class that the method belongs to
   */
  target: ClassConstructor;

  /**
   * Method name
   */
  method: string;

  /**
   * HTTP method (GET, POST, etc.)
   */
  httpMethod: HttpMethod;

  /**
   * Route path for the method
   */
  path: string;

  /**
   * Middleware functions for the method
   */
  middleware: MiddlewareFunction[];
}

/**
 * Parameter metadata interface
 */
export interface ParameterMetadata extends BaseMetadata {
  /**
   * Controller class that the parameter belongs to
   */
  target: ClassConstructor;

  /**
   * Method name that the parameter belongs to
   */
  method: string;

  /**
   * Parameter index in the method signature
   */
  index: number;

  /**
   * Parameter type (body, query, param, etc.)
   */
  type: ParameterType;

  /**
   * Parameter name (e.g., the name of the route param or query param)
   */
  name?: string;

  /**
   * Additional options for the parameter
   */
  options?: Record<string, unknown>;
}

/**
 * Middleware metadata interface
 */
export interface MiddlewareMetadata extends BaseMetadata {
  /**
   * Controller class that the middleware belongs to
   */
  target: ClassConstructor;

  /**
   * Method name that the middleware belongs to (undefined for controller-level middleware)
   */
  method?: string;

  /**
   * Middleware function
   */
  middleware: MiddlewareFunction;
}

/**
 * Error handler metadata interface
 */
export interface ErrorHandlerMetadata extends BaseMetadata {
  /**
   * Controller class that the error handler belongs to
   */
  target: ClassConstructor;

  /**
   * Error handler function
   */
  handler: ErrorHandlerFunction;
}
