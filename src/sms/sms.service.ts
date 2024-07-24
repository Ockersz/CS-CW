import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  async sendMfaSms(number: string, otp: string, username: string) {
    const message = `Your OTP for ${username} is ${otp}. \nPlease do not share this with anyone.`;
    const SMS_KEY = process.env.SMS_API_KEY;
    try {
      const url = `https://e-sms.dialog.lk/api/v1/message-via-url/create/url-campaign?esmsqk=${SMS_KEY}&list=${number.toString()}&message=${encodeURIComponent(message)}`;
      const res = await axios.get(url);
      console.log(res.data);
      return res.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
