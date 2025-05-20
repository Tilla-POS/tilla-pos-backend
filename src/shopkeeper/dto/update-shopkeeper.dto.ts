import { OmitType } from '@nestjs/mapped-types';
import { CreateShopkeeperDto } from './create-shopkeeper.dto';
import { PartialType } from '@nestjs/swagger';

class UpdateShopkeeperBaseDto extends OmitType(CreateShopkeeperDto, [
  'password',
]) {}

export class UpdateShopkeeperDto extends PartialType(UpdateShopkeeperBaseDto) {}
