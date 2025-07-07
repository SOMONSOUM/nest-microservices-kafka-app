export class RegisterDTO {
  fullName: string;
  email: string;
  password: string;
}

export class RegisterResponseDTO {
  id: number;
  fullName: string | null;
  email: string;
}
