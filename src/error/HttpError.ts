/**
 * Custom error class for HTTP errors
 */
export class HttpError extends Error {
  /**
   * HTTP status code
   */
  public status: number;
  
  /**
   * Optional additional data to include in the error response
   */
  public data?: Record<string, any>;

  /**
   * Creates a new HttpError
   * 
   * @param message Error message
   * @param status HTTP status code (defaults to 500)
   * @param data Additional data to include in the error response
   */
  constructor(message: string, status: number = 500, data?: Record<string, any>) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
} 