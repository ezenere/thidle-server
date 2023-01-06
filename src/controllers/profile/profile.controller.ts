// @Param('username') username: string,
import { Controller, Get, Req, Param } from '@nestjs/common';
import { URequest } from 'src/interfaces/URequest';
import { ProfileInfoService } from './services/info.service';

@Controller('profile/:username')
export class ProfileController {
  constructor(private readonly infoService: ProfileInfoService) {}

  @Get('info')
  async getHello(
    @Req() request: URequest,
    @Param() params: { username: string },
  ): Promise<any> {
    return await this.infoService.info(request.user.id, params.username);
  }
}
