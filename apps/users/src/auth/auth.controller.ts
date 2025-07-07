import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor() {}

  @MessagePattern('auth.login')
  handleLogin(@Payload() input: { username: string; password: string }) {
    console.log('Login request received:', input);
  }
}
