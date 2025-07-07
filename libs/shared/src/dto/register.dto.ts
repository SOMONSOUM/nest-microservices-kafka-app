import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterDTO {
  @IsString({
    message: 'Full name must be a string',
  })
  @IsOptional()
  fullName: string;

  @IsString({
    message: 'Email must be a string',
  })
  @IsEmail()
  email: string;

  @IsString({
    message: 'Password must be a string',
  })
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}

export class RegisterResponseDTO {
  id: number;
  fullName: string | null;
  email: string;
}
