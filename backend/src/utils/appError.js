/**
 * AppError — an operational error that carries an HTTP status code.
 * The global Express error handler maps it to `res.status(err.status)`.
 * Unknown errors (not AppError) are treated as 500 Internal Server Error.
 */
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}