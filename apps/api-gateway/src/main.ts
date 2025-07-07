import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = process.env.GLOBAL_PREFIX ?? 'api';
  const port = process.env.PORT ?? 3000;
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix(globalPrefix);
  app.enableCors({ origin: '*' });
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}
void bootstrap();
