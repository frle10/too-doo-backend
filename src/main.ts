import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enforces the class-validator rules on the DTOs and strips unknown
  // properties from request bodies.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: [
      'https://toodoo.frle.dev',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    methods: 'GET, POST, PATCH, DELETE',
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
