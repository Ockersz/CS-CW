import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getUsers(@Req() req: any) {
    return await this.userService.getUsers(req?.user);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return await this.userService.getUserById(req?.user.id);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('profile')
  async updateProfile(@Req() req: any) {
    return await this.userService.update(req?.user.id, req.body);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('/:id/disable')
  async disableUser(@Param('id') id: number, @Req() req: any) {
    return await this.userService.disableUser(id, req?.user.id);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('/:id/role')
  async updateRole(@Param('id') id: number, @Req() req: any) {
    return await this.userService.updateRole(id, req.body, req?.user.id);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/paths')
  async findPaths(@Req() req: any) {
    return await this.userService.findPaths(req?.user);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('protected')
  protected(@Req() req: any, @Body() body: any) {
    return this.userService.protected(req?.user, body.path);
  }
}
