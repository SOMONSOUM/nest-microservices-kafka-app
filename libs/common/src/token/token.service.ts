import { TokenDTO } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokenPair(input: TokenDTO) {
    const { userId } = input;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId },
        {
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_EXPIRATION_TIME',
          ),
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        },
      ),
      await this.jwtService.signAsync(
        { sub: userId },
        {
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_EXPIRATION_TIME',
          ),
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
