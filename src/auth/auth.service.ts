import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from 'src/dto/signUpDto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string; mfa: false } | { mfa: boolean }> {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    if (!user.mfa) {
      const payload = { sub: user.id, username: user.username };
      return {
        access_token: await this.jwtService.signAsync(payload),
        mfa: false,
      };
    }
    return {
      mfa: true,
    };
  }

  async signUp(
    signUpDto: SignUpDto,
  ): Promise<{ access_token: string; mfa: false } | { mfa: boolean }> {
    const createdUser = await this.usersService.create(signUpDto);
    if (!createdUser) {
      throw new UnauthorizedException();
    }
    const payload = { sub: createdUser.id, username: createdUser.username };
    return createdUser.mfa
      ? { mfa: true }
      : { access_token: await this.jwtService.signAsync(payload), mfa: false };
  }
}
