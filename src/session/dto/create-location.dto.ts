import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ required: false, description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false, description: 'Region' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false, description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, description: 'Postal code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ required: false, description: 'Country code' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ required: false, description: 'Formatted address' })
  @IsOptional()
  @IsString()
  formattedAddress?: string;

  @ApiProperty({ required: false, description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false, description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
