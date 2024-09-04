import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { Prescription } from './entities/prescription.entity';
import { PresDetail } from './entities/presdetail.entity';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prescription, PresDetail]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],

  controllers: [PrescriptionController],
  providers: [PrescriptionService],
})
export class PrescriptionModule {}
