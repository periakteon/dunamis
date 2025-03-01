/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { JSONController } from "../../src/decorators/controller";
import { Get, Post } from "../../src/decorators/method";
import { Req, Res, Headers } from "../../src/decorators/param";
import { MetadataStorage } from "../../src/metadata/MetadataStorage";
import { ParamMetadata } from "../../src/metadata/ParamMetadata";
import { METADATA_KEY, ParameterType } from "../../src/constants";
import { getMetadata } from "../../src/utils/metadata";
import { Request, Response } from "express";

// Helper function to create test controller classes with advanced params
function createAdvancedController() {
  @JSONController("/api")
  class AdvancedController {
    @Get("/request")
    requestMethod(@Req() request: Request): void {
      // Method implementation
    }

    @Post("/response")
    responseMethod(@Res() response: Response): void {
      // Method implementation
    }

    @Get("/headers")
    headersMethod(@Headers() headers: Record<string, string>): void {
      // Method implementation
    }

    @Get("/specific-header")
    specificHeaderMethod(@Headers("authorization") auth: string): void {
      // Method implementation
    }

    @Get("/mixed")
    mixedMethod(
      @Req() req: Request,
      @Headers("content-type") contentType: string,
      @Res() res: Response
    ): void {
      // Method implementation
    }
  }
  return AdvancedController;
}

describe("Advanced Parameter Decorators", () => {
  let metadataStorage: MetadataStorage;

  beforeEach(() => {
    metadataStorage = MetadataStorage.getInstance();
  });

  afterEach(() => {
    // Clear metadata storage after each test
    metadataStorage.clear();
  });

  describe("@Req decorator", () => {
    it("should register request parameter metadata", () => {
      const AdvancedController = createAdvancedController();

      const parameters = metadataStorage.getMethodParameterMetadata(AdvancedController, "requestMethod");
      
      expect(parameters.length).toBe(1);
      expect(parameters[0].target).toBe(AdvancedController);
      expect(parameters[0].method).toBe("requestMethod");
      expect(parameters[0].index).toBe(0);
      expect(parameters[0].type).toBe(ParameterType.REQUEST);
      
      // Check that the metadata was also defined using reflection
      expect(getMetadata(METADATA_KEY.PARAMETER_TYPE, AdvancedController, "requestMethod_0")).toBe(ParameterType.REQUEST);
      expect(getMetadata(METADATA_KEY.PARAMETER_INDEX, AdvancedController, "requestMethod_0")).toBe(0);
    });
  });

  describe("@Res decorator", () => {
    it("should register response parameter metadata", () => {
      const AdvancedController = createAdvancedController();

      const parameters = metadataStorage.getMethodParameterMetadata(AdvancedController, "responseMethod");
      
      expect(parameters.length).toBe(1);
      expect(parameters[0].target).toBe(AdvancedController);
      expect(parameters[0].method).toBe("responseMethod");
      expect(parameters[0].index).toBe(0);
      expect(parameters[0].type).toBe(ParameterType.RESPONSE);
      
      // Check that the metadata was also defined using reflection
      expect(getMetadata(METADATA_KEY.PARAMETER_TYPE, AdvancedController, "responseMethod_0")).toBe(ParameterType.RESPONSE);
    });
  });

  describe("@Headers decorator", () => {
    it("should register headers parameter metadata for all headers", () => {
      const AdvancedController = createAdvancedController();

      const parameters = metadataStorage.getMethodParameterMetadata(AdvancedController, "headersMethod");
      
      expect(parameters.length).toBe(1);
      expect(parameters[0].target).toBe(AdvancedController);
      expect(parameters[0].method).toBe("headersMethod");
      expect(parameters[0].index).toBe(0);
      expect(parameters[0].type).toBe(ParameterType.HEADERS);
      expect(parameters[0].name).toBe("0"); // Default to index when no name provided
    });

    it("should register headers parameter metadata for specific header", () => {
      const AdvancedController = createAdvancedController();

      const parameters = metadataStorage.getMethodParameterMetadata(AdvancedController, "specificHeaderMethod");
      
      expect(parameters.length).toBe(1);
      expect(parameters[0].target).toBe(AdvancedController);
      expect(parameters[0].method).toBe("specificHeaderMethod");
      expect(parameters[0].index).toBe(0);
      expect(parameters[0].type).toBe(ParameterType.HEADERS);
      expect(parameters[0].name).toBe("authorization");
    });
  });

  describe("Mixed advanced parameters", () => {
    it("should register multiple different parameters in correct order", () => {
      const AdvancedController = createAdvancedController();

      const parameters = ParamMetadata.getParametersForHandler(AdvancedController, "mixedMethod");
      
      expect(parameters.length).toBe(3);
      
      // Parameters should be sorted by index
      expect(parameters[0].index).toBe(0);
      expect(parameters[0].type).toBe(ParameterType.REQUEST);
      
      expect(parameters[1].index).toBe(1);
      expect(parameters[1].type).toBe(ParameterType.HEADERS);
      expect(parameters[1].name).toBe("content-type");
      
      expect(parameters[2].index).toBe(2);
      expect(parameters[2].type).toBe(ParameterType.RESPONSE);
    });
  });
}); 