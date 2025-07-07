import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma';
import { HashService } from '@app/common/hash';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9094'],
          },
        },
      },
    ]),
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, HashService],
  exports: [AuthService],
})
export class AuthModule {}
