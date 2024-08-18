import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormsService } from './forms.service';

@UseGuards(AuthGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  create(@Body() createFormDto: CreateFormDto, @Req() req: any) {
    return this.formsService.create(createFormDto, req?.user);
  }

  @Get()
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(+id);
  }

  @Get('paths')
  findPaths(@Req() req: any) {
    return this.formsService.findPaths(req?.user);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
    @Req() req: any,
  ) {
    return this.formsService.update(+id, updateFormDto, req?.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formsService.remove(+id);
  }

  @Put(':id/disable')
  disable(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.formsService.disable(+id, req?.user, body.status);
  }
}
