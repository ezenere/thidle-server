import { Controller, Get, Req, Post, Put, Param, Delete, Body, Patch, Query } from '@nestjs/common';
import { URequest } from 'src/interfaces/URequest';
import { SignupCheckService } from './services/check.service';
import { SignupCreateService } from './services/create.service';
import { SignupInitService } from './services/init.service';

@Controller('signup')
export class SignupController {
  constructor(
    private readonly init: SignupInitService,
    private readonly username: SignupCheckService,
    private readonly end: SignupCreateService,
  ) {}

  @Post()
  async create(@Req() req: URequest, @Body() val: {name: string, mail: string, bDay: number, bMonth: number, bYear: number, pronoum: string, invite: string}): Promise<{ token: string }> {
    const { name, mail, bDay, bMonth, bYear, pronoum, invite } = val;

    return this.init.create(req, name, mail, bDay, bMonth, bYear, pronoum, invite);
  }

  @Patch(':key')
  async checkConfirmation(@Param('key') key: string, @Body() val: { code: string }): Promise<{ success: boolean }> {
    console.log(val)
    const { code } = val;

    return this.init.confirm(key, code);
  }

  @Get(':key')
  async checkUsername(@Param('key') key: string, @Query() val: { username: string }): Promise<{ available: boolean }> {
    const { username } = val;

    return this.username.check(key, username);
  }

  @Post(':key')
  async finish(@Param('key') key: string, @Body() val: { username: string, password: string }): Promise<any> {
    const { username, password } = val;

    return this.end.finish(key, username, password);
  }
}
