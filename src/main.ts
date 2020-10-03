import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://toodoo.frle.net', 'http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET, POST, PATCH',
    credentials: true,
    allowedHeaders: 'X-Requested-With, Accept, Content-Type, Origin'
  });
  await app.listen(3000);
}
bootstrap();
