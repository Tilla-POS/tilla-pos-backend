import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(96)
  name: string;
  @IsPhoneNumber()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(96)
  phone: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  address: string;
  @IsUUID()
  @IsNotEmpty()
  shopkeeperId: string;
}
