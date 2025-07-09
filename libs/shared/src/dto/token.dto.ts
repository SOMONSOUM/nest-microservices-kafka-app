export class TokenDTO {
  userId: number;
}

export class ValidateRefreshTokenDTO {
  userId: number;
  refreshToken: string;
}

export class ValidateRefreshTokenResponseDTO {
  userId: number;
}
