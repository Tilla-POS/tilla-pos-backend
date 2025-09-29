import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../enums/payment-method.enum';
import { CreateCustomerDto } from './create-customer.dto';
import { CreateLineItemDto } from './create-line-item.dto';

export class CreateSaleDto {
  @ApiProperty({
    description: 'List of line items in the sale.',
    type: [CreateLineItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLineItemDto)
  lineItems: CreateLineItemDto[];

  @ApiPropertyOptional({
    description: 'Customer details for the sale.',
    type: CreateCustomerDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customer?: CreateCustomerDto;

  @ApiPropertyOptional({
    description: 'Discount applied to the sale.',
    example: 5.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({
    description: 'Tax applied to the sale.',
    example: 8.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiProperty({
    description: 'Subtotal amount before tax and discount.',
    example: 100.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiProperty({
    description: 'Total amount after tax and discount.',
    example: 103.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  grandTotal: number;

  @ApiPropertyOptional({
    description: 'Payment method used for the sale.',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Additional notes for the sale.',
    example: 'Customer requested extra packaging',
  })
  @IsOptional()
  @IsString()
  receiptNote?: string;

  @ApiProperty({
    description: 'Amount of cash received from the customer.',
    example: 110.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  cashReceived: number;

  @ApiPropertyOptional({
    description: 'Change due to the customer.',
    example: 6.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  change?: number;
}
