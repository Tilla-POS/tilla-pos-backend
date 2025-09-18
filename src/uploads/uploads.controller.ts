import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('uploads')
@ApiBearerAuth('Bearer')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadService: UploadsService) {}
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload an image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file);
  }
  @Delete(':key')
  @ApiOperation({ summary: 'Delete a file by its key' })
  @ApiParam({
    name: 'key',
    description: 'Unique identifier of the file to delete',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  deleteFile(@Param('key') key: string) {
    return this.uploadService.deleteFile(key);
  }
}
