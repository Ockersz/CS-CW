import { Module } from '@nestjs/common';
import { EncrpytionController } from './encrpytion.controller';
import { EncrpytionService } from './encrpytion.service';

@Module({
  controllers: [EncrpytionController],
  providers: [EncrpytionService],
  exports: [EncrpytionService],
})
export class EncrpytionModule {}
