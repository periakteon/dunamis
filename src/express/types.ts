import type { Router, Request as ExpressRequest, Response, RequestHandler } from "express";
import type { ClassConstructor, MiddlewareFunction } from "../types";

/**
 * Extended Request type with session support (for express-session)
 */
export interface Request extends ExpressRequest {
  session?: Record<string, any>;
}

/**
 * Options for creating an Express router
 */
export interface RouterOptions {
  /**
   * Controller classes to register
   */
  controllers: ClassConstructor[];

  /**
   * Global route prefix (applied to all controllers)
   */
  routePrefix?: string;

  /**
   * Global middleware (applied to all routes)
   */
  middleware?: MiddlewareFunction[];
}

/**
 * Options for registering a single controller
 */
export interface ControllerRegistrationOptions {
  /**
   * Controller class to register
   */
  controller: ClassConstructor;

  /**
   * Express router to register routes on
   */
  router: Router;

  /**
   * Global route prefix (applied to all routes in the controller)
   */
  globalPrefix?: string;

  /**
   * Controller instances (used to call controller methods)
   */
  instances?: Map<ClassConstructor, object>;
}

/**
 * Parameter factory function
 * Used to extract parameters from the request for a controller method
 */
export type ParamFactory = (req: Request, res: Response) => unknown;

/**
 * Handler method options
 */
export interface HandlerMethodOptions {
  /**
   * Instance of the controller class
   */
  instance: object;

  /**
   * Method name to call on the controller instance
   */
  methodName: string;

  /**
   * Parameter factories to extract parameters from the request
   */
  paramFactories: (ParamFactory | undefined)[];
}

/**
 * Function to create an Express request handler from a controller method
 */
export type ControllerMethodHandlerFactory = (options: HandlerMethodOptions) => RequestHandler;
