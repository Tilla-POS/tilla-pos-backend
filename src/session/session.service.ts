import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { Device } from './entities/device.entity';
import { Location } from './entities/location.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
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
      // Check if device with same deviceId already exists for this user
      const existingDevice = await this.deviceRepo.findOne({
        where: {
          deviceId: deviceInfo.deviceId,
          user: { id: userId } as any,
        },
      });
      if (existingDevice) {
        device = existingDevice;
      } else {
        device = this.deviceRepo.create({
          ...deviceInfo,
          user: { id: userId } as any,
        });
        device = await this.deviceRepo.save(device);
      }

      // If location info is provided, create a location for this device
      if (locationInfo && device) {
        const location = this.locationRepo.create({
          ...locationInfo,
          device: device,
        });
        await this.locationRepo.save(location);
      }
    }

    const refreshJti = uuidv4();
    const accessJti = uuidv4();

    const session = this.sessionRepo.create({
      user: { id: userId } as any,
      device: device ?? null,
      refreshTokenJti: refreshJti,
      accessTokenJti: accessJti,
      lastSeenAt: new Date(),
    });

    const saved = await this.sessionRepo.save(session);
    return { session: saved, refreshJti, accessJti };
  }

  // Check device existence by device ID
  async checkIsDeviceExists(deviceId: string): Promise<boolean> {
    const device = await this.deviceRepo.findOne({
      where: { deviceId },
    });
    return !!device;
  }

  /**
   * Find an active session for a user on a specific device
   */
  async findActiveSessionByDevice(
    userId: string,
    deviceId: string,
  ): Promise<Session | null> {
    const device = await this.deviceRepo.findOne({
      where: { deviceId, user: { id: userId } as any },
    });

    if (!device) return null;

    const session = await this.sessionRepo.findOne({
      where: {
        user: { id: userId } as any,
        device: { id: device.id } as any,
        revokedAt: IsNull(),
      },
      relations: ['device'],
      order: { lastSeenAt: 'DESC' },
    });

    return session;
  }

  /**
   * Revalidate an existing session by rotating its tokens
   */
  async revalidateSession(sessionId: string, locationInfo?: Partial<Location>) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['device'],
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.revokedAt) {
      throw new UnauthorizedException('Cannot revalidate a revoked session');
    }

    // Update location if provided and device exists
    if (locationInfo && session.device) {
      const location = this.locationRepo.create({
        ...locationInfo,
        device: session.device,
      });
      await this.locationRepo.save(location);
    }

    // Generate new JTIs for token rotation
    const refreshJti = uuidv4();
    const accessJti = uuidv4();

    session.refreshTokenJti = refreshJti;
    session.accessTokenJti = accessJti;
    session.lastSeenAt = new Date();

    const saved = await this.sessionRepo.save(session);
    return { session: saved, refreshJti, accessJti };
  }

  async getUserSessions(userId: string) {
    return this.sessionRepo.find({
      where: { user: { id: userId } as any },
      relations: ['device'],
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
      relations: ['device'],
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

  /**
   * Get all devices for a user grouped by their session status
   * Returns current device, active devices, and inactive devices
   */
  async getAllDevicesGrouped(userId: string, sessionId?: string) {
    let currentDeviceId: string | undefined;

    // If sessionId is provided, get the device ID for the current session
    if (sessionId) {
      const currentSession = await this.sessionRepo.findOne({
        where: { id: sessionId },
        relations: ['device', 'device.locations'],
      });
      if (currentSession?.device) {
        currentDeviceId = currentSession.device.id;
      }
    }

    // Get all devices for the user with their sessions
    const devices = await this.deviceRepo.find({
      where: { user: { id: userId } as any },
      relations: ['sessions', 'locations'],
      order: { createdAt: 'DESC' },
    });

    const deviceMap = new Map<
      string,
      {
        device: Device;
        hasActiveSession: boolean;
        lastActivityAt?: Date;
      }
    >();

    // Process each device and determine its status
    for (const device of devices) {
      let hasActiveSession = false;
      let lastActivityAt: Date | undefined;

      if (device.sessions && device.sessions.length > 0) {
        // Check if any session is active (not revoked)
        for (const session of device.sessions) {
          if (!session.revokedAt) {
            hasActiveSession = true;
          }
          // Track the most recent activity
          if (
            session.lastSeenAt &&
            (!lastActivityAt || session.lastSeenAt > lastActivityAt)
          ) {
            lastActivityAt = session.lastSeenAt;
          }
        }
      }

      deviceMap.set(device.id, {
        device,
        hasActiveSession,
        lastActivityAt,
      });
    }

    // Categorize devices
    let currentDevice = null;
    const activeDevices: any[] = [];
    const inactiveDevices: any[] = [];

    for (const [, { device, hasActiveSession, lastActivityAt }] of deviceMap) {
      const deviceWithInfo = {
        ...device,
        isCurrentDevice: device.id === currentDeviceId,
        lastActivityAt,
      };

      // Remove sessions from response to avoid circular references
      delete deviceWithInfo.sessions;

      if (device.id === currentDeviceId) {
        currentDevice = deviceWithInfo;
      } else if (hasActiveSession) {
        activeDevices.push(deviceWithInfo);
      } else {
        inactiveDevices.push(deviceWithInfo);
      }
    }

    // Sort by last activity
    activeDevices.sort((a, b) => {
      if (!a.lastActivityAt) return 1;
      if (!b.lastActivityAt) return -1;
      return b.lastActivityAt.getTime() - a.lastActivityAt.getTime();
    });

    inactiveDevices.sort((a, b) => {
      if (!a.lastActivityAt) return 1;
      if (!b.lastActivityAt) return -1;
      return b.lastActivityAt.getTime() - a.lastActivityAt.getTime();
    });

    return {
      currentDevice,
      activeDevices,
      inactiveDevices,
    };
  }
}
