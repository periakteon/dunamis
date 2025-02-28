import { describe, it, expect, beforeEach } from 'vitest';
import { defineMetadata, getMetadata, hasMetadata, extendArrayMetadata } from '../../src/utils/metadata';
import 'reflect-metadata';
import { vi } from 'vitest';

describe('Metadata Utils', () => {
  // Test classes
  class TestClass {}
  
  // Test cases for defineMetadata
  describe('defineMetadata', () => {
    it('should define metadata on a class', () => {
      // Testing line 19 where defineMetadata is implemented
      defineMetadata('testKey', 'testValue', TestClass);
      
      expect(Reflect.getMetadata('testKey', TestClass)).toBe('testValue');
    });
    
    it('should define metadata on a class property', () => {
      const propertyKey = 'testProperty';
      
      defineMetadata('testKey', 'testValue', TestClass.prototype, propertyKey);
      
      expect(Reflect.getMetadata('testKey', TestClass.prototype, propertyKey)).toBe('testValue');
    });
  });
  
  // Test cases for getMetadata
  describe('getMetadata', () => {
    beforeEach(() => {
      // Setup metadata for each test
      Reflect.defineMetadata('testKey', 'testValue', TestClass);
      Reflect.defineMetadata('testKey', 'propertyValue', TestClass.prototype, 'testProperty');
    });
    
    it('should retrieve metadata from a class', () => {
      // Testing line 40 where it returns class metadata
      const result: string | undefined = getMetadata<string>('testKey', TestClass);
      
      expect(result).toBe('testValue');
    });
    
    it('should retrieve metadata from a class property', () => {
      // Testing line 41 where it returns property metadata
      const result: string | undefined = getMetadata<string>('testKey', TestClass.prototype, 'testProperty');
      
      expect(result).toBe('propertyValue');
    });
    
    it('should return undefined if metadata does not exist', () => {
      const result: string | undefined = getMetadata<string>('nonExistentKey', TestClass);
      
      expect(result).toBeUndefined();
    });
  });
  
  // Test cases for hasMetadata
  describe('hasMetadata', () => {
    beforeEach(() => {
      // Setup metadata for each test
      Reflect.defineMetadata('testKey', 'testValue', TestClass);
      Reflect.defineMetadata('testKey', 'propertyValue', TestClass.prototype, 'testProperty');
    });
    
    it('should return true if class metadata exists', () => {
      // Testing line 59 where it checks class metadata
      const result = hasMetadata('testKey', TestClass);
      
      expect(result).toBe(true);
    });
    
    it('should return true if property metadata exists', () => {
      // Testing line 60 where it checks property metadata
      const result = hasMetadata('testKey', TestClass.prototype, 'testProperty');
      
      expect(result).toBe(true);
    });
    
    it('should return false if metadata does not exist', () => {
      const result = hasMetadata('nonExistentKey', TestClass);
      
      expect(result).toBe(false);
    });
  });
  
  // Test cases for extendArrayMetadata (lines 73-86)
  describe('extendArrayMetadata', () => {
    it('should create a new array metadata if none exists', () => {
      // Testing the initialization of previousValue as empty array
      extendArrayMetadata('arrayKey', 'item1', TestClass);
      
      const result = getMetadata<string[]>('arrayKey', TestClass);
      
      expect(result).toEqual(['item1']);
    });
    
    it('should extend existing array metadata for a class', () => {
      // First define some array metadata
      defineMetadata('arrayKey', ['existingItem'], TestClass);
      
      // Now extend it - this tests the complete function from lines 73-86
      extendArrayMetadata('arrayKey', 'newItem', TestClass);
      
      const result = getMetadata<string[]>('arrayKey', TestClass);
      
      expect(result).toEqual(['existingItem', 'newItem']);
    });
    
    it('should extend existing array metadata for a property', () => {
      const propertyKey = 'testMethod';
      
      // First define some array metadata on the property
      defineMetadata('arrayKey', ['existingItem'], TestClass.prototype, propertyKey);
      
      // Now extend it
      extendArrayMetadata('arrayKey', 'newItem', TestClass.prototype, propertyKey);
      
      const result = getMetadata<string[]>('arrayKey', TestClass.prototype, propertyKey);
      
      expect(result).toEqual(['existingItem', 'newItem']);
    });
    
    it('should handle metadata that is undefined', () => {
      // Setup: create a class and use a method to make Reflect.hasMetadata return true
      // but Reflect.getMetadata return undefined (this can happen in certain edge cases)
      class TestClass {
        testMethod(): string {
          return 'testValue';
        }
      }
      
      // Use Reflect methods directly to create the scenario:
      // Set hasMetadata to return true, but make getMetadata return undefined
      // by using a different key for hasOwnMetadata vs getMetadata
      Reflect.defineMetadata('__hasKey', [], TestClass); // This will make hasMetadata return true
      
      // Mock the behavior
      vi.spyOn(Reflect, 'hasMetadata').mockImplementationOnce(() => true);
      vi.spyOn(Reflect, 'getMetadata').mockImplementationOnce(() => undefined);
      
      // Act
      extendArrayMetadata('arrayKey', 'item', TestClass);
      
      // Assert - reset the mock to actually get the value
      vi.restoreAllMocks();
      const result = getMetadata<string[]>('arrayKey', TestClass);
      
      expect(result).toEqual(['item']);
    });
  });
});
