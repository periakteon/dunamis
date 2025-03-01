import { MetadataStorage } from "../metadata/MetadataStorage";

/**
 * Gets the singleton instance of the MetadataStorage
 * This is a convenience function to make it easier to access the metadata storage
 * 
 * @returns The MetadataStorage singleton instance
 */
export function getMetadataStorage(): MetadataStorage {
  return MetadataStorage.getInstance();
} 