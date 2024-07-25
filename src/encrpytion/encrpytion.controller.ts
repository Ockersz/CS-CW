import { Controller, Get, Query } from '@nestjs/common';
import { EncrpytionService } from './encrpytion.service';

@Controller('encrpytion')
export class EncrpytionController {
  constructor(private readonly encrpytionService: EncrpytionService) {}

  @Get('encrypt')
  encrypt(@Query('data') data: string): string {
    return this.encrpytionService.encrypt(data);
  }

  @Get('decrypt')
  decrypt(@Query('data') encryptedData: string): string {
    return this.encrpytionService.decrypt(encryptedData);
  }
}
