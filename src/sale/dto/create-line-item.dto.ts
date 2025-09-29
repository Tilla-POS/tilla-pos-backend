import { IsUUID, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLineItemDto {
  @ApiProperty({
    description: 'ID of the variant being sold',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  variantId: string;

  @ApiProperty({
    description: 'Quantity of the item being sold',
    example: 2,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({
    description: 'Price per unit of the item',
    example: 25.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Total price for this line item (quantity * price)',
    example: 51.98,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiPropertyOptional({
    description: 'ID of the modifier set applied to the item',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  modifierSetId?: string;
}
