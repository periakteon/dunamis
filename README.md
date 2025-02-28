# @periakteon/dunamisjs

A lightweight, decorator-based routing framework for Express.js. This library provides a modern, TypeScript-first approach to defining Express routes using class-based controllers and method decorators.

## Features

- Class-based controller structure
- TypeScript decorators for routing and parameter binding
- Express.js integration
- Request validation with Zod
- Middleware support
- Error handling
- And more...

## Installation

```bash
npm install @periakteon/dunamisjs express reflect-metadata
```

## Quick Start

```typescript
import "reflect-metadata";
import { createExpressApp, JSONController, Get, Post, Body, Param } from "@periakteon/dunamisjs";
import express from "express";

@JSONController("/users")
class UserController {
  @Get()
  getAll() {
    return { users: [] }; // Returns as JSON
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

## Documentation

Coming soon...

## License

MIT
