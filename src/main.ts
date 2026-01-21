import 'tsconfig-paths/register';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { AppException } from './common/errors/app.exception';
import { ErrorCodes } from './common/errors/error-catalog';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';

type ValidationDetail = {
  field: string;
  messages: string[];
};

function formatValidationErrors(
  errors: ValidationError[],
  parentPath = ''
): ValidationDetail[] {
  const details: ValidationDetail[] = [];

  for (const error of errors) {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      details.push({
        field: path,
        messages: Object.values(error.constraints)
      });
    }

    if (error.children && error.children.length > 0) {
      details.push(...formatValidationErrors(error.children, path));
    }
  }

  return details;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new AppException(ErrorCodes.INVALID_PLAYER_PAYLOAD, {
          errors: formatValidationErrors(errors)
        })
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
