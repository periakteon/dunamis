/**
 * Tests for HTTP method decorators
 */

// Disable decorator signature checks for test file
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MetadataStorage } from "../../src/metadata/MetadataStorage";
import { Get, Post, Put, Delete, Patch, Options, Head } from "../../src/decorators/method";
import { JSONController } from "../../src/decorators/controller";
import { ClassConstructor } from "../../src/types";
import { Request, Response, NextFunction } from "express";

// Mock ClassMethodDecoratorContext interface to match TypeScript 5.0+ expectations
interface MockClassMethodDecoratorContext {
  kind: string;
  name: string | symbol;
  static: boolean;
  private: boolean;
  access: {
    has: (obj: object) => boolean;
    get: (obj: object) => unknown;
  };
  addInitializer: (initializer: () => void) => void;
}

describe("HTTP Method Decorators", () => {
  beforeEach(() => {
    // Clear metadata before each test
    MetadataStorage.getInstance().clear();
  });

  afterEach(() => {
    // Clear metadata after each test
    MetadataStorage.getInstance().clear();
  });

  it("should register GET route metadata", () => {
    // Arrange
    @JSONController("/users")
    class TestController {
      @Get("/profile")
      getProfile() {
        return { id: 1, name: "John" };
      }
    }

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const controller = new TestController();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      controller.constructor as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("get");
    expect(methodMetadata[0].path).toBe("/profile");
    expect(methodMetadata[0].method).toBe("getProfile");
  });

  // New test for Stage 3 decorator format
  it("should handle Stage 3 decorator format correctly", () => {
    // We need to manually simulate the Stage 3 decorator mechanism
    // since we can't directly use it without proper tsconfig settings

    class TestController {
      getProfile() {
        return { id: 1, name: "John" };
      }
    }

    // Create Stage 3 decorator context
    const mockContext: MockClassMethodDecoratorContext = {
      kind: "method",
      name: "getProfile",
      static: false,
      private: false,
      access: { 
        has: () => false, 
        get: () => undefined 
      },
      addInitializer: () => {}
    };

    // Manually apply the decorator to simulate Stage 3 behavior
    const getDecorator = Get("/profile");
    getDecorator(TestController.prototype, mockContext as any);

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      TestController as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("get");
    expect(methodMetadata[0].path).toBe("/profile");
    expect(methodMetadata[0].method).toBe("getProfile");
  });

  it("should register POST route metadata", () => {
    // Arrange
    @JSONController("/users")
    class TestController {
      @Post("/create")
      createUser() {
        return { success: true };
      }
    }

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const controller = new TestController();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      controller.constructor as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("post");
    expect(methodMetadata[0].path).toBe("/create");
    expect(methodMetadata[0].method).toBe("createUser");
  });

  // New test for Stage 3 decorator format with options
  it("should handle Stage 3 decorator format with options correctly", () => {
    // Middleware for testing
    const testMiddleware = (req: Request, res: Response, next: NextFunction) => {
      next();
    };

    class TestController {
      updateUser() {
        return { success: true };
      }
    }

    // Create Stage 3 decorator context
    const mockContext: MockClassMethodDecoratorContext = {
      kind: "method",
      name: "updateUser",
      static: false,
      private: false,
      access: { 
        has: () => false, 
        get: () => undefined 
      },
      addInitializer: () => {}
    };

    // Manually apply the decorator with options to simulate Stage 3 behavior
    const putDecorator = Put({ 
      path: "/update", 
      middleware: [testMiddleware] 
    });
    putDecorator(TestController.prototype, mockContext as any);

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      TestController as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("put");
    expect(methodMetadata[0].path).toBe("/update");
    expect(methodMetadata[0].method).toBe("updateUser");
    expect(methodMetadata[0].middleware).toHaveLength(1);
    expect(methodMetadata[0].middleware[0]).toBe(testMiddleware);
  });

  it("should register PUT route metadata", () => {
    // Arrange
    @JSONController("/users")
    class TestController {
      @Put("/update")
      updateUser() {
        return { success: true };
      }
    }

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const controller = new TestController();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      controller.constructor as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("put");
    expect(methodMetadata[0].path).toBe("/update");
    expect(methodMetadata[0].method).toBe("updateUser");
  });

  it("should register DELETE route metadata", () => {
    // Arrange
    @JSONController("/users")
    class TestController {
      @Delete("/delete")
      deleteUser() {
        return { success: true };
      }
    }

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const controller = new TestController();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      controller.constructor as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("delete");
    expect(methodMetadata[0].path).toBe("/delete");
    expect(methodMetadata[0].method).toBe("deleteUser");
  });

  it("should register PATCH route metadata", () => {
    // Arrange
    @JSONController("/users")
    class TestController {
      @Patch("/update-partial")
      patchUser() {
        return { success: true };
      }
    }

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const controller = new TestController();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      controller.constructor as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("patch");
    expect(methodMetadata[0].path).toBe("/update-partial");
    expect(methodMetadata[0].method).toBe("patchUser");
  });

  it("should register OPTIONS route metadata", () => {
    // Arrange
    @JSONController("/users")
    class TestController {
      @Options("/options")
      optionsHandler() {
        return { success: true };
      }
    }

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const controller = new TestController();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      controller.constructor as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("options");
    expect(methodMetadata[0].path).toBe("/options");
    expect(methodMetadata[0].method).toBe("optionsHandler");
  });

  it("should register HEAD route metadata", () => {
    // Arrange
    @JSONController("/users")
    class TestController {
      @Head("/head")
      headHandler() {
        return { success: true };
      }
    }

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const controller = new TestController();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      controller.constructor as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("head");
    expect(methodMetadata[0].path).toBe("/head");
    expect(methodMetadata[0].method).toBe("headHandler");
  });

  it("should register multiple routes in a controller", () => {
    // Arrange
    @JSONController("/api")
    class TestController {
      @Get("/users")
      getUsers() {
        return [{ id: 1, name: "John" }];
      }

      @Post("/users")
      createUser() {
        return { success: true };
      }

      @Put("/users/:id")
      updateUser() {
        return { success: true };
      }
    }

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const controller = new TestController();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      controller.constructor as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(3);
    // Check GET method
    expect(methodMetadata.find((m) => m.method === "getUsers")?.httpMethod).toBe("get");
    expect(methodMetadata.find((m) => m.method === "getUsers")?.path).toBe("/users");
    // Check POST method
    expect(methodMetadata.find((m) => m.method === "createUser")?.httpMethod).toBe("post");
    expect(methodMetadata.find((m) => m.method === "createUser")?.path).toBe("/users");
    // Check PUT method
    expect(methodMetadata.find((m) => m.method === "updateUser")?.httpMethod).toBe("put");
    expect(methodMetadata.find((m) => m.method === "updateUser")?.path).toBe("/users/:id");
  });

  it("should register middleware for route", () => {
    // Arrange
    const testMiddleware = (req: Request, res: Response, next: NextFunction) => {
      next();
    };

    @JSONController("/users")
    class TestController {
      @Get({
        path: "/profile",
        middleware: [testMiddleware],
      })
      getProfile() {
        return { id: 1, name: "John" };
      }
    }

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const controller = new TestController();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      controller.constructor as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("get");
    expect(methodMetadata[0].path).toBe("/profile");
    expect(methodMetadata[0].middleware).toHaveLength(1);
    expect(methodMetadata[0].middleware[0]).toBe(testMiddleware);
  });

  it("should use empty string when no path is provided", () => {
    // Arrange
    @JSONController("/users")
    class TestController {
      @Get()
      getUsers() {
        return [{ id: 1, name: "John" }];
      }
    }

    // Act
    const metadataStorage = MetadataStorage.getInstance();
    const controller = new TestController();
    const methodMetadata = metadataStorage.getControllerMethodMetadata(
      controller.constructor as ClassConstructor
    );

    // Assert
    expect(methodMetadata).toHaveLength(1);
    expect(methodMetadata[0].httpMethod).toBe("get");
    expect(methodMetadata[0].path).toBe("");
  });
}); 