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

- [x] Step 2: Setup Build and Test Infrastructure
  - **Task**: Configure build tools, testing framework, and CI setup
  - **Files**:
    - `vitest.config.mts`: Vitest configuration
    - `tsup.config.mts`: Build configuration using tsup
    - `.github/workflows/ci.yml`: GitHub Actions CI workflow
    - `src/types/index.ts`: Type definitions file
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

## Core Decorator System

- [x] Step 3: Implement Metadata Storage

  - **Task**: Create a metadata storage system to track decorated controllers and methods
  - **Files**:
    - `src/metadata/MetadataStorage.ts`: Main metadata storage class
    - `src/metadata/types.ts`: Types for stored metadata
    - `src/constants.ts`: Constants used throughout the framework
    - `src/utils/metadata.ts`: Utility functions for metadata handling
    - `tests/metadata/MetadataStorage.test.ts`: Tests for metadata storage
  - **Step Dependencies**: Step 2
  - **User Instructions**: None

- [x] Step 4: Implement Controller Decorators

  - **Task**: Create the @JSONController decorator for defining controller classes
  - **Files**:
    - `src/decorators/controller.ts`: Controller decorator definitions
    - `src/decorators/index.ts`: Export file for decorators
    - `tests/decorators/controller.test.ts`: Tests for controller decorators
  - **Step Dependencies**: Step 3
  - **User Instructions**: None

- [x] Step 5: Implement HTTP Method Decorators

  - **Task**: Create @Get, @Post, @Put, @Delete, and @Patch decorators for HTTP methods
  - **Files**:
    - `src/decorators/method.ts`: HTTP method decorator definitions
    - `src/metadata/MethodMetadata.ts`: Method metadata storage
    - `tests/decorators/method.test.ts`: Tests for method decorators
  - **Step Dependencies**: Step 4
  - **User Instructions**: None

- [x] Step 6: Implement Parameter Decorators - Basic

  - **Task**: Create @Param, @Query, @Body decorators for accessing request data
  - **Files**:
    - `src/decorators/param.ts`: Parameter decorator definitions
    - `src/metadata/ParamMetadata.ts`: Parameter metadata storage
    - `tests/decorators/param.test.ts`: Tests for parameter decorators
  - **Step Dependencies**: Step 5
  - **User Instructions**: None

- [x] Step 7: Implement Parameter Decorators - Advanced

  - **Task**: Create @Req, @Res, @Headers decorators for accessing request/response objects
  - **Files**:
    - `src/decorators/param.ts`: (Update) Add new parameter decorators
    - `tests/decorators/param-advanced.test.ts`: Tests for advanced parameter decorators
  - **Step Dependencies**: Step 6
  - **User Instructions**: None

## Express Integration

- [x] Step 8: Create Express Route Registration System

  - **Task**: Implement logic to register controllers and routes with Express
  - **Files**:
    - `src/express/ExpressRouteRegistry.ts`: Express route registration
    - `src/express/types.ts`: Types for Express integration
    - `src/utils/route.ts`: Route path utilities
    - `tests/express/registry.test.ts`: Tests for route registration
  - **Step Dependencies**: Step 7
  - **User Instructions**: None

- [x] Step 9: Create Application Bootstrap Function

  - **Task**: Implement the createExpressApp function for easy setup and bootstrapping
  - **Files**:
    - `src/express/createExpressApp.ts`: Main setup function
    - `src/express/index.ts`: Export file for Express utilities
    - `tests/express/createApp.test.ts`: Tests for app creation
  - **Step Dependencies**: Step 8
  - **User Instructions**: None

- [x] Step 10: Implement Middleware Registration
  - **Task**: Create system for controller and method level middleware
  - **Files**:
    - `src/decorators/middleware.ts`: Middleware decorators
    - `src/metadata/MiddlewareMetadata.ts`: Middleware metadata storage
    - `src/express/middleware.ts`: Middleware handling utilities
    - `tests/decorators/middleware.test.ts`: Tests for middleware decorators
  - **Step Dependencies**: Step 9
  - **User Instructions**: None

## Request Validation & Transformation

- [x] Step 11: Implement Zod Integration for Request Validation

  - **Task**: Create system for validating request data using Zod schemas. When validated, the request data should be transformed and added to the request body and can be accessed by the controller method (in a type-safe way).
  - **Files**:
    - `src/validation/zod.ts`: Zod integration utilities
    - `src/validation/index.ts`: Exports for validation module
    - `src/decorators/validation.ts`: Validation decorators
    - `src/error/HttpError.ts`: Error handling class
    - `src/error/errorHandler.ts`: Error middleware
    - `src/error/index.ts`: Error handling exports
    - `src/utils/getMetadataStorage.ts`: Utility for accessing metadata storage
    - `tests/validation/zod.test.ts`: Unit tests for Zod validation
    - `tests/integration/validation.test.ts`: Integration tests with Express
  - **Step Dependencies**: Step 10
  - **User Instructions**: Run `npm install zod` to install the required dependency

## Error Handling

- [x] Step 12: Implement Error Handling Decorator for Controller Classes

  - It should be possible to use the error handling decorator on a controller class to handle errors in a centralized way.
  - It should be minimalistic and not require a lot of code to implement.
  - It should return the error in a JSON response with the following format:
    ```json
    {
      "message": "Error message",
      "status": <HTTP status code>
    }
    ```
  - **Task**: Create system for handling errors in a centralized way
  - **Files**:
    - `src/error/ErrorHandler.ts`: Error handling utilities
    - `src/decorators/error.ts`: Error handling decorators
    - `tests/error/error.test.ts`: Tests for error handling
  - **Step Dependencies**: Step 11
  - **User Instructions**: None

## README

- [x] Step 13: Update README.md in a way that is easy to understand for users who want to use the framework.

  - Mention that the framework is still under development and that the documentation will be improved in the future.
  - Provide a basic example of how to use the framework and detailed documentation
    on how to use the different decorators.
  - This should be done in a way that is easy to understand for users who are not familiar with TypeScript and Express.
  - It should include every detail that is needed to use the framework.
  - It should be well-written and easy to understand.
  - It should be well-structured and easy to navigate.
  - It should include all features that are implemented in the framework.
  - It should include a basic example of how to use the framework.
  - It should include a detailed documentation on how to use the different decorators.
  - It should include a detailed documentation on how to use the different middleware.
  - It should include a detailed documentation on how to use the different validation.
  - It should include a detailed documentation on how to use the different error handling.
