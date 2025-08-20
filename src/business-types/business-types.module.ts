import { Module } from '@nestjs/common';
import { BusinessTypesService } from './business-types.service';
import { BusinessTypesController } from './business-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessType } from './entities/business-type.entity';

@Module({
  controllers: [BusinessTypesController],
  providers: [BusinessTypesService],
  imports: [TypeOrmModule.forFeature([BusinessType])],
})
export class BusinessTypesModule {}
