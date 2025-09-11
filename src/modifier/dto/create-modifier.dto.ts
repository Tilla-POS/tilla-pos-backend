import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ModifierOptionDto {
  @ApiProperty({
    example: 'Extra cheese',
    description: 'The name of the modifier option.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 20,
    description: 'The additional value or price for this option.',
  })
  @IsNumber()
  value: number;
}

export class CreateModifierDto {
  @ApiProperty({
    example: 'Size',
    description: 'The name of the modifier (e.g., Size, Toppings).',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: [ModifierOptionDto],
    description: 'A list of options for this modifier.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierOptionDto)
  options: ModifierOptionDto[];
}
