import { MicroserviceErrorHandler } from '@app/common/utils';
import {
  AUTH_PATTERNS,
  LoginDTO,
  LoginResponseDTO,
  RegisterDTO,
  RegisterResponseDTO,
  WebResponseDTO,
} from '@app/shared';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(AUTH_PATTERNS.LOGIN);
    this.kafkaClient.subscribeToResponseOf(AUTH_PATTERNS.REGISTER);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: LoginDTO,
  ): Promise<WebResponseDTO<LoginResponseDTO>> {
    const data = await firstValueFrom(
      MicroserviceErrorHandler.handleMicroserviceResponse(
        this.kafkaClient.send(AUTH_PATTERNS.LOGIN, input),
      ),
    );
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'User logged in successfully',
      data,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() input: RegisterDTO,
  ): Promise<WebResponseDTO<RegisterResponseDTO>> {
    const data = await firstValueFrom(
      MicroserviceErrorHandler.handleMicroserviceResponse(
        this.kafkaClient.send(AUTH_PATTERNS.REGISTER, input),
      ),
    );

    return {
      success: true,
      status: HttpStatus.CREATED,
      message: 'User registered successfully',
      data,
    };
  }
}
