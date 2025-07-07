import {
  AUTH_PATTERNS,
  LoginDTO,
  LoginResponseDTO,
  RegisterDTO,
  RegisterResponseDTO,
  USER_PATTERNS,
  UserResponseDTO,
} from '@app/shared';
import { Controller, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  handleLogin(@Payload() input: LoginDTO): Promise<LoginResponseDTO> {
    return this.authService.login(input);
  }

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  handleRegister(@Payload() input: RegisterDTO): Promise<RegisterResponseDTO> {
    return this.authService.register(input);
  }

  @MessagePattern(AUTH_PATTERNS.ME)
  handleMe(@Payload(new ParseIntPipe()) id: number): Promise<UserResponseDTO> {
    return this.authService.findUserById(id);
  }
}
