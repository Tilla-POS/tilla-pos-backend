import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkuDto {
  @ApiProperty({ description: 'Unique identifier for the SKU', format: 'uuid' })
  @IsUUID()
  sku: string;

  @ApiProperty({ description: 'Quantity of the item', example: 1.0 })
  @IsNumber()
  @IsPositive()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Unit of measurement (e.g., kg, pcs)',
    example: 'pcs',
  })
  @IsString()
  unit: string;

  @ApiProperty({
    description: 'Alert threshold for low stock',
    example: 10.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockAlert?: number;
}
