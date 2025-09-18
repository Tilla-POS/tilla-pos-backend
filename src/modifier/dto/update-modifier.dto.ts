import { PartialType, ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateModifierDto } from './create-modifier.dto';
import {
  IsOptional,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateModifierSetDto } from './update-modifier-set.dto';

export class UpdateModifierDto extends PartialType(
  OmitType(CreateModifierDto, ['options']),
) {
  @ApiProperty({
    description: 'ID of the modifier',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({
    type: () => [UpdateModifierSetDto],
    description: 'List of modifier options',
    required: false,
  })
  @IsOptional()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateModifierSetDto)
  options?: UpdateModifierSetDto[];
}
