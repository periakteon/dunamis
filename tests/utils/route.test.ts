import { describe, expect, it } from 'vitest';
import { normalizePath, joinPaths, buildRoutePath } from '../../src/utils/route';

describe('Route Utils', () => {
    describe('normalizePath', () => {
      it('should return "/" when given an empty path', () => {
        expect(normalizePath('')).toBe('/');
      });
  
      it('should ensure path starts with a slash', () => {
        expect(normalizePath('api')).toBe('/api');
      });
  
      it('should keep existing starting slash', () => {
        expect(normalizePath('/api')).toBe('/api');
      });
  
      // Test specifically for line 22-23: removes trailing slash
      it('should remove trailing slash except for root path', () => {
        expect(normalizePath('/api/')).toBe('/api');
        expect(normalizePath('/users/profile/')).toBe('/users/profile');
        expect(normalizePath('/')).toBe('/'); // Root path should remain unchanged
      });
  
      it('should handle paths with multiple trailing slashes', () => {
        expect(normalizePath('/api//')).toBe('/api');
        expect(normalizePath('/users///')).toBe('/users');
      });
    });
  
    describe('joinPaths', () => {
      it('should join two paths properly', () => {
        expect(joinPaths('/api', '/users')).toBe('/api/users');
      });
  
      it('should handle when base is root', () => {
        expect(joinPaths('/', '/users')).toBe('/users');
      });
  
      it('should handle when sub path is root', () => {
        expect(joinPaths('/api', '/')).toBe('/api');
      });
  
      it('should normalize both paths before joining', () => {
        expect(joinPaths('/api/', 'users/')).toBe('/api/users');
      });
    });
  
    describe('buildRoutePath', () => {
      // Test specifically for line 60-61: handles empty paths array
      it('should return root path when no paths are provided', () => {
        expect(buildRoutePath()).toBe('/');
      });
  
      it('should join multiple path segments', () => {
        expect(buildRoutePath('api', 'users', 'profile')).toBe('/api/users/profile');
      });
  
      it('should handle mix of paths with and without slashes', () => {
        expect(buildRoutePath('/api/', '/users', 'profile/')).toBe('/api/users/profile');
      });
  
      it('should handle empty strings in path segments', () => {
        expect(buildRoutePath('api', '', 'profile')).toBe('/api/profile');
      });
    });
  }); 