import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  @Post('login')
  login(@Body() input: { username: string; password: string }) {
    this.kafkaClient.emit('auth.login', input);
    return { status: 'success', message: 'User logged in successfully' };
  }
}
