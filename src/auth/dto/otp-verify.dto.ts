import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateDeviceDto } from 'src/session/dto/create-device.dto';
import { CreateLocationDto } from 'src/session/dto/create-location.dto';

export class OtpVerifyDto {
  @ApiProperty({ description: 'The OTP code sent to the user' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'The user ID associated with the OTP' })
  @IsString()
  userId: string;

  @ApiProperty({ required: false, type: () => CreateDeviceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDeviceDto)
  device?: CreateDeviceDto;

  @ApiProperty({ required: false, type: () => CreateLocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  location?: CreateLocationDto;
}
