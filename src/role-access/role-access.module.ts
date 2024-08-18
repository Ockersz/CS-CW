import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RoleAccess } from './entities/role-access.entity';
import { RoleAccessController } from './role-access.controller';
import { RoleAccessService } from './role-access.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleAccess]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [RoleAccessController],
  providers: [RoleAccessService],
})
export class RoleAccessModule {}
