import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UseMiddleware } from "../../src/decorators/middleware";
import { JSONController } from "../../src/decorators/controller";
import { Get, Post } from "../../src/decorators/method";
import { MetadataStorage } from "../../src/metadata/MetadataStorage";
import { METADATA_KEY } from "../../src/constants";
import { getMetadata } from "../../src/utils/metadata";
import { Response, NextFunction } from "express";
import { Request } from "../../src/express/types";

// Define test middleware functions
const loggerMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  console.log(`${req.method} ${req.path}`);
  next();
};

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.headers.authorization) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const validateUserMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body?.name && req.body?.email) {
    next();
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

describe("UseMiddleware decorator", () => {
  let metadataStorage: MetadataStorage;

  beforeEach(() => {
    metadataStorage = MetadataStorage.getInstance();
  });

  afterEach(() => {
    // Clear metadata storage after each test
    metadataStorage.clear();
  });

  describe("Controller level middleware", () => {
    it("should apply middleware to a controller with a single middleware", () => {
      // Define a controller with middleware
      @UseMiddleware(loggerMiddleware)
      @JSONController("/users")
      class UserController {
        getUsers(): void {}
      }

      // Check that the middleware was defined correctly in the metadata
      const controllerMiddleware = getMetadata<Function[]>(
        METADATA_KEY.CONTROLLER_MIDDLEWARE,
        UserController
      );
      expect(controllerMiddleware).toBeDefined();
      expect(controllerMiddleware?.length).toBe(1);
      expect(controllerMiddleware?.[0]).toBe(loggerMiddleware);

      // Check that middleware was registered in the metadata storage
      const middleware = metadataStorage.getControllerMiddleware(UserController);
      expect(middleware.length).toBe(1);
      expect(middleware[0].middleware).toBe(loggerMiddleware);
      expect(middleware[0].target).toBe(UserController);
      expect(middleware[0].method).toBeUndefined();
    });

    it("should apply middleware to a controller with multiple middleware", () => {
      // Define a controller with multiple middleware
      @UseMiddleware([loggerMiddleware, authMiddleware])
      @JSONController("/api")
      class ApiController {
        getData(): void {}
      }

      // Check that the middleware was defined correctly in the metadata
      const controllerMiddleware = getMetadata<Function[]>(
        METADATA_KEY.CONTROLLER_MIDDLEWARE,
        ApiController
      );
      expect(controllerMiddleware).toBeDefined();
      expect(controllerMiddleware?.length).toBe(2);
      expect(controllerMiddleware?.[0]).toBe(loggerMiddleware);
      expect(controllerMiddleware?.[1]).toBe(authMiddleware);

      // Check that middleware was registered in the metadata storage
      const middleware = metadataStorage.getControllerMiddleware(ApiController);
      expect(middleware.length).toBe(2);
      expect(middleware[0].middleware).toBe(loggerMiddleware);
      expect(middleware[1].middleware).toBe(authMiddleware);
    });

    it("should combine middleware from controller decorator and UseMiddleware decorator", () => {
      // Define a controller with middleware in both decorators
      @UseMiddleware(loggerMiddleware)
      @JSONController({
        prefix: "/products",
        middleware: [authMiddleware]
      })
      class ProductController {
        getProducts(): void {}
      }

      // Check that the middleware was combined correctly
      const controllerMiddleware = getMetadata<Function[]>(
        METADATA_KEY.CONTROLLER_MIDDLEWARE,
        ProductController
      );
      expect(controllerMiddleware).toBeDefined();
      expect(controllerMiddleware?.length).toBe(2);
      expect(controllerMiddleware).toContain(loggerMiddleware);
      expect(controllerMiddleware).toContain(authMiddleware);

      // Check that middleware was registered in the metadata storage
      const storedMiddleware = metadataStorage.getControllerMiddleware(ProductController);
      expect(storedMiddleware.length).toBe(2);
      
      // One middleware comes from the controller decorator, one from UseMiddleware
      const middlewareFunctions = storedMiddleware.map(m => m.middleware);
      expect(middlewareFunctions).toContain(loggerMiddleware);
      expect(middlewareFunctions).toContain(authMiddleware);
    });
  });

  describe("Method level middleware", () => {
    it("should apply middleware to a controller method with a single middleware", () => {
      // Define a controller with a method that has middleware
      @JSONController("/users")
      class UserController {
        @UseMiddleware(authMiddleware)
        @Get("/:id")
        getUser(): void {}
      }

      // Check that the middleware was defined correctly in the metadata
      const methodKey = `${METADATA_KEY.METHOD_MIDDLEWARE}:getUser`;
      const methodMiddleware = getMetadata<Function[]>(methodKey, UserController);
      expect(methodMiddleware).toBeDefined();
      expect(methodMiddleware?.length).toBe(1);
      expect(methodMiddleware?.[0]).toBe(authMiddleware);

      // Check that middleware was registered in the metadata storage
      const middleware = metadataStorage.getMethodMiddleware(UserController, "getUser");
      expect(middleware.length).toBe(1);
      expect(middleware[0].middleware).toBe(authMiddleware);
      expect(middleware[0].target).toBe(UserController);
      expect(middleware[0].method).toBe("getUser");
    });

    it("should apply middleware to a controller method with multiple middleware", () => {
      // Define a controller with a method that has multiple middleware
      @JSONController("/users")
      class UserController {
        @UseMiddleware([authMiddleware, validateUserMiddleware])
        @Post("")
        createUser(): void {}
      }

      // Check that the middleware was defined correctly in the metadata
      const methodKey = `${METADATA_KEY.METHOD_MIDDLEWARE}:createUser`;
      const methodMiddleware = getMetadata<Function[]>(methodKey, UserController);
      expect(methodMiddleware).toBeDefined();
      expect(methodMiddleware?.length).toBe(2);
      expect(methodMiddleware?.[0]).toBe(authMiddleware);
      expect(methodMiddleware?.[1]).toBe(validateUserMiddleware);

      // Check that middleware was registered in the metadata storage
      const middleware = metadataStorage.getMethodMiddleware(UserController, "createUser");
      expect(middleware.length).toBe(2);
      expect(middleware[0].middleware).toBe(authMiddleware);
      expect(middleware[1].middleware).toBe(validateUserMiddleware);
    });

    it("should apply different middleware to different methods", () => {
      // Define a controller with multiple methods that have different middleware
      @UseMiddleware(loggerMiddleware)
      @JSONController("/api/products")
      class ProductController {
        @Get("")
        getAllProducts(): void {}

        @UseMiddleware(authMiddleware)
        @Post("")
        createProduct(): void {}

        @UseMiddleware([authMiddleware, validateUserMiddleware])
        @Get("/admin")
        getAdminProducts(): void {}
      }

      // Check controller middleware
      const controllerMiddleware = metadataStorage.getControllerMiddleware(ProductController);
      expect(controllerMiddleware.length).toBe(1);
      expect(controllerMiddleware[0].middleware).toBe(loggerMiddleware);

      // Check getAllProducts method (should have no method-specific middleware)
      const getAllProductsMiddleware = metadataStorage.getMethodMiddleware(
        ProductController,
        "getAllProducts"
      );
      expect(getAllProductsMiddleware.length).toBe(0);

      // Check createProduct method
      const createProductMiddleware = metadataStorage.getMethodMiddleware(
        ProductController,
        "createProduct"
      );
      expect(createProductMiddleware.length).toBe(1);
      expect(createProductMiddleware[0].middleware).toBe(authMiddleware);

      // Check getAdminProducts method
      const getAdminProductsMiddleware = metadataStorage.getMethodMiddleware(
        ProductController,
        "getAdminProducts"
      );
      expect(getAdminProductsMiddleware.length).toBe(2);
      expect(getAdminProductsMiddleware[0].middleware).toBe(authMiddleware);
      expect(getAdminProductsMiddleware[1].middleware).toBe(validateUserMiddleware);
    });
  });
}); 