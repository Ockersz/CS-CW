import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/dto/signUpDto';
import { MailService } from 'src/mail/mail.service';
import { SmsService } from 'src/sms/sms.service';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private smsService: SmsService,
  ) {}

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

  //Needs Username and Password
  async signIn(
    username: string,
    pass: string,
  ): Promise<
    | { access_token: string; refresh_token: string; mfa: false }
    | {
        mfa: boolean;
        maskedTelephone: string;
        maskedEmail: string;
        mfaToken: string;
      }
  > {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    if (!user.mfa) {
      const refreshToken = await this.jwtService.signAsync(
        { sub: user.id, username: user.username },
        { expiresIn: '1d' },
      );

      await this.usersService.update(user.id, {
        refreshToken,
      });
      const payload = { sub: user.id, username: user.username };
      return {
        access_token: await this.jwtService.signAsync(payload),
        refresh_token: refreshToken,
        mfa: false,
      };
    }

    const mfaToken = await this.jwtService.signAsync(
      { sub: user.id, username: user.username, mfa: true },
      { expiresIn: '5m' },
    );

    await this.usersService.update(user.id, {
      mfaToken,
      refreshToken: null,
    });

    return {
      mfa: true,
      maskedTelephone: user.telephone.replace(
        user.telephone.slice(3, user.telephone.length - 3),
        '***',
      ),
      maskedEmail: user.email.replace(
        user.email.slice(3, user.email.indexOf('@')),
        '***',
      ),
      mfaToken,
    };
  }

  //Need type : SMS or EMAIL with the telephone or email and the mfa auth token
  async mfa(mfaDto: Record<string, any>, userObj: any) {
    const user = await this.usersService.findOne(userObj.username);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.mfa) {
      throw new UnauthorizedException();
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const encryptedOtp = await bcrypt.hash(otp, await bcrypt.genSalt());
    await this.usersService.update(user.id, {
      otp: encryptedOtp,
    });

    switch (mfaDto.type) {
      case 'SMS':
        if (user.telephone !== mfaDto.telephone) {
          throw new UnauthorizedException();
        }
        await this.smsService.sendMfaSms(user.telephone, otp, user.username);
        break;
      case 'EMAIL':
        if (user.email !== mfaDto.email) {
          throw new UnauthorizedException();
        }
        this.mailService.sendMfaMail(user.email, otp, user.username);
        break;
      default:
        throw new UnauthorizedException();
    }
  }

  //User object and the otp
  async verifyOtp(userObj: any, otp: string) {
    const user = await this.usersService.findOne(userObj.username);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.otp) {
      throw new UnauthorizedException();
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);

    if (!isOtpValid) {
      throw new UnauthorizedException({
        message: 'Invalid OTP',
      });
    }

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, username: user.username },
      { expiresIn: '1d' },
    );

    await this.usersService.update(user.id, {
      otp: null,
      mfaToken: null,
      refreshToken,
    });

    const payload = { sub: user.id, username: user.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: refreshToken,
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
