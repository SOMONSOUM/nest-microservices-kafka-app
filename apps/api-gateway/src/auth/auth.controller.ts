import { CurrentUserId, Public } from '@app/common';
import { MicroserviceErrorHandler } from '@app/common/utils';
import {
  AUTH_PATTERNS,
  KAFKA_CLIENT,
  LoginDTO,
  LoginResponseDTO,
  RegisterDTO,
  RegisterResponseDTO,
  UserResponseDTO,
  WebResponseDTO,
} from '@app/shared';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RefreshTokenGuard } from './guards';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafkaClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf(AUTH_PATTERNS.LOGIN);
    this.kafkaClient.subscribeToResponseOf(AUTH_PATTERNS.REGISTER);
    this.kafkaClient.subscribeToResponseOf(AUTH_PATTERNS.ME);
    this.kafkaClient.subscribeToResponseOf(AUTH_PATTERNS.REFRESH);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
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
  @Public()
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

  @Get('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async me(
    @CurrentUserId() id: number,
  ): Promise<WebResponseDTO<UserResponseDTO>> {
    const data = await firstValueFrom(
      MicroserviceErrorHandler.handleMicroserviceResponse(
        this.kafkaClient.send(AUTH_PATTERNS.ME, id),
      ),
    );
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'User found successfully',
      data,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @CurrentUserId() id: number,
  ): Promise<WebResponseDTO<UserResponseDTO>> {
    const data = await firstValueFrom(
      MicroserviceErrorHandler.handleMicroserviceResponse(
        this.kafkaClient.send(AUTH_PATTERNS.REFRESH, id),
      ),
    );
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'User refreshed successfully',
      data,
    };
  }
}
