// @Param('username') username: string,
import { Controller, Get, Req, Param, Delete } from '@nestjs/common';
import { URequest } from 'src/interfaces/URequest';
import { ProfileImageService } from './services/image.service';
import { ProfileInfoService } from './services/info.service';
import { ThoughtProfileService } from './services/thoughts.service';

@Controller('profile/:username')
export class ProfileController {
  constructor(
    private readonly infoService: ProfileInfoService, 
    private readonly thoughtsService: ThoughtProfileService,
    private readonly imagesService: ProfileImageService
  ) {}

  @Get('info')
  async getInfo(
    @Req() request: URequest,
    @Param() params: { username: string },
  ): Promise<any> {
    return await this.infoService.info(request.user.id, params.username);
  }

  @Get('thoughts')
  async getThoughts(
    @Req() request: URequest,
    @Param() params: { username: string },
  ): Promise<any> {
    return await this.thoughtsService.thoughts(request.user.id, params.username);
  }

  @Delete('picture')
  async rmPicture(
    @Req() request: URequest,
    @Param() params: { username: string },
  ): Promise<any> {
    return await this.imagesService.rmPicture(request.user.id, params.username);
  }
}
