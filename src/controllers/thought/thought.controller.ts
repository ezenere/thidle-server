import { Controller, Get, Req, Post, Put, Param, Delete } from '@nestjs/common';
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
  async getMain(@Req() request: URequest): Promise<Array<ThoughtObject>> {
    const { limit, offset, exclude } = request.query;

    return this.mainService.getMain(
      request.user.id,
      Math.min(parseInt((limit || 3).toString()), 50),
      parseInt((offset || 0).toString()),
      (exclude || '').toString(),
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
    @Param() params,
    @Req() request: URequest,
  ): Promise<DefaultResponseObject> {
    const { id } = params;

    return this.newThought.finish(id, request.user.id);
  }

  @Post('like/:id')
  async likeThought(
    @Req() request: URequest,
    @Param() params,
  ): Promise<{ count: number }> {
    const { id } = params;

    return this.like.post(id, request.user.id);
  }

  @Delete('like/:id')
  async unlikeThought(
    @Req() request: URequest,
    @Param() params,
  ): Promise<{ count: number }> {
    const { id } = params;

    return this.like.delete(id, request.user.id);
  }
}
