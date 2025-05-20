import { IntersectionType, PartialType } from '@nestjs/swagger';
import { CreateShopkeeperDto } from './create-shopkeeper.dto';
import { IsDate, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/dtos/pagination-query.dto';

class GetShopkeeperBaseDto extends PartialType(CreateShopkeeperDto) {
  @IsDate()
  @IsOptional()
  createdAtFrom?: Date;

  @IsDate()
  @IsOptional()
  createdAtTo?: Date;
}

export class GetShopkeeperDto extends IntersectionType(
  GetShopkeeperBaseDto,
  PaginationQueryDto,
) {}
