import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_CLIENT } from '@app/shared';
import { AccessStrategy, LocalStrategy, RefreshStrategy } from './strategies';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './guards';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9094'],
          },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AccessStrategy,
    RefreshStrategy,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
  exports: [],
})
export class AuthModule {}
