import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    type: 'string',
    example: 'Stationary',
    description: 'Category name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
