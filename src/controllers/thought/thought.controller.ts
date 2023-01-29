import { Controller, Get, Req, Post, Put, Param, Delete, Res, Query } from '@nestjs/common';
import { DefaultResponseObject } from 'src/interfaces/DefaultResponseObject';
import { ThoughtObject } from 'src/interfaces/ThoughtObject';
import { URequest } from 'src/interfaces/URequest';
import { LikeThoughtService } from './services/like.service';
import { ThoughtMainService } from './services/main.service';
import { NewThoughtService } from './services/new.service';

@Controller('thought')
export class ThoughtController {
  constructor(
    private readonly mainService: ThoughtMainService,
    private readonly newThought: NewThoughtService,
    private readonly like: LikeThoughtService,
  ) {}

  @Get()
  async getMain(@Req() request: URequest, @Query() query: { limit: number, cursor: string, mode: string }): Promise<{items: Array<ThoughtObject>, cursor: string}> {
    const { limit, cursor, mode } = query;

    return this.mainService.getMain(
      request.user.id,
      Math.min(parseInt((limit || 30).toString()), 50),
      cursor,
      mode
    );
  }

  @Get(':id')
  async getThought(@Req() request: URequest, @Param('id') id: string): Promise<Array<ThoughtObject>> {
    const { comments, depht } = request.query;

    return this.mainService.getThought(
      request.user.id,
      parseInt(id),
      parseInt(typeof comments === 'string' ? comments : 'NaN'),
      parseInt(typeof depht === 'string' ? depht : 'NaN')
    );
  }

  @Post()
  async postThought(@Req() request: URequest): Promise<{ id: number }> {
    const { text, activeAt, privacy, commentPrivacy, parent, embeed } =
      request.body;

    return this.newThought.post(
      text,
      activeAt,
      privacy,
      commentPrivacy,
      parent,
      embeed,
      request.user.id,
    );
  }

  @Put(':id')
  async putThought(
    @Param() params: { id: number },
    @Req() request: URequest,
  ): Promise<DefaultResponseObject> {
    const { id } = params;

    return this.newThought.finish(id, request.user.id);
  }

  @Post('like/:id')
  async likeThought(
    @Req() request: URequest,
    @Param() params: { id: number }
  ): Promise<{ count: number }> {
    const { id } = params;

    return this.like.post(id, request.user.id);
  }

  @Delete('like/:id')
  async unlikeThought(
    @Req() request: URequest,
    @Param() params: { id: number },
  ): Promise<{ count: number }> {
    const { id } = params;

    return this.like.delete(id, request.user.id);
  }
}
