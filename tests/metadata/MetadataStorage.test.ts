import { describe, it, expect, beforeEach } from "vitest";
import { MetadataStorage } from "../../src/metadata/MetadataStorage";
import { 
  ControllerMetadata, 
  MethodMetadata, 
  ParameterMetadata,
  MiddlewareMetadata
} from "../../src/metadata/types";
import { ParameterType, METADATA_KEY } from "../../src/constants";
import { Request, Response, NextFunction } from "express";
import { defineMetadata } from "../../src/utils/metadata";

class TestController {
  testMethod(): void {}
}

describe("MetadataStorage", () => {
  let metadataStorage: MetadataStorage;

  beforeEach(() => {
    // Get fresh instance for each test
    metadataStorage = MetadataStorage.getInstance();
    metadataStorage.clear();
  });

  it("should be a singleton", () => {
    const instance1 = MetadataStorage.getInstance();
    const instance2 = MetadataStorage.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should add and retrieve controller metadata", () => {
    const controllerMetadata: ControllerMetadata = {
      target: TestController,
      prefix: "/test",
      middleware: []
    };

    metadataStorage.addControllerMetadata(controllerMetadata);
    
    // Test getControllers
    const controllers = metadataStorage.getControllers();
    expect(controllers).toHaveLength(1);
    expect(controllers[0]).toEqual(controllerMetadata);
    
    // Test getControllerMetadata
    const retrievedMetadata = metadataStorage.getControllerMetadata(TestController);
    expect(retrievedMetadata).toEqual(controllerMetadata);
  });

  it("should add and retrieve method metadata", () => {
    const methodMetadata: MethodMetadata = {
      target: TestController,
      method: "testMethod",
      httpMethod: "get",
      path: "/path",
      middleware: []
    };

    metadataStorage.addMethodMetadata(methodMetadata);
    
    const methods = metadataStorage.getControllerMethodMetadata(TestController);
    expect(methods).toHaveLength(1);
    expect(methods[0]).toEqual(methodMetadata);
  });

  it("should add and retrieve parameter metadata", () => {
    const parameterMetadata: ParameterMetadata = {
      target: TestController,
      method: "testMethod",
      index: 0,
      type: ParameterType.BODY
    };

    metadataStorage.addParameterMetadata(parameterMetadata);
    
    const parameters = metadataStorage.getMethodParameterMetadata(TestController, "testMethod");
    expect(parameters).toHaveLength(1);
    expect(parameters[0]).toEqual(parameterMetadata);
  });

  it("should add and retrieve middleware metadata", () => {
    const middlewareFn = (req: Request, res: Response, next: NextFunction) => { next(); };
    
    // Controller level middleware
    const controllerMiddleware: MiddlewareMetadata = {
      target: TestController,
      middleware: middlewareFn
    };
    
    // Method level middleware
    const methodMiddleware: MiddlewareMetadata = {
      target: TestController,
      method: "testMethod",
      middleware: middlewareFn
    };
    
    metadataStorage.addMiddlewareMetadata(controllerMiddleware);
    metadataStorage.addMiddlewareMetadata(methodMiddleware);
    
    const controllerMiddlewares = metadataStorage.getControllerMiddleware(TestController);
    expect(controllerMiddlewares).toHaveLength(1);
    expect(controllerMiddlewares[0]).toEqual(controllerMiddleware);
    
    const methodMiddlewares = metadataStorage.getMethodMiddleware(TestController, "testMethod");
    expect(methodMiddlewares).toHaveLength(1);
    expect(methodMiddlewares[0]).toEqual(methodMiddleware);
  });

  it("should return empty array when no controller middleware exists", () => {
    // Testing line 89 in MetadataStorage.ts - returning empty array when no middleware exists
    const result = metadataStorage.getControllerMiddleware(TestController);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  });

  it("should retrieve multiple controller middleware in order", () => {
    const middlewareFn1 = (req: Request, res: Response, next: NextFunction) => { next(); };
    const middlewareFn2 = (req: Request, res: Response, next: NextFunction) => { next(); };
    const middlewareFn3 = (req: Request, res: Response, next: NextFunction) => { next(); };
    
    const controllerMiddleware1: MiddlewareMetadata = {
      target: TestController,
      middleware: middlewareFn1
    };
    
    const controllerMiddleware2: MiddlewareMetadata = {
      target: TestController,
      middleware: middlewareFn2
    };
    
    const controllerMiddleware3: MiddlewareMetadata = {
      target: TestController,
      middleware: middlewareFn3
    };
    
    // Add multiple middleware
    metadataStorage.addMiddlewareMetadata(controllerMiddleware1);
    metadataStorage.addMiddlewareMetadata(controllerMiddleware2);
    metadataStorage.addMiddlewareMetadata(controllerMiddleware3);
    
    // Retrieve and verify
    const result = metadataStorage.getControllerMiddleware(TestController);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(controllerMiddleware1);
    expect(result[1]).toEqual(controllerMiddleware2);
    expect(result[2]).toEqual(controllerMiddleware3);
  });

  it("should clear all metadata", () => {
    // Add some metadata
    metadataStorage.addControllerMetadata({
      target: TestController,
      prefix: "/test",
      middleware: []
    });
    
    // Clear everything
    metadataStorage.clear();
    
    // Verify it's all gone
    expect(metadataStorage.getControllers()).toHaveLength(0);
  });

  it("should use correct controller key to retrieve middleware", () => {
    const middlewareFn = (req: Request, res: Response, next: NextFunction) => { next(); };
    
    // Create a mock class to ensure we're testing the exact key generation logic
    class SpecificController {}
    
    const middleware: MiddlewareMetadata = {
      target: SpecificController,
      middleware: middlewareFn
    };
    
    metadataStorage.addMiddlewareMetadata(middleware);
    
    // This directly tests the key generation and retrieval in lines 88-89
    const result = metadataStorage.getControllerMiddleware(SpecificController);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(middleware);
    
    // Verify the key specificity by showing a different controller gets empty results
    class DifferentController {}
    const differentResult = metadataStorage.getControllerMiddleware(DifferentController);
    expect(differentResult).toHaveLength(0);
  });

  it("should correctly identify controllers with isController method", () => {
    // Create two test classes
    class ControllerClass {}
    class NonControllerClass {}
    
    // Set metadata on the controller class
    defineMetadata(METADATA_KEY.CONTROLLER, true, ControllerClass);
    
    // Test isController method
    expect(metadataStorage.isController(ControllerClass)).toBe(true);
    expect(metadataStorage.isController(NonControllerClass)).toBe(false);
  });

  // Test for line 122 - getControllerMethodMetadata returning empty array when no methods are registered
  it("should return empty array from getControllerMethodMetadata when no methods are registered", () => {
    class EmptyController {}
    
    const methods = metadataStorage.getControllerMethodMetadata(EmptyController);
    expect(methods).toBeInstanceOf(Array);
    expect(methods).toHaveLength(0);
  });

  // Test specifically for line 122 - the spreading of method metadata into results
  it("should correctly spread method metadata into results array in getControllerMethodMetadata", () => {
    class MethodController {
      method1(): void {}
      method2(): void {}
    }
    
    // Add method metadata for only one of the methods
    const methodMetadata: MethodMetadata = {
      target: MethodController,
      method: "method1",
      httpMethod: "get",
      path: "/test",
      middleware: []
    };
    
    metadataStorage.addMethodMetadata(methodMetadata);
    
    // Call getControllerMethodMetadata which will process both methods
    // but only one has metadata (tests the || [] fallback and spreading)
    const methods = metadataStorage.getControllerMethodMetadata(MethodController);
    
    // Verify results
    expect(methods).toBeInstanceOf(Array);
    expect(methods).toHaveLength(1);
    expect(methods[0]).toEqual(methodMetadata);
  });

  // Test for line 141 - getMethodParameterMetadata returning empty array when no parameters are registered
  it("should return empty array from getMethodParameterMetadata when no parameters are registered", () => {
    class NoParamsController {
      testMethod(): void {}
    }
    
    const params = metadataStorage.getMethodParameterMetadata(NoParamsController, "testMethod");
    expect(params).toBeInstanceOf(Array);
    expect(params).toHaveLength(0);
  });

  // Test for line 164 - getMethodMiddleware returning empty array when no middleware is registered
  it("should return empty array from getMethodMiddleware when no middleware is registered", () => {
    class NoMiddlewareController {
      testMethod(): void {}
    }
    
    const middleware = metadataStorage.getMethodMiddleware(NoMiddlewareController, "testMethod");
    expect(middleware).toBeInstanceOf(Array);
    expect(middleware).toHaveLength(0);
  });
}); 