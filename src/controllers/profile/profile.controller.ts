// @Param('username') username: string,
import { Controller, Get, Req, Param } from '@nestjs/common';
import { URequest } from 'src/interfaces/URequest';
import { ProfileInfoService } from './services/info.service';
import { ThoughtProfileService } from './services/thoughts.service';

@Controller('profile/:username')
export class ProfileController {
  constructor(
    private readonly infoService: ProfileInfoService, 
    private readonly thoughtsService: ThoughtProfileService
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
}
