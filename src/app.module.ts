import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailController } from './mail/mail.controller';
import { MailModule } from './mail/mail.module';
import { SmsModule } from './sms/sms.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { EncrpytionModule } from './encrpytion/encrpytion.module';

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
      entities: [User],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    MailModule,
    SmsModule,
    EncrpytionModule,
  ],
  controllers: [AppController, MailController],
  providers: [AppService],
})
export class AppModule {}
