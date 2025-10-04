import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CurrentUserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @Expose()
  username: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+1234567890',
    required: false,
  })
  @Expose()
  phone?: string;

  @ApiProperty({
    description: 'The business associated with the user',
    required: false,
  })
  @Expose()
  business?: {
    id: string;
    name: string;
    description?: string;
  };

  @ApiProperty({
    description: 'The date when the user was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the user was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
