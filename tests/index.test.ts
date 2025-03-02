import { describe, it, expect } from 'vitest';
import * as mainIndex from '../src/index';
import * as decoratorsIndex from '../src/decorators/index';
import * as expressIndex from '../src/express/index';
import * as typesIndex from '../src/types/index';
import * as metadataTypes from '../src/metadata/types';
import * as expressTypes from '../src/express/types';

describe('Index Files Exports', () => {
  it('should export from main index file', () => {
    expect(mainIndex).toBeDefined();
  });

  it('should export from decorators index file', () => {
    expect(decoratorsIndex).toBeDefined();
  });

  it('should export from express index file', () => {
    expect(expressIndex).toBeDefined();
  });

  it('should export from types index file', () => {
    expect(typesIndex).toBeDefined();
  });

  it('should export from metadata types file', () => {
    expect(metadataTypes).toBeDefined();
  });

  it('should export from express types file', () => {
    expect(expressTypes).toBeDefined();
  });
}); 