import { MicroserviceErrorHandler } from '@app/common/utils';
import { AUTH_PATTERNS, KAFKA_CLIENT, LoginResponseDTO } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(KAFKA_CLIENT) private readonly kafkaClient: ClientKafka) {
    super({
      usernameField: 'email',
    });
  }

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(AUTH_PATTERNS.LOGIN);
  }

  async validate(email: string, password: string): Promise<LoginResponseDTO> {
    const input = { email, password };

    const data = await firstValueFrom(
      MicroserviceErrorHandler.handleMicroserviceResponse(
        this.kafkaClient.send(AUTH_PATTERNS.LOGIN, input),
      ),
    );
    return data;
  }
}
