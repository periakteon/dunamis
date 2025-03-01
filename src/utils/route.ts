/**
 * Utility functions for route path handling
 */

/**
 * Normalizes a route path by ensuring it starts with a slash and removing trailing slashes
 *
 * @param path - The route path to normalize
 * @returns The normalized route path
 */
export function normalizePath(path: string): string {
  // If path is empty, return a single slash
  if (!path) {
    return "/";
  }

  // Ensure path starts with slash
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Remove trailing slashes unless it's the root path
  if (normalizedPath.length > 1) {
    normalizedPath = normalizedPath.replace(/\/+$/, "");
  }

  return normalizedPath;
}

/**
 * Joins two route paths together, ensuring proper slash handling
 *
 * @param basePath - The base path
 * @param subPath - The sub path to append
 * @returns The combined path
 */
export function joinPaths(basePath: string, subPath: string): string {
  const normalizedBase = normalizePath(basePath);
  const normalizedSub = normalizePath(subPath);

  // If the sub path is just '/', return the base path
  if (normalizedSub === "/") {
    return normalizedBase;
  }

  // If the base path is root, don't duplicate the slash
  if (normalizedBase === "/") {
    return normalizedSub;
  }

  return `${normalizedBase}${normalizedSub}`;
}

/**
 * Builds a complete route path by joining multiple path segments
 *
 * @param paths - Path segments to join
 * @returns The complete route path
 */
export function buildRoutePath(...paths: string[]): string {
  if (paths.length === 0) {
    return "/";
  }

  return paths.reduce((result, path) => joinPaths(result, path), "");
}
