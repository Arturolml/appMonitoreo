import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  // Enable CORS
  app.enableCors();

  // Auto-validates all incoming API DTOs before reaching the Controllers
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips out properties that shouldn't be received
      forbidNonWhitelisted: false, // Throw error on unrecognizable payload keys
      transform: true, // Transform payloads strictly to their DTO types
    }),
  );
  // Swagger / OpenAPI documentation configuration
  const config = new DocumentBuilder()
    .setTitle('API de Monitoreo Médico')
    .setDescription(
      'Servicios Backend para la aplicación de Telemetría con ESP32 y Flutter',
    )
    .setVersion('1.0')
    .addTag('rutas') // Etiqueta base de agrupacion
    .addBearerAuth() // Soporte futuro a JWT
    .build();

  // Compile the schema structure mapping our API
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory); // Publica Swagger en http://servidor/api

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
