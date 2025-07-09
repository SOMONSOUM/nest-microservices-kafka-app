import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';

@Injectable()
export class HashService {
  hashPassword(password: string): string {
    const saltOrRounds = 10;
    return bcrypt.hashSync(password, saltOrRounds);
  }

  comparePasswords(plainPassword: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  async hashString(input: string): Promise<string> {
    return argon2.hash(input);
  }

  async compareHash(input: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, input);
  }
}
