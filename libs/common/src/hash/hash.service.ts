import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  hashPassword(password: string): string {
    const saltOrRounds = 10;
    return bcrypt.hashSync(password, saltOrRounds);
  }

  comparePasswords(plainPassword: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
}
