import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModifierSetDto {
  @ApiProperty({
    description: 'Name of the modifier option',
    example: 'Extra Cheese',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Price difference for this option',
    example: 2.5,
  })
  @IsNumber()
  value: number;
}
