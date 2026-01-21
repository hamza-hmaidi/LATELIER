import { HttpException } from '@nestjs/common';
import { ErrorCatalog, ErrorCode } from './error-catalog';

export class AppException extends HttpException {
  readonly errorCode: ErrorCode;
  readonly details?: unknown;

  constructor(errorCode: ErrorCode, details?: unknown, message?: string) {
    const entry = ErrorCatalog[errorCode];
    const response = {
      message: message ?? entry.message,
      errorCode,
      details
    };

    super(response, entry.status);
    this.errorCode = errorCode;
    this.details = details;
  }
}
