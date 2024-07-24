import { MailerService } from '@nestjs-modules/mailer';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMfaMail(email: string, otp: string, name: string) {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
          <h1 style="color: #4CAF50;">Hexagon IT Ltd.</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #f7f7f7; border-radius: 10px;">
          <p>Hello <b>${name}</b>,</p>
          <p>Your OTP for Multi-Factor Authentication is:</p>
          <h2 style="text-align: center; color: #4CAF50; font-size: '1.2rem';">${otp}</h2>
          <p>Please enter this OTP to complete your authentication process. This OTP is valid for 10 minutes.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
        </div>
        <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #777;">&copy; 2024 Hexagon IT Ltd.. All rights reserved.</p>
          <p style="font-size: 12px; color: #777;">
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>
    `;

    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Multi-Factor Authentication',
        html: htmlBody,
      })
      .then(() => {
        return {
          message: 'OTP sent to your email',
          status: HttpStatus.OK,
        };
      })
      .catch((error) => {
        throw new InternalServerErrorException(error);
      });
  }
}
