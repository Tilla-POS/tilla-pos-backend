import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ required: false, description: 'Device name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Device type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false, description: 'Device brand' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false, description: 'Device model' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ required: false, description: 'Unique device ID' })
  @IsString()
  deviceId?: string;

  @ApiProperty({ required: false, description: 'App version' })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiProperty({ required: false, description: 'Is emulator', default: false })
  @IsOptional()
  @IsBoolean()
  isEmulator?: boolean;

  @ApiProperty({ required: false, description: 'Is tablet', default: false })
  @IsOptional()
  @IsBoolean()
  isTablet?: boolean;

  @ApiProperty({ required: false, description: 'System name' })
  @IsOptional()
  @IsString()
  systemName?: string;

  @ApiProperty({ required: false, description: 'System version' })
  @IsOptional()
  @IsString()
  systemVersion?: string;

  @ApiProperty({ required: false, description: 'User agent' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ required: false, description: 'Is trusted', default: false })
  @IsOptional()
  @IsBoolean()
  trusted?: boolean;
}
