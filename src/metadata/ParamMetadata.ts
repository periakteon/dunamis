/**
 * Parameter metadata handling for Dunamis.js
 *
 * This file contains utility functions for working with parameter metadata.
 */

import { ClassConstructor } from "../types";
import { ParameterType } from "../constants";
import { ParameterMetadata } from "./types";
import { MetadataStorage } from "./MetadataStorage";

/**
 * Utility class for working with parameter metadata
 */
export class ParamMetadata {
  /**
   * Gets all parameter metadata for a controller method
   *
   * @param target - The controller class
   * @param methodName - The method name
   * @returns Array of parameter metadata sorted by parameter index
   */
  public static getParametersForHandler(
    target: ClassConstructor,
    methodName: string
  ): ParameterMetadata[] {
    const parameters = MetadataStorage.getInstance().getMethodParameterMetadata(target, methodName);

    // Sort parameters by index to ensure they're in the correct order
    return parameters.sort((a, b) => a.index - b.index);
  }

  /**
   * Gets parameters of a specific type for a controller method
   *
   * @param target - The controller class
   * @param methodName - The method name
   * @param paramType - The parameter type to filter by
   * @returns Array of parameter metadata of the specified type sorted by parameter index
   */
  public static getParametersWithType(
    target: ClassConstructor,
    methodName: string,
    paramType: ParameterType
  ): ParameterMetadata[] {
    const parameters = this.getParametersForHandler(target, methodName);
    return parameters.filter(param => param.type === paramType);
  }
}
