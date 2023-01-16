import {
  Controller,
  Req,
  Post,
  Put,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { URequest } from 'src/interfaces/URequest';
import { FileUploadService } from './services/file.service';
import { FinishUploadService } from './services/finish.service';
import { InitUploadService } from './services/init.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly initService: InitUploadService,
    private readonly uploadService: FileUploadService,
    private readonly finishService: FinishUploadService,
  ) {}

  @Post()
  async init(@Req() request: URequest): Promise<{ key: string }> {
    const { name, type, size } = request.body;

    return this.initService.init(name, type, size, request.user.id);
  }

  @Post(':key')
  @UseInterceptors(FileInterceptor('chunk'))
  async upload(
    @Req() request: URequest,
    @Param() params: { key: string },
    @UploadedFile() chunk: Express.Multer.File,
  ): Promise<{ length: number }> {
    const { key } = params;
    if (chunk)
      return this.uploadService.upload(key, chunk.buffer, request.user.id);
    else
      throw new BadRequestException({
        code: 'UP_NE_DT',
        message: 'Upload has no data.',
      });
  }

  @Put(':key/thought')
  async sendToThought(@Req() request: URequest, @Param() { key }: { key: string }): Promise<{ status: boolean }> {
    const { id } = request.body;
    return this.finishService.sendToThought(key, request.user.id, id);
  }

  @Put(':key/profile')
  async sendToProfile(@Req() request: URequest, @Param() { key }: { key: string }): Promise<{ alt: string; url: string }> {
    const { scale, x, y } = request.body;
    return this.finishService.sendToProfile(key, request.user.id, x, y, scale);
  }

  @Put(':key/background')
  async sendToBackground(@Req() request: URequest, @Param() { key }: { key: string }): Promise<{ alt: string; url: string }> {
    const { scale, x, y } = request.body;
    return this.finishService.sendToBackground(key, request.user.id, x, y, scale);
  }
}
