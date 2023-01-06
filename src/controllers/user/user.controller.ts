import { Controller, Get, Req } from '@nestjs/common';
import { URequest } from 'src/interfaces/URequest';
import { UserInfoObject } from 'src/interfaces/UserInfoObject';
import { UserSuggestionObject } from 'src/interfaces/UserSuggestionObject';
import { InfoService } from './services/info.service';
import { ProfileSuggestionsService } from './services/suggestions.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly infoService: InfoService,
    private readonly suggestionsService: ProfileSuggestionsService,
  ) {}

  @Get('info')
  async getHello(@Req() request: URequest): Promise<UserInfoObject | null> {
    return await this.infoService.getInfo(request.user.id);
  }

  @Get('suggestions')
  async getSuggestions(
    @Req() request: URequest,
  ): Promise<Array<UserSuggestionObject>> {
    const { limit, offset, exclude } = request.query;

    return this.suggestionsService.suggestions(
      request.user.id,
      Math.min(parseInt((limit || 3).toString()), 50),
      parseInt((offset || 0).toString()),
      (exclude || '').toString(),
    );
  }
}
