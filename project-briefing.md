## Project Description

A lightweight, decorator-based routing framework for Express.js. This library provides a modern, TypeScript-first approach to defining Express routes using class-based controllers and method decorators. It serves as a maintained alternative to the unmaintained routing-controllers library, with additional features and improved developer experience.

## Target Audience

- Open-source community
- TypeScript developers
- Express.js users looking for more structured routing approaches
- The project creator's own applications

## Desired Features

### Core Functionality

- [ ] Class-based controller structure
- [ ] Controller decorators
  - [ ] @JSONController(path) for JSON API endpoints with configurable route path
- [ ] HTTP method decorators
  - [ ] @Get, @Post, @Put, @Delete, @Patch
- [ ] Parameter/argument decorators for request data access
  - [ ] @Param for route parameters
  - [ ] @Query for query parameters
  - [ ] @Body for request body
  - [ ] @Req for raw request object
  - [ ] @Res for raw response object
  - [ ] @Headers for request headers
  - [ ] @Context for application context (DB clients, user info, etc.)
  - [ ] @Guarded for authorization/permission checks

### Request Validation & Transformation

- [ ] Request body validation
  - [ ] Zod schema integration
  - [ ] class-validator compatibility
- [ ] Response serialization/transformation
  - [ ] class-transformer support
  - [ ] Zod schema support

### Middleware Integration

- [ ] Decorator-based middleware application
  - [ ] Controller-level middleware
  - [ ] Method-level middleware

### Error Handling

- [ ] Built-in error handler mechanism
  - [ ] Standardized error responses
  - [ ] Custom error handling decorator support
  - [ ] Configurable validation error responses (HTTP 400)

### Common HTTP Patterns

- [ ] CORS handling
- [ ] Content negotiation
- [ ] Rate limiting

### Dependency Injection

- [ ] Integration with typedi library

### Authorization

- [ ] Role-based access control system
- [ ] Configurable currentUserChecker function
  - [ ] Flexible user property name and type
  - [ ] Access to request object

### Routing Configuration

- [ ] Global controller prefix option
- [ ] URL path versioning support

## Design Requests

- [ ] Minimalist architecture
  - [ ] No unnecessary dependencies
  - [ ] Focused scope - routing and controller functionality only
- [ ] TypeScript-first design
  - [ ] Full type safety
  - [ ] Modern TypeScript decorator implementation
- [ ] Express.js 4.21.2 compatibility
- [ ] Developer experience focus
  - [ ] Intuitive API
  - [ ] Clear error messages
  - [ ] Comprehensive TypeScript typings
- [ ] Functional API for initialization and bootstrapping
  - [ ] createExpressApp function for easy setup

## Testing Strategy

- [ ] Vitest/Jest for unit and integration testing
- [ ] Supertest for API endpoint testing
- [ ] High test coverage for core functionality

## Other Notes

- Should be free and open source with community contribution support
- Should avoid creating a full-framework ecosystem like Nest.js
- Should remain flexible and compatible with standard Express.js patterns
- Potential for gradual migration path for routing-controllers users
- Context management similar to tRPC ctx object
- No built-in logging mechanism; rely on console.log for development
- File upload support not prioritized in initial implementation
