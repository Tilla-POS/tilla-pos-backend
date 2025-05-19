import { OmitType } from '@nestjs/mapped-types';
import { CreateShopkeeperDto } from './create-shopkeeper.dto';

export class UpdateShopkeeperDto extends OmitType(CreateShopkeeperDto, [
  'password',
]) {}
