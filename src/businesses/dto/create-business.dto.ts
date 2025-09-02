// src/business/dto/create-business.dto.ts
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({
    example: 'My Business',
    description: 'The name of the business',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'my-business',
    description: 'The unique name of the business',
  })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'THB',
    description: 'The currency code for the business (e.g., USD, EUR, THB)',
  })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The UUID of the business type',
  })
  @IsNotEmpty()
  @IsUUID()
  businessTypeId: string;
}
