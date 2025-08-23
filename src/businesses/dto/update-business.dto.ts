import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The UUID of the business type',
  })
  @IsOptional()
  @IsUUID()
  businessTypeId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The UUID of the shopkeeper',
  })
  @IsOptional()
  @IsUUID()
  shopkeeperId?: string;
}
