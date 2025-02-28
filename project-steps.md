# Implementation Plan for Minimalist Express.js Decorator-Based Framework

## Project Setup and Infrastructure

- [x] Step 1: Initialize Project Structure

  - **Task**: Set up the basic project structure with TypeScript, Express.js, and necessary development dependencies
  - **Files**:
    - `package.json`: Define project metadata and dependencies
    - `tsconfig.json`: Configure TypeScript with decorator support
    - `.gitignore`: Standard Git ignore file
    - `README.md`: Basic project documentation
    - `.eslintrc.js`: ESLint configuration
    - `.prettierrc`: Prettier configuration
    - `src/index.ts`: Main entry point for the library
  - **Step Dependencies**: None
  - **User Instructions**: Run `npm install` after this step to install dependencies

- [ ] Step 2: Setup Build and Test Infrastructure
  - **Task**: Configure build tools, testing framework, and CI setup
  - **Files**:
    - `vitest.config.ts`: Vitest configuration
    - `tsup.config.ts`: Build configuration using tsup
    - `.github/workflows/ci.yml`: GitHub Actions CI workflow
    - `src/types/index.ts`: Type definitions file
    - `scripts/build.js`: Build script
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

## Core Decorator System

- [ ] Step 3: Implement Metadata Storage

  - **Task**: Create a metadata storage system to track decorated controllers and methods
  - **Files**:
    - `src/metadata/MetadataStorage.ts`: Main metadata storage class
    - `src/metadata/types.ts`: Types for stored metadata
    - `src/constants.ts`: Constants used throughout the framework
    - `src/utils/metadata.ts`: Utility functions for metadata handling
  - **Step Dependencies**: Step 2
  - **User Instructions**: None

- [ ] Step 4: Implement Controller Decorators

  - **Task**: Create the @JSONController decorator for defining controller classes
  - **Files**:
    - `src/decorators/controller.ts`: Controller decorator definitions
    - `src/decorators/index.ts`: Export file for decorators
    - `test/decorators/controller.test.ts`: Tests for controller decorators
  - **Step Dependencies**: Step 3
  - **User Instructions**: None

- [ ] Step 5: Implement HTTP Method Decorators

  - **Task**: Create @Get, @Post, @Put, @Delete, and @Patch decorators for HTTP methods
  - **Files**:
    - `src/decorators/method.ts`: HTTP method decorator definitions
    - `src/metadata/MethodMetadata.ts`: Method metadata storage
    - `test/decorators/method.test.ts`: Tests for method decorators
  - **Step Dependencies**: Step 4
  - **User Instructions**: None

- [ ] Step 6: Implement Parameter Decorators - Basic

  - **Task**: Create @Param, @Query, @Body decorators for accessing request data
  - **Files**:
    - `src/decorators/param.ts`: Parameter decorator definitions
    - `src/metadata/ParamMetadata.ts`: Parameter metadata storage
    - `test/decorators/param.test.ts`: Tests for parameter decorators
  - **Step Dependencies**: Step 5
  - **User Instructions**: None

- [ ] Step 7: Implement Parameter Decorators - Advanced
  - **Task**: Create @Req, @Res, @Headers decorators for accessing request/response objects
  - **Files**:
    - `src/decorators/param.ts`: (Update) Add new parameter decorators
    - `test/decorators/param-advanced.test.ts`: Tests for advanced parameter decorators
  - **Step Dependencies**: Step 6
  - **User Instructions**: None

## Express Integration

- [ ] Step 8: Create Express Route Registration System

  - **Task**: Implement logic to register controllers and routes with Express
  - **Files**:
    - `src/express/ExpressRouteRegistry.ts`: Express route registration
    - `src/express/types.ts`: Types for Express integration
    - `src/utils/route.ts`: Route path utilities
    - `test/express/registry.test.ts`: Tests for route registration
  - **Step Dependencies**: Step 7
  - **User Instructions**: None

- [ ] Step 9: Create Application Bootstrap Function

  - **Task**: Implement the createExpressApp function for easy setup and bootstrapping
  - **Files**:
    - `src/express/createExpressApp.ts`: Main setup function
    - `src/express/index.ts`: Export file for Express utilities
    - `test/express/createApp.test.ts`: Tests for app creation
  - **Step Dependencies**: Step 8
  - **User Instructions**: None

- [ ] Step 10: Implement Middleware Registration
  - **Task**: Create system for controller and method level middleware
  - **Files**:
    - `src/decorators/middleware.ts`: Middleware decorators
    - `src/metadata/MiddlewareMetadata.ts`: Middleware metadata storage
    - `src/express/middleware.ts`: Middleware handling utilities
    - `test/decorators/middleware.test.ts`: Tests for middleware decorators
  - **Step Dependencies**: Step 9
  - **User Instructions**: None

## Request Validation & Transformation

- [ ] Step 11: Implement Zod Integration for Request Validation

  - **Task**: Create system for validating request data using Zod schemas
  - **Files**:
    - `src/validation/zod.ts`: Zod integration utilities
    - `src/decorators/validation.ts`: Validation decorators
    - `src/middleware/validation.ts`: Validation middleware
    - `test/validation/zod.test.ts`: Tests for Zod validation
  - **Step Dependencies**: Step 10
  - **User Instructions**: None

- [ ] Step 12: Implement class-validator and class-transformer Support
  - **Task**: Add support for class-validator and class-transformer libraries
  - **Files**:
    - `src/validation/class-validator.ts`: class-validator integration
    - `src/serialization/class-transformer.ts`: class-transformer integration
    - `src/types/validation.ts`: Types for validation
    - `test/validation/class-validator.test.ts`: Tests for class-validator support
  - **Step Dependencies**: Step 11
  - **User Instructions**: None

## Error Handling

- [ ] Step 13: Implement Error Handler System

  - **Task**: Create standardized error handling mechanism
  - **Files**:
    - `src/errors/HttpError.ts`: HTTP error classes
    - `src/errors/ValidationError.ts`: Validation error classes
    - `src/middleware/errorHandler.ts`: Error handler middleware
    - `test/errors/error-handling.test.ts`: Tests for error handling
  - **Step Dependencies**: Step 12
  - **User Instructions**: None

- [ ] Step 14: Create Error Handler Decorator
  - **Task**: Implement custom error handling decorator
  - **Files**:
    - `src/decorators/error.ts`: Error handling decorators
    - `src/metadata/ErrorHandlerMetadata.ts`: Error handler metadata
    - `test/decorators/error.test.ts`: Tests for error decorators
  - **Step Dependencies**: Step 13
  - **User Instructions**: None

## Advanced Features

- [ ] Step 15: Implement Context System

  - **Task**: Create @Context decorator and context management system
  - **Files**:
    - `src/context/ContextStorage.ts`: Context storage implementation
    - `src/decorators/context.ts`: Context decorator
    - `src/middleware/context.ts`: Context middleware
    - `test/context/context.test.ts`: Tests for context system
  - **Step Dependencies**: Step 14
  - **User Instructions**: None

- [ ] Step 16: Implement Authorization System

  - **Task**: Create @Guarded decorator and role-based access control
  - **Files**:
    - `src/auth/AuthorizationOptions.ts`: Authorization options
    - `src/decorators/auth.ts`: Authorization decorators
    - `src/middleware/authorization.ts`: Authorization middleware
    - `test/auth/authorization.test.ts`: Tests for authorization
  - **Step Dependencies**: Step 15
  - **User Instructions**: None

- [ ] Step 17: Implement typedi Integration
  - **Task**: Add support for dependency injection using typedi
  - **Files**:
    - `src/di/typedi.ts`: typedi integration
    - `src/decorators/inject.ts`: Injection decorators
    - `test/di/typedi.test.ts`: Tests for typedi integration
  - **Step Dependencies**: Step 16
  - **User Instructions**: None

## HTTP Features

- [ ] Step 18: Implement CORS and Content Negotiation

  - **Task**: Add built-in support for CORS and content negotiation
  - **Files**:
    - `src/http/cors.ts`: CORS configuration
    - `src/http/content.ts`: Content negotiation
    - `src/middleware/http.ts`: HTTP features middleware
    - `test/http/features.test.ts`: Tests for HTTP features
  - **Step Dependencies**: Step 17
  - **User Instructions**: None

- [ ] Step 19: Implement Rate Limiting
  - **Task**: Add rate limiting support
  - **Files**:
    - `src/http/rate-limit.ts`: Rate limiting implementation
    - `src/decorators/rate-limit.ts`: Rate limiting decorators
    - `test/http/rate-limit.test.ts`: Tests for rate limiting
  - **Step Dependencies**: Step 18
  - **User Instructions**: None

## Versioning and Configuration

- [ ] Step 20: Implement Routing Configuration
  - **Task**: Add support for global controller prefix and URL versioning
  - **Files**:
    - `src/config/RoutingOptions.ts`: Routing configuration
    - `src/utils/version.ts`: Versioning utilities
    - `test/config/routing.test.ts`: Tests for routing configuration
  - **Step Dependencies**: Step 19
  - **User Instructions**: None

## Integration and Examples

- [ ] Step 21: Create End-to-End Integration Tests

  - **Task**: Create comprehensive integration tests using Supertest
  - **Files**:
    - `test/integration/basic-controller.test.ts`: Basic controller tests
    - `test/integration/validation.test.ts`: Validation integration tests
    - `test/integration/auth.test.ts`: Authorization integration tests
    - `test/integration/error-handling.test.ts`: Error handling tests
  - **Step Dependencies**: Step 20
  - **User Instructions**: None

- [ ] Step 22: Create Example Applications
  - **Task**: Build example applications showcasing framework features
  - **Files**:
    - `examples/basic/app.ts`: Basic example
    - `examples/validation/app.ts`: Validation example
    - `examples/auth/app.ts`: Authorization example
    - `examples/README.md`: Documentation for examples
  - **Step Dependencies**: Step 21
  - **User Instructions**: None

## Documentation

- [ ] Step 23: Complete Framework Documentation
  - **Task**: Create comprehensive documentation for the framework
  - **Files**:
    - `docs/README.md`: Documentation overview
    - `docs/getting-started.md`: Getting started guide
    - `docs/decorators.md`: Decorator reference
    - `docs/validation.md`: Validation guide
    - `docs/authorization.md`: Authorization guide
  - **Step Dependencies**: Step 22
  - **User Instructions**: None

## Final Integration

- [ ] Step 24: Polish and Complete Package Configuration
  - **Task**: Finalize package.json, README, and export all public API
  - **Files**:
    - `package.json`: (Update) Final configuration
    - `README.md`: (Update) Complete documentation
    - `src/index.ts`: (Update) Export all public API
    - `LICENSE`: Add license file
  - **Step Dependencies**: Step 23
  - **User Instructions**: None

## Summary

This implementation plan outlines the development of a minimalist, decorator-based routing framework for Express.js with TypeScript. The approach takes a progressive, incremental path:

1. We start with the core infrastructure and TypeScript configuration necessary for decorators.
2. We then build the core decorator system with metadata storage for controllers, methods, and parameters.
3. Next, we integrate with Express.js to register routes based on the decorator metadata.
4. We implement request validation, serialization, middleware, and error handling.
5. We add advanced features like context management, authorization, and dependency injection.
6. Finally, we complete the framework with documentation, examples, and integration tests.

This architecture prioritizes:

- TypeScript-first design with full type safety
- Minimalist approach focusing solely on routing and controller functionality
- Express.js compatibility without trying to replace or reinvent it
- Developer experience with intuitive decorators and clear error messages
- Flexibility through optional integration with libraries like Zod, class-validator, and typedi

The implementation follows a layered approach where each component builds upon previous ones, making it easier to understand, test, and maintain. The plan ensures all requirements in the specification are addressed while maintaining a focused scope.
