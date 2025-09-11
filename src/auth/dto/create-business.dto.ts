import { CreateBusinessDto } from '../../businesses/dto/create-business.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCreateBusinessDto extends CreateBusinessDto {
  @ApiProperty({
    example: 'user-1234',
    description: 'The unique id of the user',
  })
  @IsNotEmpty()
  @IsUUID()
  shopkeeperId: string;
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
}
