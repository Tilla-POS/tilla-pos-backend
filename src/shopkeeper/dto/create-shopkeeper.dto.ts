import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateShopkeeperDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(96)
  username: string;
  @IsEmail()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(96)
  email: string;
  @IsPhoneNumber()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(96)
  phone: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/,
    {
      message:
        'Minimum eight characters, at least one letter, one number and one special character',
    },
  )
  @MaxLength(96)
  password: string;
}
