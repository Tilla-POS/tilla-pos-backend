import { Injectable } from '@nestjs/common';
import { Hashing } from './hashing';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider implements Hashing {
  async hashPassword(password: string | Buffer): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async comparePassword(
    password: string | Buffer,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
