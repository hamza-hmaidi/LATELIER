import { HttpStatus } from '@nestjs/common';

export const ErrorCatalog = {
  PLAYER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'Player not found'
  },
  INVALID_PLAYER_PAYLOAD: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Invalid player payload'
  },
  DATA_SOURCE_UNAVAILABLE: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Data source unavailable'
  }
} as const;

export const ErrorCodes = {
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  INVALID_PLAYER_PAYLOAD: 'INVALID_PLAYER_PAYLOAD',
  DATA_SOURCE_UNAVAILABLE: 'DATA_SOURCE_UNAVAILABLE'
} as const;

export type ErrorCode = keyof typeof ErrorCatalog;
