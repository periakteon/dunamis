/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { JSONController } from "../../src/decorators/controller";
import { Get, Post } from "../../src/decorators/method";
import { Param, Query, Body, ParameterOptions } from "../../src/decorators/param";
import { MetadataStorage } from "../../src/metadata/MetadataStorage";
import { ParamMetadata } from "../../src/metadata/ParamMetadata";
import { METADATA_KEY, ParameterType } from "../../src/constants";
import { getMetadata } from "../../src/utils/metadata";

// Helper function to create test controller classes
// This avoids the TypeScript error with decorators in test files
function createUserController(options?: ParameterOptions) {
  @JSONController("/users")
  class UserController {
    @Get("/:id")
    getUser(@Param("id", options) id: string): void {
      // Method implementation
    }

    @Get("/")
    getUsers(
      @Query("page") page: number,
      @Query("limit") limit: number
    ): void {
      // Method implementation
    }

    @Post("/")
    createUser(@Body() userData: any): void {
      // Method implementation
    }

    @Post("/register")
    registerUser(@Body("email") email: string): void {
      // Method implementation
    }
  }
  return UserController;
}

function createTestController() {
  @JSONController("/api")
  class TestController {
    @Get("/test")
    testMethod(
      @Query("q") query: string,
      @Param("id") id: string,
      @Body() body: any
    ): void {
      // Method implementation
    }

    @Get("/filter")
    filterMethod(
      @Query("q1") query1: string,
      @Query("q2") query2: string,
      @Param("id") id: string,
      @Body() body: any
    ): void {
      // Method implementation
    }
  }
  return TestController;
}

describe("Parameter decorators", () => {
  let metadataStorage: MetadataStorage;

  beforeEach(() => {
    metadataStorage = MetadataStorage.getInstance();
  });

  afterEach(() => {
    // Clear metadata storage after each test
    metadataStorage.clear();
  });

  describe("@Param decorator", () => {
    it("should register route parameter metadata", () => {
      // Define a controller with a method using @Param
      const UserController = createUserController();

      // Get the parameter metadata
      const parameters = metadataStorage.getMethodParameterMetadata(UserController, "getUser");
      
      // Verify the parameter metadata
      expect(parameters.length).toBe(1);
      expect(parameters[0].target).toBe(UserController);
      expect(parameters[0].method).toBe("getUser");
      expect(parameters[0].index).toBe(0);
      expect(parameters[0].type).toBe(ParameterType.PARAM);
      expect(parameters[0].name).toBe("id");
      
      // Check that the metadata was also defined using reflection
      expect(getMetadata(METADATA_KEY.PARAMETER_TYPE, UserController, "getUser_0")).toBe(ParameterType.PARAM);
      expect(getMetadata(METADATA_KEY.PARAMETER_NAME, UserController, "getUser_0")).toBe("id");
      expect(getMetadata(METADATA_KEY.PARAMETER_INDEX, UserController, "getUser_0")).toBe(0);
    });

    it("should register route parameter with options", () => {
      const options: ParameterOptions = {
        required: false,
        defaultValue: "default-id"
      };
      
      const UserController = createUserController(options);

      const parameters = metadataStorage.getMethodParameterMetadata(UserController, "getUser");
      
      expect(parameters[0].options).toBeDefined();
      expect(parameters[0].options?.required).toBe(false);
      expect(parameters[0].options?.defaultValue).toBe("default-id");
      
      // Check that the options were also defined using reflection
      const storedOptions = getMetadata(METADATA_KEY.PARAMETER_OPTIONS, UserController, "getUser_0");
      expect(storedOptions).toEqual(options);
    });
  });

  describe("@Query decorator", () => {
    it("should register query parameter metadata", () => {
      const UserController = createUserController();

      const parameters = metadataStorage.getMethodParameterMetadata(UserController, "getUsers");
      
      expect(parameters.length).toBe(2);
      
      // Sort parameters by index to ensure consistent order
      const sortedParams = [...parameters].sort((a, b) => a.index - b.index);
      
      // First parameter (page)
      expect(sortedParams[0].target).toBe(UserController);
      expect(sortedParams[0].method).toBe("getUsers");
      expect(sortedParams[0].index).toBe(0);
      expect(sortedParams[0].type).toBe(ParameterType.QUERY);
      expect(sortedParams[0].name).toBe("page");
      
      // Second parameter (limit)
      expect(sortedParams[1].target).toBe(UserController);
      expect(sortedParams[1].method).toBe("getUsers");
      expect(sortedParams[1].index).toBe(1);
      expect(sortedParams[1].type).toBe(ParameterType.QUERY);
      expect(sortedParams[1].name).toBe("limit");
    });
  });

  describe("@Body decorator", () => {
    it("should register body parameter metadata for full body", () => {
      const UserController = createUserController();

      const parameters = metadataStorage.getMethodParameterMetadata(UserController, "createUser");
      
      expect(parameters.length).toBe(1);
      expect(parameters[0].target).toBe(UserController);
      expect(parameters[0].method).toBe("createUser");
      expect(parameters[0].index).toBe(0);
      expect(parameters[0].type).toBe(ParameterType.BODY);
      expect(parameters[0].name).toBe("0"); // Default to index when no name is provided
    });

    it("should register body parameter metadata for specific property", () => {
      const UserController = createUserController();

      const parameters = metadataStorage.getMethodParameterMetadata(UserController, "registerUser");
      
      expect(parameters.length).toBe(1);
      expect(parameters[0].name).toBe("email");
    });
  });

  describe("ParamMetadata utility class", () => {
    it("should get parameters sorted by index", () => {
      const TestController = createTestController();

      const parameters = ParamMetadata.getParametersForHandler(TestController, "testMethod");
      
      expect(parameters.length).toBe(3);
      expect(parameters[0].index).toBe(0);
      expect(parameters[1].index).toBe(1);
      expect(parameters[2].index).toBe(2);
    });

    it("should filter parameters by type", () => {
      const TestController = createTestController();

      const queryParams = ParamMetadata.getParametersWithType(
        TestController,
        "filterMethod",
        ParameterType.QUERY
      );
      
      expect(queryParams.length).toBe(2);
      expect(queryParams[0].name).toBe("q1");
      expect(queryParams[1].name).toBe("q2");
    });
  });
}); 