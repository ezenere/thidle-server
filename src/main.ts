import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

process.env.filePath = '/opt/thidle';
// process.env.filePath = 'D:\\eduar\\Documents\\Development\\thidle-uploads';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: ['http://localhost:3000', 'https://thidle.com', 'https://media.thidle.com', 'https://api.thidle.com'] },
  });
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.setGlobalPrefix('v0');
  await app.listen(3001);
}
bootstrap();
