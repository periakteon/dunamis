/**
 * Constants used throughout the framework
 */

/**
 * Metadata keys for decorators
 */
export const METADATA_KEY = {
  CONTROLLER: "dunamisjs:controller",
  CONTROLLER_PREFIX: "dunamisjs:controller:prefix",
  CONTROLLER_MIDDLEWARE: "dunamisjs:controller:middleware",
  METHOD: "dunamisjs:method",
  METHOD_PATH: "dunamisjs:method:path",
  METHOD_MIDDLEWARE: "dunamisjs:method:middleware",
  PARAMETER: "dunamisjs:parameter",
  PARAMETER_TYPE: "dunamisjs:parameter:type",
  PARAMETER_NAME: "dunamisjs:parameter:name",
  PARAMETER_INDEX: "dunamisjs:parameter:index",
  PARAMETER_OPTIONS: "dunamisjs:parameter:options",
};

/**
 * Parameter types for parameter decorators
 */
export enum ParameterType {
  REQUEST = "request",
  RESPONSE = "response",
  BODY = "body",
  QUERY = "query",
  PARAM = "param",
  HEADERS = "headers",
  COOKIES = "cookies",
  SESSION = "session",
  CUSTOM = "custom",
}

/**
 * HTTP status codes used in the framework
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  INTERNAL_SERVER_ERROR = 500,
}
