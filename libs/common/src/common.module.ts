import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { HashService } from './hash';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationService } from './validation';
import { TokenService } from './token';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CommonService, HashService, ValidationService, TokenService],
  exports: [
    CommonService,
    HashService,
    JwtModule,
    ValidationService,
    TokenService,
  ],
})
export class CommonModule {}
