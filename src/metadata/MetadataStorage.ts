import { ClassConstructor } from "../types";
import { ControllerMetadata, MethodMetadata, ParameterMetadata, MiddlewareMetadata } from "./types";
import { METADATA_KEY } from "../constants";
import { hasMetadata } from "../utils/metadata";

/**
 * MetadataStorage is the central repository for all decorator metadata.
 * It stores information about controllers, methods, and parameters.
 */
export class MetadataStorage {
  private static instance: MetadataStorage;

  private controllers: Map<ClassConstructor, ControllerMetadata> = new Map();
  private methods: Map<string, MethodMetadata[]> = new Map();
  private parameters: Map<string, ParameterMetadata[]> = new Map();
  private middleware: Map<string, MiddlewareMetadata[]> = new Map();

  /**
   * Get the singleton instance of MetadataStorage
   */
  public static getInstance(): MetadataStorage {
    if (!MetadataStorage.instance) {
      MetadataStorage.instance = new MetadataStorage();
    }
    return MetadataStorage.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Add controller metadata
   *
   * @param metadata - Controller metadata
   */
  public addControllerMetadata(metadata: ControllerMetadata): void {
    this.controllers.set(metadata.target, metadata);
  }

  /**
   * Add method metadata
   *
   * @param metadata - Method metadata
   */
  public addMethodMetadata(metadata: MethodMetadata): void {
    const key = this.getMethodKey(metadata.target, metadata.method);
    const existingMetadata = this.methods.get(key) || [];
    existingMetadata.push(metadata);
    this.methods.set(key, existingMetadata);
  }

  /**
   * Add parameter metadata
   *
   * @param metadata - Parameter metadata
   */
  public addParameterMetadata(metadata: ParameterMetadata): void {
    const key = this.getMethodKey(metadata.target, metadata.method);
    const existingMetadata = this.parameters.get(key) || [];
    existingMetadata.push(metadata);
    this.parameters.set(key, existingMetadata);
  }

  /**
   * Add middleware metadata
   *
   * @param metadata - Middleware metadata
   */
  public addMiddlewareMetadata(metadata: MiddlewareMetadata): void {
    const key = metadata.method
      ? this.getMethodKey(metadata.target, metadata.method)
      : this.getControllerKey(metadata.target);

    const existingMetadata = this.middleware.get(key) || [];
    existingMetadata.push(metadata);
    this.middleware.set(key, existingMetadata);
  }

  /**
   * Check if a class is a controller
   *
   * @param target - The class to check
   * @returns True if the class is a controller
   */
  public isController(target: ClassConstructor): boolean {
    return hasMetadata(METADATA_KEY.CONTROLLER, target);
  }

  /**
   * Get all controller metadata
   *
   * @returns Array of controller metadata
   */
  public getControllers(): ControllerMetadata[] {
    return Array.from(this.controllers.values());
  }

  /**
   * Get controller metadata for a specific class
   *
   * @param target - The controller class
   * @returns Controller metadata or undefined if not found
   */
  public getControllerMetadata(target: ClassConstructor): ControllerMetadata | undefined {
    return this.controllers.get(target);
  }

  /**
   * Get method metadata for a controller
   *
   * @param target - The controller class
   * @returns Array of method metadata
   */
  public getControllerMethodMetadata(target: ClassConstructor): MethodMetadata[] {
    const result: MethodMetadata[] = [];
    const methodNames = this.getControllerMethodNames(target);

    for (const methodName of methodNames) {
      const key = this.getMethodKey(target, methodName);
      const methodMetadata = this.methods.get(key) || [];
      result.push(...methodMetadata);
    }

    return result;
  }

  /**
   * Get parameter metadata for a method
   *
   * @param target - The controller class
   * @param methodName - The method name
   * @returns Array of parameter metadata
   */
  public getMethodParameterMetadata(
    target: ClassConstructor,
    methodName: string
  ): ParameterMetadata[] {
    const key = this.getMethodKey(target, methodName);
    return this.parameters.get(key) || [];
  }

  /**
   * Get middleware metadata for a controller
   *
   * @param target - The controller class
   * @returns Array of middleware metadata
   */
  public getControllerMiddleware(target: ClassConstructor): MiddlewareMetadata[] {
    const key = this.getControllerKey(target);
    return this.middleware.get(key) || [];
  }

  /**
   * Get middleware metadata for a method
   *
   * @param target - The controller class
   * @param methodName - The method name
   * @returns Array of middleware metadata
   */
  public getMethodMiddleware(target: ClassConstructor, methodName: string): MiddlewareMetadata[] {
    const key = this.getMethodKey(target, methodName);
    return this.middleware.get(key) || [];
  }

  /**
   * Clear all metadata (mainly for testing purposes)
   */
  public clear(): void {
    this.controllers.clear();
    this.methods.clear();
    this.parameters.clear();
    this.middleware.clear();
  }

  /**
   * Helper method to get method names from a controller class
   *
   * @param target - The controller class
   * @returns Array of method names
   */
  private getControllerMethodNames(target: ClassConstructor): string[] {
    const methods: string[] = [];
    const prototype = target.prototype as Record<string, unknown>;

    // Get all property names (including methods) from prototype
    const propertyNames = Object.getOwnPropertyNames(prototype);

    // Filter out constructor and non-method properties
    for (const name of propertyNames) {
      if (name === "constructor") continue;

      const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
      if (descriptor && typeof descriptor.value === "function") {
        methods.push(name);
      }
    }

    return methods;
  }

  /**
   * Helper method to generate a unique key for a controller
   *
   * @param target - The controller class
   * @returns Unique key string
   */
  private getControllerKey(target: ClassConstructor): string {
    return `${target.name}`;
  }

  /**
   * Helper method to generate a unique key for a method
   *
   * @param target - The controller class
   * @param methodName - The method name
   * @returns Unique key string
   */
  private getMethodKey(target: ClassConstructor, methodName: string): string {
    return `${target.name}_${methodName}`;
  }
}
