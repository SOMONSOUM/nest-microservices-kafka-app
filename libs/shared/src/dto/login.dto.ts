import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsString({
    message: 'Email must be a string',
  })
  @IsNotEmpty({
    message: 'Email is required',
  })
  email: string;

  @IsNotEmpty({
    message: 'Password is required',
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

export class LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
}
