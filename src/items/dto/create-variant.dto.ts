import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsUUID,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateSkuDto } from './create-sku.dto';

export class CreateVariantDto {
  @ApiProperty({
    description: 'Name of the variant',
    example: 'Small Blue T-Shirt',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Image of the variant',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Selling price of the variant', example: 25.0 })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiProperty({
    description: 'Purchase price of the variant',
    example: 15.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiProperty({
    description: 'Margin of the variant',
    example: 10.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  margin?: number;

  @ApiProperty({
    description: 'Barcode of the variant',
    example: '1234567890123',
    required: false,
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({
    description: 'Manufacture date of the variant',
    example: '2023-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  manufactureDate?: Date;

  @ApiProperty({
    description: 'Expiry date of the variant',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expireDate?: Date;

  @ApiProperty({
    description: 'Alert date before expiry',
    example: '2023-12-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expireDateAlert?: Date;

  @ApiProperty({
    description: 'Tax associated with the variant',
    example: 'VAT',
    required: false,
  })
  @IsOptional()
  @IsString()
  tax?: string;

  @ApiProperty({
    description: 'Internal note for the variant',
    required: false,
  })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @ApiProperty({
    type: () => CreateSkuDto,
    description: 'Stock keeping unit details',
  })
  @ValidateNested()
  @Type(() => CreateSkuDto)
  sku: CreateSkuDto;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    isArray: true,
    description: 'List of modifier IDs for the variant',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  modifiers?: string[];
}
