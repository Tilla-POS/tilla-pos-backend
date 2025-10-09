import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateDeviceDto } from '../../session/dto/create-device.dto';
import { CreateLocationDto } from '../../session/dto/create-location.dto';

export class SignInDto {
  @ApiProperty({
    example: 'john@doe.com',
    description: 'The email address of the user',
    maxLength: 100,
    minLength: 5,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(5)
  email: string;

  @ApiProperty({
    example: 'P@ssword123',
    description: 'The password of the user',
    maxLength: 100,
    minLength: 5,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(96)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Minimum eight characters, at least one letter, one number and one special character',
  })
  password: string;

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
