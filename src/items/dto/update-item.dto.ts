/**
 * Update Item DTO by name, image and category
 * With swagger and validation
 * Swagger with examples
 */
import { IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Update Item DTO
 * Allows partial updates to item properties
 */
export class UpdateItemDto {
  @ApiPropertyOptional({
    example: 'New Item Name',
    description: 'Name of the item',
  })
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.png',
    description: 'Image URL of the item',
  })
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Category ID of the item',
  })
  @IsUUID()
  categoryId?: string;
}
