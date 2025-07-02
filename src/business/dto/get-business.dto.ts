import { IntersectionType, PartialType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';
import { IsDate, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/dtos/pagination-query.dto';

class GetBusinessBaseDto extends PartialType(CreateBusinessDto) {
  @IsDate()
  @IsOptional()
  createdAtFrom?: Date;

  @IsDate()
  @IsOptional()
  createdAtTo?: Date;
}

export class GetBusinessDto extends IntersectionType(
  GetBusinessBaseDto,
  PaginationQueryDto,
) {}
