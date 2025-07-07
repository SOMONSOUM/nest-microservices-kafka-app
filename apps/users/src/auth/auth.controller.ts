import {
  AUTH_PATTERNS,
  LoginDTO,
  RegisterDTO,
  RegisterResponseDTO,
} from '@app/shared';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  handleLogin(@Payload() input: LoginDTO) {
    return this.authService.login(input);
  }

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  handleRegister(@Payload() input: RegisterDTO): Promise<RegisterResponseDTO> {
    return this.authService.register(input);
  }
}
