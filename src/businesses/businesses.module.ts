import { Module } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { UsersModule } from '../users/users.module';
import { UploadsModule } from '../uploads/uploads.module';
import { BusinessTypesModule } from '../business-types/business-types.module';
import { CreateBusinessDto } from './dto/create-business.dto';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business]),
    UsersModule,
    UploadsModule,
    BusinessTypesModule,
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService, CreateBusinessDto],
})
export class BusinessesModule {}
