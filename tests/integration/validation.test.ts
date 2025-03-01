/**
 * Integration tests for Zod validation with Express app
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createExpressApp } from "../../src/express/createExpressApp";
import { JSONController } from "../../src/decorators/controller";
import { Get, Post } from "../../src/decorators/method";
import { Body, Param, Query, Req } from "../../src/decorators/param";
import { ValidateBody, ValidateParams, ValidateQuery } from "../../src/decorators/validation";
import { z } from "zod";
import { Express, Request } from "express";

// Define Zod schemas
const UserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

// Query parameters in Express are typically string or string arrays
const SearchSchema = z.object({
  query: z.string().min(1),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

// Route parameters are strings by default
const UserIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Create test controllers with validation
@JSONController("/api/users")
class UserController {
  @Post()
  @ValidateBody(UserSchema)
  createUser(@Body() user: z.infer<typeof UserSchema>) {
    return {
      success: true,
      user: {
        id: 1,
        ...user
      }
    };
  }

  @Get()
  @ValidateQuery(SearchSchema)
  searchUsers(@Req() req: Request) {
    // Using req.query which is validated through the ValidateQuery decorator
    return {
      success: true,
      params: req.query,
      results: [
        { id: 1, name: "User 1" },
        { id: 2, name: "User 2" }
      ],
      pagination: {
        page: req.query.page,
        limit: req.query.limit,
        total: 2
      }
    };
  }

  @Get("/:id")
  @ValidateParams(UserIdSchema)
  getUserById(@Param("id") id: number) {
    return {
      success: true,
      user: {
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`
      }
    };
  }

  @Post("/multiple-validations")
  @ValidateBody(UserSchema)
  @ValidateQuery(
    z.object({
      dryRun: z.coerce.boolean().default(false)
    })
  )
  createUserWithOptions(
    @Body() user: z.infer<typeof UserSchema>,
    @Query("dryRun") dryRun: boolean
  ) {
    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        validatedUser: user
      };
    }
    
    return {
      success: true,
      dryRun: false,
      user: {
        id: 1,
        ...user
      }
    };
  }
}

describe("Zod Validation Integration", () => {
  let app: Express;

  beforeEach(() => {
    // Create Express app with validation controller
    app = createExpressApp({
      controllers: [UserController],
      bodyParser: true,
      errorHandler: true // Use the built-in error handler
    });
  });

  describe("Body validation", () => {
    it("should accept valid request body", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({
          name: "John Doe",
          email: "john@example.com",
          age: 30
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        user: {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          age: 30
        }
      });
    });

    it("should reject invalid request body", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({
          name: "Jo", // too short
          email: "not-an-email"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Validation failed for body");
      expect(response.body).toHaveProperty("errors");
    });

    it("should strip unknown properties by default", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({
          name: "John Doe",
          email: "john@example.com",
          unknownProp: "should be removed"
        });

      expect(response.status).toBe(200);
      expect(response.body.user).not.toHaveProperty("unknownProp");
    });
  });

  describe("Query validation", () => {
    it("should validate and transform query parameters", async () => {
      const response = await request(app)
        .get("/api/users?query=test&page=2&limit=20");

      expect(response.status).toBe(200);
      // Express query params are strings by default, but zod transforms them
      expect(response.body.params).toEqual({
        query: "test",
        page: 2,
        limit: 20
      });
    });

    it("should apply default values for missing query parameters", async () => {
      const response = await request(app)
        .get("/api/users?query=test");

      expect(response.status).toBe(200);
      expect(response.body.params).toEqual({
        query: "test",
        page: 1,
        limit: 10
      });
    });

    it("should reject invalid query parameters", async () => {
      const response = await request(app)
        .get("/api/users");

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Validation failed for query");
    });
  });

  describe("Params validation", () => {
    it("should validate and transform route parameters", async () => {
      const response = await request(app)
        .get("/api/users/123");

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        id: 123,
        name: "User 123",
        email: "user123@example.com"
      });
    });

    it("should reject invalid route parameters", async () => {
      const response = await request(app)
        .get("/api/users/abc");

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Validation failed for params");
    });
  });

  describe("Multiple validations", () => {
    it("should handle multiple validation decorators", async () => {
      const response = await request(app)
        .post("/api/users/multiple-validations?dryRun=true")
        .send({
          name: "John Doe",
          email: "john@example.com"
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        dryRun: true,
        validatedUser: {
          name: "John Doe",
          email: "john@example.com"
        }
      });
    });

    it("should validate both body and query", async () => {
      const response = await request(app)
        .post("/api/users/multiple-validations")
        .send({
          name: "Jo", // Invalid (too short)
          email: "john@example.com"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Validation failed for body");
    });
  });
}); 