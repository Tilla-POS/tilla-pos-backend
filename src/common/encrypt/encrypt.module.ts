import { Module } from '@nestjs/common';
import { BcryptProvider } from './provider/bcrypt.provider';
import { Hashing } from './provider/hashing';

@Module({
  providers: [{ provide: Hashing, useClass: BcryptProvider }],
  exports: [Hashing],
})
export class EncryptModule {}
