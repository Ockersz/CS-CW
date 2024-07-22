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
  ): Promise<
    | { access_token: string; refresh_token: string; mfa: false }
    | { mfa: boolean }
  > {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, username: user.username },
      { expiresIn: '1d' },
    );

    await this.usersService.update(user.id, {
      refreshToken,
    });

    if (!user.mfa) {
      const payload = { sub: user.id, username: user.username };
      return {
        access_token: await this.jwtService.signAsync(payload),
        refresh_token: refreshToken,
        mfa: false,
      };
    }
    return {
      mfa: true,
    };
  }

  async signUp(
    signUpDto: SignUpDto,
  ): Promise<
    | { access_token: string; refresh_token: string; mfa: false }
    | { mfa: boolean }
  > {
    const createdUser = await this.usersService.create(signUpDto);
    if (!createdUser) {
      throw new UnauthorizedException();
    }
    const payload = { sub: createdUser.id, username: createdUser.username };
    const refreshToken = await this.jwtService.signAsync(
      { sub: createdUser.id, username: createdUser.username },
      { expiresIn: '1d' },
    );
    await this.usersService.update(createdUser.id, {
      refreshToken,
    });
    return createdUser.mfa
      ? { mfa: true }
      : {
          access_token: await this.jwtService.signAsync(payload),
          refresh_token: refreshToken,
          mfa: false,
        };
  }

  async refreshToken(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    const user = await this.usersService.findOne(payload.username);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }

    const newRefreshToken = await this.jwtService.signAsync(
      { sub: user.id, username: user.username },
      { expiresIn: '1d' },
    );

    await this.usersService.update(user.id, {
      refreshToken: newRefreshToken,
    });

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: newRefreshToken,
    };
  }

  async logOut(username: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.usersService.update(user.id, {
      refreshToken: null,
    });
  }
}
