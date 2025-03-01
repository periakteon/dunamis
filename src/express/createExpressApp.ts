/**
 * Express application bootstrap functionality
 *
 * This module provides utilities for creating and configuring Express applications
 * with Dunamis.js controllers.
 */

import express, { Express, RequestHandler, json, urlencoded } from "express";
import { ClassConstructor, MiddlewareFunction } from "../types";
import { ExpressRouteRegistry } from "./ExpressRouteRegistry";

/**
 * Options for creating an Express application
 */
export interface CreateExpressAppOptions {
  /**
   * Controller classes to register with the application
   */
  controllers: ClassConstructor[];

  /**
   * Global route prefix (applied to all controllers)
   */
  routePrefix?: string;

  /**
   * Global middleware (applied to all routes)
   */
  globalMiddleware?: MiddlewareFunction[];

  /**
   * CORS middleware configuration
   * - If true, enables CORS with default settings
   * - If an object, enables CORS with the provided options
   * - If false or undefined, CORS is disabled
   * @default false
   */
  cors?: boolean | Record<string, any>;

  /**
   * Helmet middleware configuration for security headers
   * - If true, enables Helmet with default settings
   * - If an object, enables Helmet with the provided options
   * - If false or undefined, Helmet is disabled
   * @default false
   */
  helmet?: boolean | Record<string, any>;

  /**
   * Body parsing middleware configuration
   * - If true, enables body parsing with default settings (JSON and URL-encoded)
   * - If an object, enables body parsing with custom options for JSON and URL-encoded parsers
   * - If false, body parsing is disabled
   * @default true
   */
  bodyParser?: boolean | {
    json?: boolean | Parameters<typeof json>[0];
    urlencoded?: boolean | Parameters<typeof urlencoded>[0];
  };

  /**
   * Request logging middleware configuration
   * - If true, enables logging with default format ('dev')
   * - If a string, uses the specified format string
   * - If an object, passes options to morgan
   * - If false or undefined, logging is disabled
   * @default false
   */
  logger?: boolean | string | Record<string, any>;
}

/**
 * Creates an Express application with the provided controllers and options
 *
 * @param options - Options for creating the Express application
 * @returns Configured Express application
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * import { createExpressApp } from '@periakteon/dunamisjs';
 * import { UserController } from './controllers/UserController';
 *
 * const app = createExpressApp({
 *   controllers: [UserController],
 *   routePrefix: '/api',
 *   cors: true,
 *   logger: true,
 * });
 *
 * app.listen(3000, () => {
 *   console.log('Server is running on port 3000');
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // Advanced usage with custom middleware configurations
 * import { createExpressApp } from '@periakteon/dunamisjs';
 * import { UserController, ProductController } from './controllers';
 * 
 * const app = createExpressApp({
 *   controllers: [UserController, ProductController],
 *   routePrefix: '/api/v1',
 *   
 *   // Configure CORS with options
 *   cors: {
 *     origin: ['https://example.com', 'https://dev.example.com'],
 *     methods: ['GET', 'POST', 'PUT', 'DELETE'],
 *     credentials: true
 *   },
 *   
 *   // Configure Helmet with custom settings
 *   helmet: {
 *     contentSecurityPolicy: false,
 *     xssFilter: true
 *   },
 *   
 *   // Configure body parser with limits
 *   bodyParser: {
 *     json: { limit: '10mb', strict: true },
 *     urlencoded: { extended: true, limit: '10mb' }
 *   },
 *   
 *   // Configure logger with format
 *   logger: 'combined'
 * });
 * 
 * app.listen(3000);
 * ```
 */
export function createExpressApp(options: CreateExpressAppOptions): Express {
  // Create Express application
  const app = express();
  const middleware: RequestHandler[] = [];

  // Configure body parser middleware
  if (options.bodyParser !== false) {
    const bodyParserOptions = options.bodyParser === true || options.bodyParser === undefined
      ? {} // Use default options
      : options.bodyParser;

    // Configure JSON parser
    if (bodyParserOptions.json !== false) {
      const jsonOptions = typeof bodyParserOptions.json === 'object' ? bodyParserOptions.json : {};
      app.use(express.json(jsonOptions));
    }

    // Configure URL-encoded parser
    if (bodyParserOptions.urlencoded !== false) {
      const urlencodedOptions = typeof bodyParserOptions.urlencoded === 'object' 
        ? bodyParserOptions.urlencoded 
        : { extended: true };
      app.use(express.urlencoded(urlencodedOptions));
    }
  }

  // Add CORS if enabled
  if (options.cors) {
    try {
      const cors = require('cors');
      const corsOptions = options.cors === true ? {} : options.cors;
      middleware.push(cors(corsOptions));
    } catch (error) {
      console.warn('CORS middleware enabled but "cors" package is not installed. Run "npm install cors" to use this feature.');
    }
  }

  // Add Helmet if enabled
  if (options.helmet) {
    try {
      const helmet = require('helmet');
      const helmetOptions = options.helmet === true ? {} : options.helmet;
      middleware.push(helmet(helmetOptions));
    } catch (error) {
      console.warn('Helmet middleware enabled but "helmet" package is not installed. Run "npm install helmet" to use this feature.');
    }
  }

  // Add logger if enabled
  if (options.logger) {
    try {
      const morgan = require('morgan');
      let morganConfig: string | Record<string, any> = 'dev'; // Default format
      
      if (typeof options.logger === 'string') {
        morganConfig = options.logger;
      } else if (typeof options.logger === 'object') {
        morganConfig = options.logger;
      }
      
      middleware.push(morgan(morganConfig));
    } catch (error) {
      console.warn('Logger middleware enabled but "morgan" package is not installed. Run "npm install morgan" to use this feature.');
    }
  }

  // Add global middleware if provided
  if (options.globalMiddleware && options.globalMiddleware.length > 0) {
    middleware.push(...(options.globalMiddleware as RequestHandler[]));
  }

  // Apply all middleware
  if (middleware.length > 0) {
    app.use(...middleware);
  }

  // Create router with controllers
  const routeRegistry = ExpressRouteRegistry.getInstance();
  const router = routeRegistry.createRouter({
    controllers: options.controllers,
    routePrefix: options.routePrefix,
    middleware: [], // Already handled at app level
  });

  // Mount router on the application
  app.use(router);

  return app;
} 