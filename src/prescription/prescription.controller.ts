import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { PrescriptionService } from './prescription.service';

@UseGuards(AuthGuard)
@Controller('prescription')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.prescriptionService.create(body, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.prescriptionService.findAll(req.user);
  }

  @Delete(':id')
  delete(@Param('id') id: number, @Req() req: any) {
    return this.prescriptionService.delete(id, req.user);
  }
}
