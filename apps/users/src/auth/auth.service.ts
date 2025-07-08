import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  LoginDTO,
  LoginResponseDTO,
  UserResponseDTO,
  RegisterDTO,
  RegisterResponseDTO,
  RefreshTokenResponseDTO,
} from '@app/shared';
import { HashService } from '@app/common/hash';
import { TokenService } from '@app/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
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

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokenPair({
        userId: user.id,
      });

    return {
      accessToken,
      refreshToken,
    };
  }

  async findUserById(id: number): Promise<UserResponseDTO> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
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

  async refresh(id: number): Promise<RefreshTokenResponseDTO> {
    return await this.tokenService.generateTokenPair({ userId: id });
  }
}
