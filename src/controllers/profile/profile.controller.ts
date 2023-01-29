// @Param('username') username: string,
import { Controller, Get, Req, Param, Delete, Query, Post } from '@nestjs/common';
import { URequest } from 'src/interfaces/URequest';
import { ProfileFollowService } from './services/follow.service';
import { ProfileImageService } from './services/image.service';
import { ProfileInfoService } from './services/info.service';
import { ThoughtProfileService } from './services/thoughts.service';

@Controller('profile/:username')
export class ProfileController {
  constructor(
    private readonly infoService: ProfileInfoService, 
    private readonly thoughtsService: ThoughtProfileService,
    private readonly imagesService: ProfileImageService,
    private readonly followService: ProfileFollowService
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
    @Query() query: { limit: string, cursor: string, mode: string },
    @Param() params: { username: string },
  ): Promise<any> {
    const { limit, cursor, mode } = query;

    return await this.thoughtsService.thoughts(
      request.user.id, 
      params.username, 
      Math.min(parseInt((limit || 30).toString()), 50), 
      cursor, 
      mode
    );
  }

  
  @Post('follow')
  async follow(
    @Req() request: URequest,
    @Param() params: { username: string },
  ): Promise<any> {
    return await this.followService.follow(request.user.id, params.username);
  }
  @Delete('follow')
  async unfollow(
    @Req() request: URequest,
    @Param() params: { username: string },
  ): Promise<any> {
    return await this.followService.unfollow(request.user.id, params.username);
  }

  @Delete('picture')
  async rmPicture(
    @Req() request: URequest,
    @Param() params: { username: string },
  ): Promise<any> {
    return await this.imagesService.rmPicture(request.user.id, params.username);
  }
}
