import { PartialType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
  @IsUUID()
  @IsNotEmpty()
  shopkeeperId: string;
}
