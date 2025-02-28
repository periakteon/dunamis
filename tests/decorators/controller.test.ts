/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { JSONController, JSONControllerOptions } from "../../src/decorators/controller";
import { MetadataStorage } from "../../src/metadata/MetadataStorage";
import { METADATA_KEY } from "../../src/constants";
import { getMetadata, hasMetadata } from "../../src/utils/metadata";
import { Request, Response, NextFunction } from "express";

const testMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  next();
};

describe("JSONController decorator", () => {
  let metadataStorage: MetadataStorage;

  beforeEach(() => {
    metadataStorage = MetadataStorage.getInstance();
  });

  afterEach(() => {
    // Clear metadata storage after each test
    metadataStorage.clear();
  });

  it("should register a controller with string prefix", () => {
    // Define a controller with the decorator
    @JSONController("/users")
    class UserControllerClass {
      getUsers(): void {}
    }

    // Check that the metadata was defined correctly
    expect(hasMetadata(METADATA_KEY.CONTROLLER, UserControllerClass)).toBe(true);
    expect(getMetadata(METADATA_KEY.CONTROLLER_PREFIX, UserControllerClass)).toBe("/users");
    
    // Check that the controller was registered in the metadata storage
    const controllers = metadataStorage.getControllers();
    expect(controllers.length).toBe(1);
    expect(controllers[0].target).toBe(UserControllerClass);
    expect(controllers[0].prefix).toBe("/users");
    expect(controllers[0].middleware).toEqual([]);
  });

  it("should register a controller with options object", () => {
    const options: JSONControllerOptions = {
      prefix: "/api/products",
      middleware: [testMiddleware]
    };
    
    // Define a controller with the decorator using options
    @JSONController(options)
    class ProductControllerClass {
      getProducts(): void {}
    }

    // Check that the metadata was defined correctly
    expect(hasMetadata(METADATA_KEY.CONTROLLER, ProductControllerClass)).toBe(true);
    expect(getMetadata(METADATA_KEY.CONTROLLER_PREFIX, ProductControllerClass)).toBe("/api/products");
    expect(getMetadata(METADATA_KEY.CONTROLLER_MIDDLEWARE, ProductControllerClass)).toEqual([testMiddleware]);
    
    // Check that the controller was registered in the metadata storage
    const controllers = metadataStorage.getControllers();
    expect(controllers.length).toBe(1);
    expect(controllers[0].target).toBe(ProductControllerClass);
    expect(controllers[0].prefix).toBe("/api/products");
    expect(controllers[0].middleware).toEqual([testMiddleware]);
  });

  it("should register a controller with default empty prefix", () => {
    // Define a controller with the decorator with no arguments
    @JSONController()
    class DefaultControllerClass {
      getDefault(): void {}
    }

    // Check that the metadata was defined correctly
    expect(hasMetadata(METADATA_KEY.CONTROLLER, DefaultControllerClass)).toBe(true);
    expect(getMetadata(METADATA_KEY.CONTROLLER_PREFIX, DefaultControllerClass)).toBe("");
    
    // Check that the controller was registered in the metadata storage
    const controllers = metadataStorage.getControllers();
    expect(controllers.length).toBe(1);
    expect(controllers[0].target).toBe(DefaultControllerClass);
    expect(controllers[0].prefix).toBe("");
    expect(controllers[0].middleware).toEqual([]);
  });

  it("should handle multiple controllers correctly", () => {
    // Define multiple controllers
    @JSONController("/users")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class UserControllerClass {
      getUsers(): void {}
    }

    @JSONController("/posts")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class PostControllerClass {
      getPosts(): void {}
    }

    @JSONController({
      prefix: "/comments",
      middleware: [testMiddleware]
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class CommentControllerClass {
      getComments(): void {}
    }

    // Check that all controllers were registered in the metadata storage
    const controllers = metadataStorage.getControllers();
    expect(controllers.length).toBe(3);

    // Find each controller and verify its metadata
    const userController = controllers.find(c => c.target.name === "UserControllerClass");
    expect(userController).toBeDefined();
    expect(userController?.prefix).toBe("/users");
    
    const postController = controllers.find(c => c.target.name === "PostControllerClass");
    expect(postController).toBeDefined();
    expect(postController?.prefix).toBe("/posts");
    
    const commentController = controllers.find(c => c.target.name === "CommentControllerClass");
    expect(commentController).toBeDefined();
    expect(commentController?.prefix).toBe("/comments");
    expect(commentController?.middleware).toEqual([testMiddleware]);
  });
}); 