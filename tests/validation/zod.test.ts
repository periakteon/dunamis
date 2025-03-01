import { describe, test, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationType, createZodValidationMiddleware } from "../../src/validation/zod";
import { HttpError } from "../../src/error/HttpError";

describe("Zod Validation", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  test("should validate body and pass validation if valid", () => {
    const schema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
    });

    const middleware = createZodValidationMiddleware(schema, ValidationType.BODY);
    
    req.body = {
      name: "John Doe",
      email: "john@example.com",
    };

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    expect(req.body).toEqual({
      name: "John Doe",
      email: "john@example.com",
    });
  });

  test("should validate and transform values if schema has transforms", () => {
    const schema = z.object({
      age: z.string().transform(val => parseInt(val, 10)),
      isActive: z.enum(["true", "false"]).transform(val => val === "true"),
    });

    const middleware = createZodValidationMiddleware(schema, ValidationType.QUERY);
    
    req.query = {
      age: "25",
      isActive: "true",
    };

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query).toEqual({
      age: 25,
      isActive: true,
    });
  });

  test("should fail validation if data is invalid", () => {
    const schema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
    });

    const middleware = createZodValidationMiddleware(schema, ValidationType.BODY);
    
    req.body = {
      name: "Jo", // Too short
      email: "not-an-email",
    };

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    const error = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpError;
    
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toContain("Validation failed for body");
    expect(error.data).toBeDefined();
    expect(error.data!.errors).toBeDefined();
  });

  test("should strip unknown properties if stripUnknown is true", () => {
    const schema = z.object({
      name: z.string(),
      email: z.string(),
    });

    const middleware = createZodValidationMiddleware(schema, ValidationType.BODY, {
      stripUnknown: true,
    });
    
    req.body = {
      name: "John Doe",
      email: "john@example.com",
      extraProp: "should be removed",
    };

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({
      name: "John Doe",
      email: "john@example.com",
    });
    expect(req.body).not.toHaveProperty("extraProp");
  });

  test("should keep unknown properties if stripUnknown is false", () => {
    const schema = z.object({
      name: z.string(),
      email: z.string(),
    }).passthrough();

    const middleware = createZodValidationMiddleware(schema, ValidationType.BODY, {
      stripUnknown: false,
    });
    
    req.body = {
      name: "John Doe",
      email: "john@example.com",
      extraProp: "should be kept",
    };

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toHaveProperty("extraProp");
    expect(req.body.extraProp).toBe("should be kept");
  });

  test("should use custom error status code if provided", () => {
    const schema = z.object({
      id: z.string().uuid(),
    });

    const middleware = createZodValidationMiddleware(schema, ValidationType.PARAMS, {
      errorStatus: 422, // Unprocessable Entity
    });
    
    req.params = {
      id: "not-a-uuid",
    };

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    const error = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpError;
    
    expect(error.status).toBe(422);
  });
}); 