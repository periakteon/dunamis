import { describe, it, expect, beforeEach } from "vitest";
import { MetadataStorage } from "../../src/metadata/MetadataStorage";
import { 
  ControllerMetadata, 
  MethodMetadata, 
  ParameterMetadata,
  MiddlewareMetadata
} from "../../src/metadata/types";
import { ParameterType } from "../../src/constants";
import { Request, Response, NextFunction } from "express";

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
}); 