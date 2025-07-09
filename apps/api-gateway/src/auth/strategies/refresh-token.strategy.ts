import { MicroserviceErrorHandler } from '@app/common/utils';
import { AUTH_PATTERNS, JwtPayload, KAFKA_CLIENT } from '@app/shared';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    @Inject(KAFKA_CLIENT) private readonly kafkaClient: ClientKafka,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(
      AUTH_PATTERNS.VALIDATE_REFRESH_TOKEN,
    );
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    const refreshToken = req
      ?.get('authorization')
      ?.replace('Bearer', '')
      .trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const validatedPayload = await firstValueFrom(
      MicroserviceErrorHandler.handleMicroserviceResponse(
        this.kafkaClient.send(AUTH_PATTERNS.VALIDATE_REFRESH_TOKEN, {
          userId: payload.sub,
          refreshToken,
        }),
      ),
    );

    return {
      sub: validatedPayload.userId,
    };
  }
}
