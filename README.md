# @periakteon/dunamisjs

A lightweight, decorator-based routing framework for Express.js. This library provides a modern, TypeScript-first approach to defining Express routes using class-based controllers and method decorators.

> **Note:** This framework is currently under development. Documentation will be continuously improved as the project evolves.

## Features

- **Class-based Controllers** - Organize your routes using TypeScript classes
- **Decorator-based Routing** - Define routes with simple, expressive decorators
- **Parameter Injection** - Easily access request data with parameter decorators
- **Type Safety** - Leverage TypeScript's type system for robust API development
- **Express Integration** - Built on top of Express.js for reliability and ecosystem compatibility
- **Middleware Support** - Apply middleware at controller or method level
- **Request Validation** - Seamless integration with Zod for request validation
- **Error Handling** - Centralized error handling with decorators
- **Minimalist Design** - Clean API with minimal boilerplate code

## Installation

```bash
npm install @periakteon/dunamisjs express reflect-metadata zod
```

You'll also need to configure TypeScript to support decorators. Add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Basic Usage

```typescript
import "reflect-metadata";
import { createExpressApp, JSONController, Get, Post, Body, Param } from "@periakteon/dunamisjs";

@JSONController("/users")
class UserController {
  @Get()
  getAll() {
    return { users: [] }; // Returns as JSON automatically
  }

  @Get("/:id")
  getOne(@Param("id") id: string) {
    return { id, name: "Example User" };
  }

  @Post()
  create(@Body() userData: any) {
    return { ...userData, id: "123" };
  }
}

// Create Express app with controllers
const app = createExpressApp({
  controllers: [UserController],
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
```

## Detailed Documentation

### Controllers

Controllers are classes decorated with `@JSONController()` that group related route handlers together.

```typescript
import { JSONController } from "@periakteon/dunamisjs";

@JSONController("/api/products")
class ProductController {
  // Route handlers go here
}
```

The decorator takes an optional base path as its argument. All routes defined in the controller will be prefixed with this path.

### HTTP Method Decorators

Use method decorators to define routes and their HTTP methods:

```typescript
import { JSONController, Get, Post, Put, Delete, Patch } from "@periakteon/dunamisjs";

@JSONController("/api/products")
class ProductController {
  @Get() // Maps to GET /api/products
  getAllProducts() {
    // Logic to get all products
    return { products: [] };
  }

  @Get("/:id") // Maps to GET /api/products/:id
  getProduct(@Param("id") id: string) {
    // Logic to get a specific product
    return { id, name: "Product Name" };
  }

  @Post() // Maps to POST /api/products
  createProduct(@Body() productData: any) {
    // Logic to create a product
    return { id: "123", ...productData };
  }

  @Put("/:id") // Maps to PUT /api/products/:id
  updateProduct(@Param("id") id: string, @Body() productData: any) {
    // Logic to update a product
    return { id, ...productData, updated: true };
  }

  @Delete("/:id") // Maps to DELETE /api/products/:id
  deleteProduct(@Param("id") id: string) {
    // Logic to delete a product
    return { id, deleted: true };
  }

  @Patch("/:id") // Maps to PATCH /api/products/:id
  partialUpdateProduct(@Param("id") id: string, @Body() partialData: any) {
    // Logic for partial update
    return { id, ...partialData, patched: true };
  }
}
```

### Parameter Decorators

Parameter decorators allow you to extract data from the request and inject it into your route handlers:

```typescript
import {
  JSONController,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  Res,
  Headers,
} from "@periakteon/dunamisjs";
import { Request, Response } from "express";

@JSONController("/api")
class ExampleController {
  @Get("/items/:id")
  getItem(
    @Param("id") id: string, // URL parameter
    @Query("fields") fields?: string, // Query parameter (?fields=...)
    @Headers("authorization") auth?: string // Request header
  ) {
    return { id, fields, authProvided: !!auth };
  }

  @Post("/items")
  createItem(@Body() itemData: any) {
    // Request body
    return { created: true, item: itemData };
  }

  @Get("/advanced")
  advancedExample(
    @Req() req: Request, // Express Request object
    @Res() res: Response // Express Response object
  ) {
    // When using @Res(), you should handle the response manually
    res.status(200).json({ message: "Using raw Express objects" });
  }
}
```

Available parameter decorators:

- `@Param(name)`: URL parameters
- `@Query(name)`: Query string parameters
- `@Body()`: Request body
- `@Headers(name)`: Request headers
- `@Req()`: Express Request object
- `@Res()`: Express Response object

### Middleware

Middleware can be applied at both controller and method levels using the `@UseMiddleware` decorator:

```typescript
import { JSONController, Get, UseMiddleware } from "@periakteon/dunamisjs";
import { Request, Response, NextFunction } from "express";

// Define middleware functions
function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Validate token logic would go here
  next();
}

// Apply middleware to controller or methods
@JSONController("/api/secure")
@UseMiddleware(loggingMiddleware) // Applied to all routes in this controller
class SecureController {
  @Get("/public")
  publicRoute() {
    return { message: "This route only has logging middleware" };
  }

  @Get("/private")
  @UseMiddleware(authMiddleware) // Applied only to this method
  privateRoute() {
    return { message: "This route has both logging and auth middleware" };
  }

  // You can also apply multiple middleware functions at once
  @Get("/admin")
  @UseMiddleware([
    authMiddleware,
    (req, res, next) => {
      // Check if user is admin
      if (req.headers["user-role"] !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    },
  ])
  adminRoute() {
    return { message: "Admin-only route" };
  }
}
```

You can also apply middleware when creating controllers:

```typescript
@JSONController({
  prefix: "/api/protected",
  middleware: [authMiddleware],
})
class ProtectedController {
  // All routes will have the authMiddleware applied
}
```

And when defining routes:

```typescript
@Get({
  path: "/logs",
  middleware: [loggingMiddleware]
})
getLogs() {
  return { logs: [] };
}
```

Additionally, you can apply global middleware when creating your Express app:

```typescript
const app = createExpressApp({
  controllers: [UserController],
  globalMiddleware: [
    (req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    },
  ],
});
```

### Request Validation with Zod

Dunamis.js integrates with Zod for request validation:

```typescript
import { JSONController, Post, Body } from "@periakteon/dunamisjs";
import { z } from "zod";

// Define Zod schema for validation
const UserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});

// Infer TypeScript type from Zod schema
type User = z.infer<typeof UserSchema>;

@JSONController("/api/users")
class UserController {
  @Post()
  @ValidateBody(UserSchema) // Validate request body against schema
  createUser(@Body() userData: User) {
    // Type-safe access to validated data
    // If validation fails, an error is automatically thrown
    // and the handler is not executed
    return {
      message: "User created successfully",
      user: userData,
    };
  }
}
```

When validation fails, a 400 Bad Request response is sent with details about the validation errors.

### Error Handling

Use the `@ErrorHandler()` decorator to implement centralized error handling for controllers:

```typescript
import { JSONController, Get, ErrorHandler, HttpError } from "@periakteon/dunamisjs";

@JSONController("/api/example")
@ErrorHandler() // Enable error handling for this controller
class ExampleController {
  @Get("/safe")
  safeRoute() {
    return { message: "This works fine" };
  }

  @Get("/error")
  errorRoute() {
    // This error will be caught and formatted as JSON
    throw new HttpError(404, "Resource not found");
  }

  @Get("/unexpected")
  unexpectedError() {
    // Even unexpected errors are handled
    throw new Error("Something went wrong");
  }

  // Optional: Custom error handler method
  handleError(error: Error) {
    if (error instanceof HttpError) {
      return {
        message: error.message,
        status: error.statusCode,
      };
    }

    // Handle unexpected errors
    console.error("Unexpected error:", error);
    return {
      message: "Internal server error",
      status: 500,
    };
  }
}
```

The error response will be automatically formatted as JSON with the following structure:

```json
{
  "message": "Error message",
  "status": 404
}
```

## Complete Example

Here's a more complete example showing multiple features together:

```typescript
import "reflect-metadata";
import {
  createExpressApp,
  JSONController,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseMiddleware,
  ErrorHandler,
  HttpError,
  ValidateBody,
} from "@periakteon/dunamisjs";
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Auth middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Validation schema
const ProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  description: z.string().optional(),
});

type Product = z.infer<typeof ProductSchema>;

@JSONController("/api/products")
@UseMiddleware(authMiddleware) // Apply auth to all routes
@ErrorHandler() // Enable error handling
class ProductController {
  // In-memory product store for demo
  private products: Record<string, Product> = {};
  private nextId = 1;

  @Get()
  getAllProducts(@Query("sort") sort?: string) {
    let productList = Object.entries(this.products).map(([id, data]) => ({
      id,
      ...data,
    }));

    if (sort === "price") {
      productList = productList.sort((a, b) => a.price - b.price);
    }

    return { products: productList };
  }

  @Get("/:id")
  getProduct(@Param("id") id: string) {
    const product = this.products[id];
    if (!product) {
      throw new HttpError(404, `Product with ID ${id} not found`);
    }
    return { id, ...product };
  }

  @Post()
  @ValidateBody(ProductSchema)
  createProduct(@Body() productData: Product) {
    const id = String(this.nextId++);
    this.products[id] = productData;
    return { id, ...productData };
  }
}

// Create and start app
const app = createExpressApp({
  controllers: [ProductController],
  // Optional global middleware
  globalMiddleware: [
    (req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    },
  ],
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

## API Reference

For a complete list of all decorators and functions, see the following sections:

### Core Functions

- `createExpressApp(options)`: Creates and configures an Express application

### Application Configuration

The `createExpressApp` function accepts a configuration object with the following options:

- **controllers** (required): Array of controller classes to register with the application

  ```typescript
  controllers: [UserController, ProductController];
  ```

- **routePrefix** (optional): Global route prefix applied to all controllers

  ```typescript
  routePrefix: "/api/v1";
  ```

- **globalMiddleware** (optional): Array of middleware functions applied to all routes

  ```typescript
  globalMiddleware: [loggingMiddleware, authMiddleware];
  ```

- **cors** (optional): CORS middleware configuration

  - `true`: Enables CORS with default settings
  - `object`: Enables CORS with custom options
  - `false` or omitted: CORS is disabled

  ```typescript
  // Default configuration
  cors: true

  // Custom configuration
  cors: {
    origin: ['https://example.com', 'https://dev.example.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
  ```

- **helmet** (optional): Helmet middleware for security headers

  - `true`: Enables Helmet with default settings
  - `object`: Enables Helmet with custom options
  - `false` or omitted: Helmet is disabled

  ```typescript
  // Default configuration
  helmet: true

  // Custom configuration
  helmet: {
    contentSecurityPolicy: false,
    xssFilter: true
  }
  ```

- **bodyParser** (optional, defaults to `true`): Body parsing middleware configuration

  - `true`: Enables body parsing with default settings (JSON and URL-encoded)
  - `object`: Custom configuration for JSON and URL-encoded parsers
  - `false`: Body parsing is disabled

  ```typescript
  // Default configuration
  bodyParser: true

  // Custom configuration
  bodyParser: {
    json: { limit: '10mb', strict: true },
    urlencoded: { extended: true, limit: '10mb' }
  }
  ```

- **logger** (optional): Request logging middleware (requires 'morgan' package)

  - `true`: Enables logging with default format ('dev')
  - `string`: Uses the specified format string
  - `object`: Passes custom options to morgan
  - `false` or omitted: Logging is disabled

  ```typescript
  // Default format ('dev')
  logger: true

  // Custom format
  logger: 'combined'

  // Custom options
  logger: {
    format: 'combined',
    skip: (req, res) => res.statusCode < 400
  }
  ```

- **errorHandler** (optional): Global error handling middleware
  - `true`: Enables the default error handler
  - `false` or omitted: No error handler is applied
  ```typescript
  errorHandler: true;
  ```

Example configuration:

```typescript
const app = createExpressApp({
  controllers: [UserController, ProductController],
  routePrefix: "/api/v1",
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  helmet: true,
  bodyParser: {
    json: { limit: "1mb" },
    urlencoded: { extended: true },
  },
  logger: "dev",
  errorHandler: true,
  globalMiddleware: [
    (req, res, next) => {
      console.log(`Request: ${req.method} ${req.path}`);
      next();
    },
  ],
});
```

### Controller Decorators

- `@JSONController(basePath?)`: Creates a controller with JSON response type

### Method Decorators

- `@Get(path?)`: Maps a method to GET requests
- `@Post(path?)`: Maps a method to POST requests
- `@Put(path?)`: Maps a method to PUT requests
- `@Delete(path?)`: Maps a method to DELETE requests
- `@Patch(path?)`: Maps a method to PATCH requests

### Parameter Decorators

- `@Param(name)`: Injects URL parameters
- `@Query(name)`: Injects query parameters
- `@Body()`: Injects request body
- `@Headers(name)`: Injects request headers
- `@Req()`: Injects Express Request object
- `@Res()`: Injects Express Response object

### Middleware Decorators

- `@UseMiddleware(middleware)`: Applies middleware to a controller or method

### Validation Decorators

- `@ValidateBody(schema)`: Validates request body using Zod schema
- `@ValidateParams(schema)`: Validates URL parameters using Zod schema
- `@ValidateQuery(schema)`: Validates query parameters using Zod schema

### Error Handling

- `@ErrorHandler()`: Enables error handling for a controller
- `HttpError`: Custom error class for HTTP errors

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automatic versioning and package publishing. The release process is triggered automatically when commits are pushed to the `main` branch.

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification which is used by semantic-release to determine the next version number and generate changelogs. Your commit messages should be structured as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types that trigger releases:

- `fix:` - represents bug fixes (correlates to PATCH in SemVer)
- `feat:` - represents a new feature (correlates to MINOR in SemVer)
- `feat!:`, `fix!:`, `refactor!:`, etc. - represents breaking changes (correlates to MAJOR in SemVer)

Examples:

- `fix(router): fix route parameter extraction`
- `feat(decorators): add new @Session() decorator`
- `feat!: redesign middleware API`

Other types that don't trigger releases:

- `docs:` - documentation changes
- `style:` - changes that don't affect code functionality (formatting, etc.)
- `refactor:` - code changes that neither fix bugs nor add features
- `test:` - adding or correcting tests
- `chore:` - maintenance tasks

Please refer to the [semantic-release](https://github.com/semantic-release/semantic-release) documentation for more information on the release process.

## License

MIT
