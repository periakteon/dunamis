/**
 * Express application bootstrap functionality
 *
 * This module provides utilities for creating and configuring Express applications
 * with Dunamis.js controllers.
 */

import express, { Express, RequestHandler } from "express";
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
   * Whether to enable cors middleware
   * @default false
   */
  cors?: boolean;

  /**
   * Whether to enable helmet middleware for security headers
   * @default false
   */
  helmet?: boolean;

  /**
   * Whether to enable body parsing middleware
   * @default true
   */
  bodyParser?: boolean;

  /**
   * Whether to enable request logging middleware
   * @default false
   */
  logger?: boolean;
}

/**
 * Creates an Express application with the provided controllers and options
 *
 * @param options - Options for creating the Express application
 * @returns Configured Express application
 *
 * @example
 * ```typescript
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
 */
export function createExpressApp(options: CreateExpressAppOptions): Express {
  // Create Express application
  const app = express();
  const middleware: RequestHandler[] = [];

  // Configure global middleware
  if (options.bodyParser !== false) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }

  // Add CORS if enabled
  if (options.cors) {
    try {
      const cors = require('cors');
      middleware.push(cors());
    } catch (error) {
      console.warn('CORS middleware enabled but "cors" package is not installed. Run "npm install cors" to use this feature.');
    }
  }

  // Add Helmet if enabled
  if (options.helmet) {
    try {
      const helmet = require('helmet');
      middleware.push(helmet());
    } catch (error) {
      console.warn('Helmet middleware enabled but "helmet" package is not installed. Run "npm install helmet" to use this feature.');
    }
  }

  // Add logger if enabled
  if (options.logger) {
    try {
      const morgan = require('morgan');
      middleware.push(morgan('dev'));
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