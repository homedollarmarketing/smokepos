import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvService } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get environment service
  const envService = app.get(EnvService);

  // Enable API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Enable CORS
  const corsOrigins = envService.get('CORS_ALLOWED_ORIGINS').split(',');

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('SMOKE POS API')
    .setDescription('The SMOKE POS API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  const port = envService.get('PORT');
  const host = envService.get('HOST');

  await app.listen(port, host);

  console.log(`🚀 Application is running on: http://${host}:${port}`);
  console.log(`📚 API Documentation: http://${host}:${port}/docs`);
  console.log(`📡 API Base URL: http://${host}:${port}/v1`);
}
bootstrap();
