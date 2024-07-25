import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';

@Injectable()
export class EncrpytionService {
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor() {
    this.publicKey = fs.readFileSync('public_key.pem', 'utf8');
    this.privateKey = fs.readFileSync('private_key.pem', 'utf8');
  }

  encrypt(data: string): string {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: this.publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer,
    );
    return encrypted.toString('base64');
  }

  decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        passphrase: '', // Add passphrase if necessary
      },
      buffer,
    );
    return decrypted.toString('utf8');
  }

  getPublicKey(): string {
    return this.publicKey;
  }
}
