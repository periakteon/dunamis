/**
 * @periakteon/dunamisjs
 *
 * A lightweight, decorator-based routing framework for Express.js.
 * This library provides a modern, TypeScript-first approach to defining
 * Express routes using class-based controllers and method decorators.
 */

// Require reflect-metadata at the entry point
import "reflect-metadata";

// Export version
export const version = "1.0.0";

// Export metadata storage and types
export { MetadataStorage } from "./metadata/MetadataStorage";
export * from "./metadata/types";

// Export constants
export * from "./constants";

// Export utility functions
export * from "./utils/metadata";

// Export types
export * from "./types";

// This file will export all public API components as they are implemented
// Future exports:
// - Controller decorators (@JSONController)
// - Method decorators (@Get, @Post, etc.)
// - Parameter decorators (@Param, @Body, etc.)
// - Express integration (createExpressApp)
