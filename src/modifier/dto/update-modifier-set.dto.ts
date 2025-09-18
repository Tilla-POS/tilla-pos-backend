import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateModifierSetDto } from './create-modifier-set.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateModifierSetDto extends PartialType(CreateModifierSetDto) {
  @ApiProperty({
    description: 'ID of the modifier set option',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  id?: string;
}
