/**
 * Tests for ExpressRouteRegistry
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express, { Router, Request, Response } from 'express';
import request from 'supertest';
import { MetadataStorage } from '../../src/metadata/MetadataStorage';
import { ExpressRouteRegistry } from '../../src/express/ExpressRouteRegistry';
import { JSONController } from '../../src/decorators/controller';
import { Get, Post } from '../../src/decorators/method';
import { Body, Param, Query, Req, Res } from '../../src/decorators/param';

describe('ExpressRouteRegistry', () => {
  beforeEach(() => {
    // Clear metadata before each test
    MetadataStorage.getInstance().clear();
  });

  afterEach(() => {
    // Clear metadata after each test
    MetadataStorage.getInstance().clear();
    vi.clearAllMocks();
  });

  it('should create an instance using getInstance', () => {
    const instance1 = ExpressRouteRegistry.getInstance();
    const instance2 = ExpressRouteRegistry.getInstance();

    expect(instance1).toBeDefined();
    expect(instance2).toBeDefined();
    expect(instance1).toBe(instance2);
  });

  it('should create a router with controller routes', async () => {
    // Define a test controller
    @JSONController('/test')
    class TestController {
      @Get('/hello')
      getHello() {
        return { message: 'Hello World' };
      }

      @Post('/echo')
      postEcho(@Body() body: any) {
        return { echo: body };
      }
    }

    // Create express app
    const app = express();
    
    // Ensure JSON body parsing is enabled
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Create router with the test controller
    const registry = ExpressRouteRegistry.getInstance();
    const router = registry.createRouter({
      controllers: [TestController],
    });

    // Add router to express app
    app.use(router);

    // Test GET endpoint
    const getResponse = await request(app).get('/test/hello');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({ message: 'Hello World' });

    // Test POST endpoint
    const postData = { test: 'data' };
    const postResponse = await request(app)
      .post('/test/echo')
      .set('Content-Type', 'application/json')
      .send(postData);
    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({ echo: postData });
  });

  it('should respect global route prefix', async () => {
    // Define a test controller
    @JSONController('/users')
    class UserController {
      @Get('/:id')
      getUser(@Param('id') id: string) {
        return { userId: id };
      }
    }

    // Create express app
    const app = express();
    
    // Create router with global prefix
    const registry = ExpressRouteRegistry.getInstance();
    const router = registry.createRouter({
      controllers: [UserController],
      routePrefix: '/api/v1',
    });

    // Add router to express app
    app.use(router);

    // Test endpoint with global prefix
    const response = await request(app).get('/api/v1/users/123');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ userId: '123' });
  });

  it('should handle query parameters correctly', async () => {
    // Define a test controller
    @JSONController('/search')
    class SearchController {
      @Get('/')
      search(@Query('q') query: string, @Query('limit') limit: string) {
        return { query, limit: parseInt(limit) };
      }
    }

    // Create express app
    const app = express();
    
    // Create router
    const registry = ExpressRouteRegistry.getInstance();
    const router = registry.createRouter({
      controllers: [SearchController],
    });

    // Add router to express app
    app.use(router);

    // Test endpoint with query parameters
    const response = await request(app).get('/search?q=test&limit=10');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ query: 'test', limit: 10 });
  });

  it('should handle Request and Response objects', async () => {
    // Define a test controller
    @JSONController('/custom')
    class CustomController {
      @Get('/headers')
      getHeaders(@Req() req: Request) {
        return { userAgent: req.headers['user-agent'] };
      }

      @Get('/direct-response')
      directResponse(@Res() res: Response) {
        res.status(201).json({ directly: 'handled' });
      }
    }

    // Create express app
    const app = express();
    
    // Create router
    const registry = ExpressRouteRegistry.getInstance();
    const router = registry.createRouter({
      controllers: [CustomController],
    });

    // Add router to express app
    app.use(router);

    // Test req accessor with a specific user agent
    const userAgent = 'test-agent';
    const headersResponse = await request(app)
      .get('/custom/headers')
      .set('User-Agent', userAgent);
    expect(headersResponse.status).toBe(200);
    expect(headersResponse.body.userAgent).toBe(userAgent);

    // Test direct response handling
    const directResponse = await request(app).get('/custom/direct-response');
    expect(directResponse.status).toBe(201);
    expect(directResponse.body).toEqual({ directly: 'handled' });
  });

  it('should throw an error when registering a non-controller class', () => {
    // Create a class without @Controller decorator
    class NotAController {
      getData() {
        return { data: 'test' };
      }
    }

    // Create registry
    const registry = ExpressRouteRegistry.getInstance();
    
    // Attempt to register non-controller class
    expect(() => {
      registry.registerController({
        controller: NotAController,
        router: Router(),
      });
    }).toThrow(/is not a controller/);
  });

  it('should register middleware correctly', async () => {
    // Define middleware
    const globalMiddleware = vi.fn((req, res, next) => next());
    const controllerMiddleware = vi.fn((req, res, next) => next());
    const methodMiddleware = vi.fn((req, res, next) => next());

    // Define a test controller with middleware
    @JSONController({
      prefix: '/middleware',
      middleware: [controllerMiddleware]
    })
    class MiddlewareController {
      @Get({
        path: '/test',
        middleware: [methodMiddleware]
      })
      getTest() {
        return { ok: true };
      }
    }

    // Create express app
    const app = express();
    
    // Create router with global middleware
    const registry = ExpressRouteRegistry.getInstance();
    const router = registry.createRouter({
      controllers: [MiddlewareController],
      middleware: [globalMiddleware],
    });

    // Add router to express app
    app.use(router);

    // Test endpoint which should trigger all middleware
    const response = await request(app).get('/middleware/test');
    
    // Check response
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    
    // Verify middleware was called
    expect(globalMiddleware).toHaveBeenCalled();
    expect(controllerMiddleware).toHaveBeenCalled();
    expect(methodMiddleware).toHaveBeenCalled();
    
    // Verify middleware execution order
    expect(globalMiddleware.mock.invocationCallOrder[0])
      .toBeLessThan(controllerMiddleware.mock.invocationCallOrder[0]);
      
    expect(controllerMiddleware.mock.invocationCallOrder[0])
      .toBeLessThan(methodMiddleware.mock.invocationCallOrder[0]);
  });
}); 