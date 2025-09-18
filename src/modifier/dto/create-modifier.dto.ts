import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateModifierSetDto } from './create-modifier-set.dto';

export class CreateModifierDto {
  @ApiProperty({ description: 'Name of the modifier', example: 'Size' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: () => [CreateModifierSetDto],
    description: 'List of modifier options',
  })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateModifierSetDto)
  options: CreateModifierSetDto[];
}
