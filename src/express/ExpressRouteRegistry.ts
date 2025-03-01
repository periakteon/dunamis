/**
 * Express route registry implementation
 *
 * This class is responsible for registering controllers and their routes
 * with an Express application.
 */

import { Router, Response, NextFunction, RequestHandler } from "express";
import { ClassConstructor, RouteHandlerFunction, HttpMethod } from "../types";
import { ControllerMetadata, MethodMetadata, ParameterMetadata } from "../metadata/types";
import { MetadataStorage } from "../metadata/MetadataStorage";
import { buildRoutePath } from "../utils/route";
import { ParameterType } from "../constants";
import {
  ControllerRegistrationOptions,
  HandlerMethodOptions,
  ParamFactory,
  RouterOptions,
  Request,
} from "./types";
import express from "express";
import { convertMiddlewareToHandlers } from "./middleware";
import { createControllerErrorHandlingMiddleware } from "../error/errorHandler";

/**
 * Express route registry for registering controllers and routes
 */
export class ExpressRouteRegistry {
  private static instance: ExpressRouteRegistry;
  private metadataStorage: MetadataStorage;

  /**
   * Create an instance of ExpressRouteRegistry
   */
  private constructor() {
    this.metadataStorage = MetadataStorage.getInstance();
  }

  /**
   * Get the singleton instance of ExpressRouteRegistry
   */
  public static getInstance(): ExpressRouteRegistry {
    if (!ExpressRouteRegistry.instance) {
      ExpressRouteRegistry.instance = new ExpressRouteRegistry();
    }
    return ExpressRouteRegistry.instance;
  }

  /**
   * Create an Express router with controllers
   *
   * @param options - Router options
   * @returns Express router
   */
  public createRouter(options: RouterOptions): Router {
    const router = Router();
    const instances = new Map<ClassConstructor, object>();

    // Ensure JSON body parsing middleware is applied
    router.use(express.json());
    
    // Apply global middleware if provided
    if (options.middleware && options.middleware.length > 0) {
      router.use(...(options.middleware as RequestHandler[]));
    }

    // Register each controller
    for (const controller of options.controllers) {
      this.registerController({
        controller,
        router,
        globalPrefix: options.routePrefix,
        instances,
      });
    }

    return router;
  }

  /**
   * Register a controller with an Express router
   *
   * @param options - Controller registration options
   */
  public registerController(options: ControllerRegistrationOptions): void {
    const { controller, router, globalPrefix, instances } = options;

    // Get controller metadata
    const controllerMetadata = this.metadataStorage.getControllerMetadata(controller);
    if (!controllerMetadata) {
      throw new Error(
        `Class "${controller.name}" is not a controller. Did you forget to add @JSONController()?`
      );
    }

    // Create controller instance if not provided
    let instance = instances?.get(controller);
    if (!instance) {
      instance = new controller();
      if (instances) {
        instances.set(controller, instance as object);
      }
    }

    // Register controller routes
    this.registerControllerRoutes(router, controllerMetadata, instance as object, globalPrefix);

    // Register error handler if one exists
    const errorHandlerMetadata = this.metadataStorage.getErrorHandlerMetadata(controller);
    if (errorHandlerMetadata) {
      const errorHandlerMiddleware = createControllerErrorHandlingMiddleware(
        controller,
        errorHandlerMetadata.handler
      );
      
      // Add the controller-specific error handler
      router.use(errorHandlerMiddleware);
    }
  }

  /**
   * Register all routes for a controller
   *
   * @param router - Express router
   * @param controllerMetadata - Controller metadata
   * @param instance - Controller instance
   * @param globalPrefix - Global route prefix
   */
  private registerControllerRoutes(
    router: Router,
    controllerMetadata: ControllerMetadata,
    instance: object,
    globalPrefix?: string
  ): void {
    // Get all method metadata for the controller
    const methodMetadata = this.metadataStorage.getControllerMethodMetadata(
      controllerMetadata.target
    );

    // Build base path for all routes in this controller
    const basePath = globalPrefix
      ? buildRoutePath(globalPrefix, controllerMetadata.prefix)
      : controllerMetadata.prefix;

    // Apply controller-level middleware if any
    const controllerMiddleware = controllerMetadata.middleware || [];
    
    // Get additional middleware from metadata storage
    const additionalMiddleware = this.metadataStorage.getControllerMiddleware(controllerMetadata.target);
    for (const middleware of additionalMiddleware) {
      controllerMiddleware.push(middleware.middleware);
    }
    
    // Convert middleware functions to Express request handlers
    const controllerMiddlewareHandlers = convertMiddlewareToHandlers(controllerMiddleware);

    // Register each method route
    for (const metadata of methodMetadata) {
      this.registerMethodRoute(router, metadata, instance, basePath, controllerMiddlewareHandlers);
    }
  }

  /**
   * Register a route for a controller method
   *
   * @param router - Express router
   * @param methodMetadata - Method metadata
   * @param instance - Controller instance
   * @param basePath - Base path for the controller
   * @param controllerMiddleware - Controller-level middleware
   */
  private registerMethodRoute(
    router: Router,
    methodMetadata: MethodMetadata,
    instance: object,
    basePath: string,
    controllerMiddleware: RequestHandler[]
  ): void {
    // Build complete route path
    const routePath = buildRoutePath(basePath, methodMetadata.path);

    // Get method-level middleware
    const methodMiddleware = methodMetadata.middleware || [];
    
    // Get additional middleware from metadata storage
    const additionalMiddleware = this.metadataStorage.getMethodMiddleware(
      methodMetadata.target,
      methodMetadata.method
    );
    for (const middleware of additionalMiddleware) {
      methodMiddleware.push(middleware.middleware);
    }
    
    // Convert method middleware to Express request handlers
    const methodMiddlewareHandlers = convertMiddlewareToHandlers(methodMiddleware);

    // Combine middleware (controller middleware runs first, then method middleware)
    const middleware = [...controllerMiddleware, ...methodMiddlewareHandlers];

    // Create the route handler
    const handler = this.createRouteHandler(methodMetadata.target, methodMetadata.method, instance);

    // Register the route with Express
    this.registerRoute(router, methodMetadata.httpMethod, routePath, middleware, handler);
  }

  /**
   * Create a route handler for a controller method
   *
   * @param target - Controller class
   * @param methodName - Method name
   * @param instance - Controller instance
   * @returns Express request handler
   */
  private createRouteHandler(
    target: ClassConstructor,
    methodName: string,
    instance: object
  ): RouteHandlerFunction {
    // Get parameter metadata for the method
    const parameters = this.metadataStorage.getMethodParameterMetadata(target, methodName);

    // Sort parameters by index
    parameters.sort((a, b) => a.index - b.index);

    // Create parameter factories
    const paramFactories = this.createParameterFactories(parameters);

    // Create and return the handler
    return this.createMethodHandler({
      instance,
      methodName,
      paramFactories,
    });
  }

  /**
   * Create parameter factories for a method
   *
   * @param parameters - Parameter metadata
   * @returns Array of parameter factories
   */
  private createParameterFactories(parameters: ParameterMetadata[]): (ParamFactory | undefined)[] {
    const factories: (ParamFactory | undefined)[] = [];
    
    // Fill array with undefined values to ensure correct length
    const maxIndex = parameters.length > 0 ? Math.max(...parameters.map(p => p.index)) : -1;

    for (let i = 0; i <= maxIndex; i++) {
      factories.push(undefined);
    }

    // Create factories for each parameter
    for (const param of parameters) {
      factories[param.index] = this.createParameterFactory(param);
    }

    return factories;
  }

  /**
   * Create a parameter factory for a single parameter
   *
   * @param parameter - Parameter metadata
   * @returns Parameter factory function
   */
  private createParameterFactory(parameter: ParameterMetadata): ParamFactory {
    const { type, name, options } = parameter;

    switch (type) {
      case ParameterType.REQUEST:
        return req => req;

      case ParameterType.RESPONSE:
        return (_req, res) => res;

      case ParameterType.BODY:
        return req => {
          // First check if validated data exists
          if (req.validatedData?.body !== undefined) {
            // Return the entire validated body or a specific property
            return !name || name === '0' ? req.validatedData.body : req.validatedData.body[name];
          }
          
          // Fall back to raw body if no validation was performed
          return !name || name === '0' ? req.body : req.body?.[name];
        };

      case ParameterType.QUERY:
        return req => {
          // Check if validatedData exists and contains query data
          if (req.validatedData?.query !== undefined) {
            // Return the entire validated query or a specific property
            return !name || name === '0' ? req.validatedData.query : req.validatedData.query[name];
          }
          
          // Fall back to raw query if no validation was performed
          return !name || name === '0' ? req.query : req.query[name];
        };

      case ParameterType.PARAM:
        return req => {
          // First check if validated data exists
          if (req.validatedData?.params !== undefined) {
            // Return the entire validated params or a specific property
            return name ? req.validatedData.params[name] : req.validatedData.params;
          }
          
          // Fall back to raw params if no validation was performed
          return name ? req.params[name] : req.params;
        };

      case ParameterType.HEADERS:
        return req => (name ? req.headers[name.toLowerCase()] : req.headers);

      case ParameterType.COOKIES:
        return req => (name ? req.cookies?.[name] : req.cookies);

      case ParameterType.SESSION:
        return (req: Request) => req.session;

      case ParameterType.CUSTOM:
        if (options?.factory && typeof options.factory === "function") {
          return options.factory as ParamFactory;
        }
        break;

      default:
        // Default fallback - return undefined
        return () => undefined;
    }

    // Default fallback if none of the cases matched
    return () => undefined;
  }

  /**
   * Create a handler method for a controller method
   *
   * @param options - Handler method options
   * @returns Express request handler
   */
  private createMethodHandler(options: HandlerMethodOptions): RouteHandlerFunction {
    const { instance, methodName, paramFactories } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Store controller instance on the request for error handling
        req.controller = instance;

        // Extract method parameters
        const args = paramFactories.map(factory => {
          if (!factory) return undefined;
          return factory(req, res);
        });

        // Call controller method with extracted parameters
        Promise.resolve((instance as any)[methodName](...args))
          .then(result => {
            // Skip response handling if result is undefined (assuming res was used directly)
            if (result === undefined && res.headersSent) {
              return;
            }

            // Send the result
            res.json(result);
          })
          .catch(error => {
            // Pass error to Express error handler
            next(error);
          });
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Register a route with Express router
   *
   * @param router - Express router
   * @param httpMethod - HTTP method (get, post, etc.)
   * @param path - Route path
   * @param middleware - Middleware handlers
   * @param handler - Route handler
   */
  private registerRoute(
    router: Router,
    httpMethod: HttpMethod,
    path: string,
    middleware: RequestHandler[],
    handler: RouteHandlerFunction
  ): void {
    // Call appropriate router method based on HTTP method
    if (middleware.length > 0) {
      router[httpMethod](path, ...middleware, handler);
    } else {
      router[httpMethod](path, handler);
    }
  }
}
