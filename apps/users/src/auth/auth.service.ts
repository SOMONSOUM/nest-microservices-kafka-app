import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  LoginDTO,
  LoginResponseDTO,
  RegisterDTO,
  RegisterResponseDTO,
} from '@app/shared';
import { HashService } from '@app/common/hash';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
    private readonly jwt: JwtService,
  ) {}

  async login(input: LoginDTO): Promise<LoginResponseDTO> {
    const user = await this.prismaService.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = this.hashService.comparePasswords(
      input.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { id: user.id };

    const accessToken = await this.jwt.signAsync(payload, {
      algorithm: 'HS256',
    });

    return {
      accessToken,
      refreshToken: 'WIP',
    };
  }

  async register(input: RegisterDTO): Promise<RegisterResponseDTO> {
    const user = await this.prismaService.user.findUnique({
      where: { email: input.email },
    });

    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = this.hashService.hashPassword(input.password);
    return await this.prismaService.user.create({
      data: { ...input, password: hashedPassword },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });
  }
}
