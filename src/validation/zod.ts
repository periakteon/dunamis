import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';
import { HttpError } from '../error/HttpError';

export enum ValidationType {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
}

// Add custom properties to Express Request interface using module augmentation
declare module 'express' {
  interface Request {
    validatedData?: {
      body?: any;
      query?: any;
      params?: any;
    };
  }
}

export interface ValidationOptions {
  /**
   * When true, any properties not defined in the schema will be stripped from the validated object
   * @default true
   */
  stripUnknown?: boolean;

  /**
   * Status code to return if validation fails
   * @default 400
   */
  errorStatus?: number;
}

const defaultOptions: Required<ValidationOptions> = {
  stripUnknown: true,
  errorStatus: 400,
};

/**
 * Creates an Express middleware function that validates request data using a Zod schema
 * 
 * @param schema The Zod schema to validate against
 * @param type The part of the request to validate (body, query, params)
 * @param options Configuration options for validation
 * @returns An Express middleware function
 */
export function createZodValidationMiddleware<T extends ZodSchema>(
  schema: T,
  type: ValidationType,
  options?: ValidationOptions
): (req: Request, res: Response, next: NextFunction) => void {
  const mergedOptions = { ...defaultOptions, ...options };

  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req[type]);
      
      // Replace the original data with the validated (and potentially transformed) data
      req[type] = result;
      
      // Also store the validated data in a special property for type-safe access
      if (!req.validatedData) {
        req.validatedData = {};
      }
      req.validatedData[type] = result;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formatted = error.format();
        next(new HttpError(
          `Validation failed for ${type}`,
          mergedOptions.errorStatus,
          { errors: formatted }
        ));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Type helper for inferring the output type of a Zod schema
 */
export type InferSchemaType<T extends ZodSchema> = z.infer<T>; 