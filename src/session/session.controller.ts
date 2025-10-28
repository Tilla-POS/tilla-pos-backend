import { Controller, Get, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { SessionService } from './session.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { GetDevicesResponseDto } from './dto/get-devices-response.dto';

@ApiTags('session')
@ApiBearerAuth('Bearer')
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('devices')
  @ApiOperation({
    summary: 'Get all devices',
    description:
      'Retrieves all devices associated with the authenticated user, grouped by their session status. Returns the current device, active session devices, and inactive session devices.',
  })
  @ApiOkResponse({
    description: 'Devices retrieved successfully.',
    type: GetDevicesResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  async getAllDevices(
    @ActiveUser(
      'sub',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    userId: string,
    @ActiveUser(
      'sessionId',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    sessionId?: string,
  ): Promise<GetDevicesResponseDto> {
    return this.sessionService.getAllDevicesGrouped(userId, sessionId);
  }
}
