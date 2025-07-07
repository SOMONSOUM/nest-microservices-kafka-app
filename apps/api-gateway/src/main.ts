import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const globalPrefix = configService.get<string>('GLOBAL_PREFIX') ?? 'api';
  const port = configService.get<number>('PORT') ?? 3000;
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalFilters(new ErrorFilter());
  app.enableCors({ origin: '*' });
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}
void bootstrap();
