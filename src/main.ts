import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

process.env.filePath = '/opt/thidle';
// process.env.filePath = 'D:\\eduar\\Documents\\Development\\thidle-uploads';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: ['http://localhost:3001', 'https://thidle.com'] },
  });
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.setGlobalPrefix('v0');
  await app.listen(3000);
}
bootstrap();
