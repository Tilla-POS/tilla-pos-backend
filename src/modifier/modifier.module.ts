import { Module } from '@nestjs/common';
import { ModifiersService } from './modifier.service';
import { ModifiersController } from './modifier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modifier } from './entities/modifier.entity';
import { ModifierSet } from './entities/modifier-set.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Modifier, ModifierSet])],
  controllers: [ModifiersController],
  providers: [ModifiersService],
  exports: [ModifiersService],
})
export class ModifierModule {}
