import { Injectable, Res, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { EncrpytionService } from 'src/encrpytion/encrpytion.service';
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
    private encryptionService: EncrpytionService,
  ) {}

  async signUp(signUpDto: any): Promise<any> {
    const decrptedObject = this.encryptionService.decrypt(signUpDto.data);

    const object = JSON.parse(decrptedObject);

    const createdUser = await this.usersService.create(object);
    if (!createdUser) {
      throw new UnauthorizedException();
    }

    return {
      message: 'User created',
    };
  }

  async init(@Res() res: Response) {
    const public_key = this.encryptionService.getPublicKey();
    return res.json({ public_key });
  }

  //Needs Username and Password
  async signIn(username: string, pass: string, @Res() res: Response) {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.status === false) {
      throw new UnauthorizedException();
    }
    const decryptedPassword = this.encryptionService.decrypt(pass);
    // const passwordMatches = await bcrypt.compare(pass, user.password);
    const passwordMatches = bcrypt.compareSync(
      decryptedPassword,
      user.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    if (!user.mfa) {
      const refreshToken = await this.jwtService.signAsync(
        { sub: user.id, username: user.username },
        { expiresIn: '1d' },
      );

      await this.usersService.update(user.id, { refreshToken });

      const payload = { sub: user.id, username: user.username };
      const accessToken = await this.jwtService.signAsync(payload);

      // Set cookies
      res.cookie('access_token', accessToken, {
        // httpOnly: true,
        maxAge: 60000,
        // secure: process.env.NODE_ENV === 'production' ? true : false, // use secure cookies in production
        // sameSite: 'lax',
        expires: new Date(Date.now() + 60000),
      });
      res.cookie('refresh_token', refreshToken, {
        // httpOnly: true,
        maxAge: 86400000,
        // secure: process.env.NODE_ENV === 'production' ? true : false, // use secure cookies in production
        // sameSite: 'lax',
        expires: new Date(Date.now() + 86400000),
      });

      return res.json({ mfa: false });
    }

    const mfaToken = await this.jwtService.signAsync(
      { sub: user.id, username: user.username, mfa: true },
      { expiresIn: '5m' },
    );

    res.cookie('mfa_token', mfaToken, {
      // httpOnly: true,
      maxAge: 300000,
      // secure: process.env.NODE_ENV === 'production' ? true : false, // use secure cookies in production
      // sameSite: 'lax',
      expires: new Date(Date.now() + 300000),
    });

    await this.usersService.update(user.id, {
      refreshToken: null,
    });

    return res.json({
      mfa: true,
      maskedTelephone: user.telephone
        ? user.telephone.replace(
            user.telephone.slice(3, user.telephone.length - 3),
            '***',
          )
        : null,
      maskedEmail: user.email
        ? user.email.replace(
            user.email.slice(3, user.email.indexOf('@') - 2),
            '***',
          )
        : null,
    });
  }

  //Need type : SMS or EMAIL with the telephone or email and the mfa auth token
  async mfa(mfaDto: Record<string, any>, userObj: any) {
    const user = await this.usersService.findOne(userObj.username);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.mfa) {
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
        await this.mailService.sendMfaMail(user.email, otp, user.username);
        break;
      default:
        throw new UnauthorizedException();
    }

    return { message: 'OTP sent' };
  }

  //User object and the otp
  async verifyOtp(userObj: any, otp: string, @Res() res: Response) {
    const user = await this.usersService.findOne(userObj.username);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.otp) {
      throw new UnauthorizedException();
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);

    if (!isOtpValid) {
      const mfaToken = await this.jwtService.signAsync(
        { sub: user.id, username: user.username, mfa: true },
        { expiresIn: '5m' },
      );

      await this.usersService.update(user.id, {
        refreshToken: null,
      });

      res.cookie('mfa_token', mfaToken, {
        // httpOnly: true,
        maxAge: 300000,
        // secure: process.env.NODE_ENV === 'production' ? true : false, // use secure cookies in production
        // sameSite: 'lax',
        expires: new Date(Date.now() + 300000),
      });

      throw new UnauthorizedException({
        message: 'Invalid OTP',
        maskedTelephone: user.telephone.replace(
          user.telephone.slice(3, user.telephone.length - 3),
          '***',
        ),
        maskedEmail: user.email.replace(
          user.email.slice(3, user.email.indexOf('@')),
          '****',
        ),
        invalid: true,
      });
    }

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, username: user.username },
      { expiresIn: '1d' },
    );

    await this.usersService.update(user.id, {
      otp: null,
      refreshToken,
    });

    const payload = { sub: user.id, username: user.username };

    // Set cookies
    res.cookie('access_token', await this.jwtService.signAsync(payload), {
      // httpOnly: true,
      maxAge: 60000,
      // secure: process.env.NODE_ENV === 'production' ? true : false, // use secure cookies in production
      // sameSite: 'lax',
      expires: new Date(Date.now() + 60000),
    });

    res.cookie('refresh_token', refreshToken, {
      // httpOnly: true,
      maxAge: 86400000,
      // secure: process.env.NODE_ENV === 'production' ? true : false, // use secure cookies in production
      // sameSite: 'lax',
      expires: new Date(Date.now() + 86400000),
    });

    return res.json({ mfa: false });
  }

  async refreshToken(refreshToken: string, @Res() res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

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
      { expiresIn: '10m' },
    );

    await this.usersService.update(user.id, {
      refreshToken: newRefreshToken,
    });

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, username: user.username },
      { expiresIn: '1m' },
    );

    // Set cookies
    res.cookie('access_token', accessToken, {
      // httpOnly: true,
      maxAge: 60000,
      // secure: process.env.NODE_ENV === 'production' ? true : false, // use secure cookies in production
      // sameSite: 'lax',
      expires: new Date(Date.now() + 60000),
    });

    res.cookie('refresh_token', newRefreshToken, {
      // httpOnly: true,
      maxAge: 86400000,
      // secure: process.env.NODE_ENV === 'production' ? true : false, // use secure cookies in production
      // sameSite: 'lax',
      expires: new Date(Date.now() + 86400000),
    });

    return res.json({ message: 'Token refreshed' });
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

  async check(userObj: any) {
    const user = await this.usersService.findOne(userObj.username);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
