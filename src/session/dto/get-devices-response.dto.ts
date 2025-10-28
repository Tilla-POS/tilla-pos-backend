import { ApiProperty } from '@nestjs/swagger';
import { Device } from '../entities/device.entity';

export class DeviceWithSessionInfo extends Device {
  @ApiProperty({
    description: 'Whether this is the current device making the request',
    example: true,
  })
  isCurrentDevice: boolean;

  @ApiProperty({
    description: 'The last session activity timestamp for this device',
    example: '2025-10-28T10:30:00Z',
    type: Date,
    nullable: true,
  })
  lastActivityAt?: Date;
}

export class GetDevicesResponseDto {
  @ApiProperty({
    description: 'The current device being used',
    type: DeviceWithSessionInfo,
    nullable: true,
  })
  currentDevice: DeviceWithSessionInfo | null;

  @ApiProperty({
    description: 'List of devices with active sessions',
    type: [DeviceWithSessionInfo],
  })
  activeDevices: DeviceWithSessionInfo[];

  @ApiProperty({
    description: 'List of devices with inactive (revoked) sessions',
    type: [DeviceWithSessionInfo],
  })
  inactiveDevices: DeviceWithSessionInfo[];
}
