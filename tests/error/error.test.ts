import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MetadataStorage } from '../../src/metadata/MetadataStorage';
import { createErrorHandlerDecorator } from '../../src/decorators/error';
import { JSONController } from '../../src/decorators/controller';
import { Get } from '../../src/decorators/method';
import { HttpError } from '../../src/error/HttpError';
import { ErrorHandlerFunction } from '../../src/error/errorHandler';
import { createExpressApp } from '../../src/express/createExpressApp';
import request from 'supertest';

describe('ErrorHandler Decorator', () => {
  let metadataStorage: MetadataStorage;

  beforeEach(() => {
    metadataStorage = MetadataStorage.getInstance();
    metadataStorage.clear();
  });

  afterEach(() => {
    metadataStorage.clear();
  });

  it('should register error handler metadata for a controller class', () => {
    // Define a custom error handler
    const customErrorHandler: ErrorHandlerFunction = (err, _req, res, _next) => {
      res.status(500).json({ customMessage: 'Custom error handler', error: err.message });
    };

    // Using function notation instead of decorators to avoid TypeScript errors in tests
    function createControllerWithErrorHandler() {
      const TestController = class {
        getTest() {
          return { success: true };
        }
      };
      
      // Apply decorators programmatically
      JSONController('/test')(TestController);
      Get('/')(TestController.prototype, 'getTest');
      createErrorHandlerDecorator(customErrorHandler)(TestController);
      
      return TestController;
    }
    
    const TestController = createControllerWithErrorHandler();

    // Check if error handler metadata was registered
    const errorHandlerMetadata = metadataStorage.getErrorHandlerMetadata(TestController);
    expect(errorHandlerMetadata).toBeDefined();
    expect(errorHandlerMetadata?.target).toBe(TestController);
    expect(errorHandlerMetadata?.handler).toBe(customErrorHandler);
  });

  it('should register default error handler when no handler is provided', () => {
    // Using function notation instead of decorators
    function createControllerWithDefaultErrorHandler() {
      const TestController = class {
        getTest() {
          return { success: true };
        }
      };
      
      // Apply decorators programmatically
      JSONController('/test')(TestController);
      Get('/')(TestController.prototype, 'getTest');
      createErrorHandlerDecorator()(TestController);
      
      return TestController;
    }
    
    const TestController = createControllerWithDefaultErrorHandler();

    // Check if error handler metadata was registered
    const errorHandlerMetadata = metadataStorage.getErrorHandlerMetadata(TestController);
    expect(errorHandlerMetadata).toBeDefined();
    expect(errorHandlerMetadata?.target).toBe(TestController);
    expect(errorHandlerMetadata?.handler).toBeDefined();
  });

  it('should throw error when applied to a non-controller class', () => {
    // Define a regular class (not a controller)
    class NotAController {
      doSomething() {
        return true;
      }
    }

    // Applying ErrorHandler to a non-controller should throw
    expect(() => {
      createErrorHandlerDecorator()(NotAController);
    }).toThrow(/not a controller/);
  });

  it('should handle errors thrown in controller methods', async () => {
    // Define a controller with error handler that throws an error
    function createErrorTestController() {
      const ErrorTestController = class {
        getError() {
          throw new HttpError('Test error', 400);
        }
        
        getSuccess() {
          return { success: true };
        }
      };
      
      // Apply decorators programmatically
      JSONController('/api')(ErrorTestController);
      Get('/error')(ErrorTestController.prototype, 'getError');
      Get('/success')(ErrorTestController.prototype, 'getSuccess');
      createErrorHandlerDecorator()(ErrorTestController);
      
      return ErrorTestController;
    }
    
    const ErrorTestController = createErrorTestController();

    // Create an Express app with the controller
    const app = createExpressApp({
      controllers: [ErrorTestController],
    });

    // Test error endpoint
    const response = await request(app).get('/api/error');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Test error',
      status: 400,
    });

    // Test success endpoint
    const successResponse = await request(app).get('/api/success');
    expect(successResponse.status).toBe(200);
    expect(successResponse.body).toEqual({ success: true });
  });

  it('should use custom error handler', async () => {
    // Define a custom error handler
    const customHandler: ErrorHandlerFunction = (err, _req, res, _next) => {
      res.status(418).json({
        customMessage: 'I am a teapot',
        originalError: err.message,
      });
    };

    // Define a controller with custom error handler
    function createCustomErrorController() {
      const CustomErrorController = class {
        getError() {
          throw new Error('Something went wrong');
        }
      };
      
      // Apply decorators programmatically
      JSONController('/api')(CustomErrorController);
      Get('/error')(CustomErrorController.prototype, 'getError');
      createErrorHandlerDecorator(customHandler)(CustomErrorController);
      
      return CustomErrorController;
    }
    
    const CustomErrorController = createCustomErrorController();

    // Create an Express app with the controller
    const app = createExpressApp({
      controllers: [CustomErrorController],
    });

    // Test error endpoint with custom handler
    const response = await request(app).get('/api/error');
    expect(response.status).toBe(418);
    expect(response.body).toEqual({
      customMessage: 'I am a teapot',
      originalError: 'Something went wrong',
    });
  });
}); 