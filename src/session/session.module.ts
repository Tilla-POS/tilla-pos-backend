import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Device } from './entities/device.entity';
import { Location } from './entities/location.entity';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { DeviceProvider } from './providers/device.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Session, Device, Location])],
  providers: [SessionService, DeviceProvider],
  controllers: [SessionController],
  exports: [SessionService],
})
export class SessionModule {}
