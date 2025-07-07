export class LoginDTO {
  email: string;
  password: string;
}

export class LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
}
