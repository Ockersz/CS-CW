import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { RoleAccessService } from './role-access.service';

@UseGuards(AuthGuard)
@Controller('role-access')
export class RoleAccessController {
  constructor(private readonly roleAccessService: RoleAccessService) {}

  @HttpCode(HttpStatus.OK)
  @Get(':id/access')
  findAccess(@Param('id') id: string) {
    return this.roleAccessService.findAccess(+id);
  }

  @Patch(':id')
  async editRoleAccess(
    @Param('id') id: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    return await this.roleAccessService.editRoleAccess(id, body, req?.user);
  }
}
