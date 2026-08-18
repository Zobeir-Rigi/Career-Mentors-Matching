import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');

    const port = configService.get<number>('PORT') ?? 3000;

    app.use(cookieParser());

    app.enableCors({
      origin: frontendUrl,
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('Mentor Matching API')
      .setDescription('Backend API for the Mentor Matching platform')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(port, '0.0.0.0');

    console.log(`Backend listening on ${port}`);
  } catch (error) {
    console.error('BOOTSTRAP FAILED:', error);
    throw error;
  }
}

void bootstrap();
