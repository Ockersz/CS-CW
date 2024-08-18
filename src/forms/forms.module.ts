import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { Form } from './entities/form.entity';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Form]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [FormsController],
  providers: [FormsService],
})
export class FormsModule {}
