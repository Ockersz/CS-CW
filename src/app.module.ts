import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EncrpytionModule } from './encrpytion/encrpytion.module';
import { Form } from './forms/entities/form.entity';
import { FormsModule } from './forms/forms.module';
import { MailController } from './mail/mail.controller';
import { MailModule } from './mail/mail.module';
import { Prescription } from './prescription/entities/prescription.entity';
import { PresDetail } from './prescription/entities/presdetail.entity';
import { PrescriptionModule } from './prescription/prescription.module';
import { RoleAccess } from './role-access/entities/role-access.entity';
import { RoleAccessModule } from './role-access/role-access.module';
import { Role } from './role/entities/role.entity';
import { RoleModule } from './role/role.module';
import { SmsModule } from './sms/sms.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Role, Form, RoleAccess, Prescription, PresDetail],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    MailModule,
    SmsModule,
    EncrpytionModule,
    RoleModule,
    FormsModule,
    RoleAccessModule,
    PrescriptionModule,
  ],
  controllers: [AppController, MailController],
  providers: [AppService],
})
export class AppModule {}
