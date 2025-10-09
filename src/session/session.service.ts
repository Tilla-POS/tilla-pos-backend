import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { Device } from './entities/device.entity';
import { Location } from './entities/location.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Device) private readonly deviceRepo: Repository<Device>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}

  async createSession(
    userId: string,
    deviceInfo?: Partial<Device>,
    locationInfo?: Partial<Location>,
  ) {
    let device: Device | undefined;
    if (deviceInfo) {
      device = this.deviceRepo.create({
        ...deviceInfo,
        user: { id: userId } as any,
      });
      device = await this.deviceRepo.save(device);
    }

    let location: Location | undefined;
    if (locationInfo) {
      location = this.locationRepo.create(locationInfo);
      location = await this.locationRepo.save(location);
    }

    const refreshJti = uuidv4();
    const accessJti = uuidv4();

    const session = this.sessionRepo.create({
      user: { id: userId } as any,
      device: device ?? null,
      location: location ?? null,
      refreshTokenJti: refreshJti,
      accessTokenJti: accessJti,
      lastSeenAt: new Date(),
    });

    const saved = await this.sessionRepo.save(session);
    return { session: saved, refreshJti, accessJti };
  }

  async getUserSessions(userId: string) {
    return this.sessionRepo.find({
      where: { user: { id: userId } as any },
      relations: ['device', 'location'],
    });
  }

  async getUserDeviceById(userId: string, deviceId: string) {
    let device: Device | undefined;
    try {
      device = await this.deviceRepo.findOne({
        where: { id: deviceId, user: { id: userId } as any },
      });
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to fetch device with ID ${deviceId}. Please try again later.`,
        error,
      );
    }
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  async getSessionById(sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['device', 'location'],
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async revokeSession(sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    session.revokedAt = new Date();
    await this.sessionRepo.save(session);
    return session;
  }

  /**
   * Validate incoming refresh token payload (must contain sessionId and jti).
   * If valid, rotate jtis atomically and return new jtis and session.
   * Caller should generate tokens using returned jtis.
   */
  async validateAndRotateRefresh(sessionId: string, presentedJti: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['device'],
    });
    if (
      !session ||
      session.revokedAt ||
      session.refreshTokenJti !== presentedJti
    ) {
      if (session) {
        session.revokedAt = new Date();
        await this.sessionRepo.save(session);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newRefreshJti = uuidv4();
    const newAccessJti = uuidv4();

    session.refreshTokenJti = newRefreshJti;
    session.accessTokenJti = newAccessJti;
    session.lastSeenAt = new Date();

    await this.sessionRepo.save(session);

    return { session, newRefreshJti, newAccessJti };
  }
}
