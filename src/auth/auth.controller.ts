import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { SignUpDto } from 'src/dto/signUpDto';
import { AuthGuard } from '../auth.guard';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Get('init')
  async init(@Res() res: Response) {
    return await this.authService.init(res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>, @Res() res: Response) {
    return await this.authService.signIn(
      signInDto.username,
      signInDto.password,
      res,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() refreshDto: Record<string, any>, @Res() res: Response) {
    return this.authService.refreshToken(refreshDto.refreshToken, res);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('mfa')
  mfa(@Body() mfaDto: Record<string, any>, @Req() req: any) {
    return this.authService.mfa(mfaDto, req?.user);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(
    @Body() verifyDto: Record<string, any>,
    @Req() req: any,
    @Res() res: Response,
  ) {
    return this.authService.verifyOtp(req?.user, verifyDto.otp, res);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('check')
  check(@Req() req: any) {
    return this.authService.check(req?.user);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('protected')
  protected(@Req() req: any, @Body() body: any) {
    return this.authService.protected(req?.user, body.path);
  }
}
