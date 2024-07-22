import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignUpDto } from 'src/dto/signUpDto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() refreshDto: Record<string, any>) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('mfa')
  mfa(@Body() mfaDto: Record<string, any>) {
    return this.authService.mfa(mfaDto);
  }
}
