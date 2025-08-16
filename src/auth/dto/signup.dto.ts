import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class SignUpDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'The username of the user',
        maxLength: 50,
        minLength: 3,
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    @MinLength(3)
    username: string;

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
        example: '+66973541807',
        description: 'The phone number of the user',
        maxLength: 100,
        minLength: 7,
        required: true,
    })
    @IsPhoneNumber()
    @IsNotEmpty()
    @MaxLength(100)
    @MinLength(7)
    phone: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(96)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
        message:
            'Minimum eight characters, at least one letter, one number and one special character',
    })
    password: string;
}