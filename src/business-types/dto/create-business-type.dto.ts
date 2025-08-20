import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessTypeDto {
  @ApiProperty({
    type: String,
    description: 'The name of the business type',
    example: 'Retail',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(96)
  name: string;
  @ApiProperty({
    type: String,
    description: 'The unique slug of the business type',
    example: 'Restaurant',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(96)
  slug: string;
  @ApiPropertyOptional({
    type: String,
    description: 'A brief description of the business type',
    example: 'A business type that involves selling goods to customers.',
  })
  @IsString()
  @MaxLength(256)
  description?: string;
}
