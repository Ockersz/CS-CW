import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());

  // Configure CORS properly
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://your-production-url.com'
        : 'http://localhost:3000',
    credentials: true, // Allow credentials only in production
  });

  await app.listen(5000);
}
bootstrap();
