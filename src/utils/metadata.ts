import "reflect-metadata";
import { ClassConstructor } from "../types";

/**
 * Store metadata with TypeScript's metadata reflection API
 *
 * @param metadataKey - The key to store the metadata under
 * @param metadataValue - The value to store
 * @param target - The target class constructor
 * @param propertyKey - Optional property key (for method decorators)
 */
export function defineMetadata(
  metadataKey: string,
  metadataValue: unknown,
  target: ClassConstructor | object,
  propertyKey?: string | symbol
): void {
  if (propertyKey) {
    Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
  } else {
    Reflect.defineMetadata(metadataKey, metadataValue, target);
  }
}

/**
 * Retrieve metadata with TypeScript's metadata reflection API
 *
 * @param metadataKey - The key to retrieve metadata from
 * @param target - The target class constructor
 * @param propertyKey - Optional property key (for method decorators)
 * @returns The stored metadata, or undefined if not found
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMetadata<T = any>(
  metadataKey: string,
  target: ClassConstructor | object,
  propertyKey?: string | symbol
): T | undefined {
  if (propertyKey) {
    return Reflect.getMetadata(metadataKey, target, propertyKey) as T;
  }
  return Reflect.getMetadata(metadataKey, target) as T;
}

/**
 * Checks if metadata exists
 *
 * @param metadataKey - The key to check for metadata
 * @param target - The target class constructor
 * @param propertyKey - Optional property key (for method decorators)
 * @returns True if the metadata exists, false otherwise
 */
export function hasMetadata(
  metadataKey: string,
  target: ClassConstructor | object,
  propertyKey?: string | symbol
): boolean {
  if (propertyKey) {
    return Reflect.hasMetadata(metadataKey, target, propertyKey);
  }
  return Reflect.hasMetadata(metadataKey, target);
}

/**
 * Extends existing metadata by adding to an array
 *
 * @param metadataKey - The key to store the metadata under
 * @param metadataValue - The value to add to the array
 * @param target - The target class constructor
 * @param propertyKey - Optional property key (for method decorators)
 */
export function extendArrayMetadata<T>(
  metadataKey: string,
  metadataValue: T,
  target: ClassConstructor | object,
  propertyKey?: string | symbol
): void {
  let previousValue: T[] = [];

  if (hasMetadata(metadataKey, target, propertyKey)) {
    previousValue = getMetadata<T[]>(metadataKey, target, propertyKey) || [];
  }

  const newValue = [...previousValue, metadataValue];
  defineMetadata(metadataKey, newValue, target, propertyKey);
}
