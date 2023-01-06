import { Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthCheckService } from './services/check.service';
import { LoginService } from './services/login.service';
import { RevalidateService } from './services/revalidate.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginService: LoginService,
    private readonly revalidateService: RevalidateService,
    private readonly checkService: AuthCheckService,
  ) {}

  @Post('login')
  async login(@Req() request: Request): Promise<any> {
    const { username, password } = request.body;

    return await this.loginService.login(
      username?.toString(),
      password?.toString(),
    );
  }

  @Patch('login')
  async logout(@Req() request: Request): Promise<any> {
    const { r: revalidateToken } = request.body;

    return await this.loginService.logout(revalidateToken.toString());
  }

  @Get('check')
  async check(@Req() request: Request): Promise<any> {
    const { username } = request.query;

    return await this.checkService.check(username?.toString());
  }

  @Get('revalidate')
  async revalidate(@Req() request: Request): Promise<any> {
    return await this.revalidateService.revalidate(request);
  }
}
