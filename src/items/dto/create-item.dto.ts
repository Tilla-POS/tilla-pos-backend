import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateVariantDto } from './create-variant.dto';

export class CreateItemDto {
  @ApiProperty({ description: 'Name of the item', example: 'Burger' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Image of the item',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'ID of the category the item belongs to',
    format: 'uuid',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    type: () => [CreateVariantDto],
    description: 'List of variants for the item',
  })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}
