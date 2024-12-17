import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Token, TokenSchema, Verify, VerifySchema, Account, AccountSchema } from '@auth/schema/index';
import { AuthService } from '@auth/service/auth.service';
import { AuthController } from '@auth/controller/auth.controller';
import { UserModule } from '@/user/user.module';
import { MailModule } from '@/mail/mail.module';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@auth/strategy';
import { AccountService, TokenService, VerifyService } from '@auth/handle/index';
import { AccountController } from '@auth/controller/account.controller';
import { HiddenWordsModule } from '@/hidden_words/hidden_words.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: Verify.name, schema: VerifySchema },
      { name: Account.name, schema: AccountSchema }
    ]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('EXPIRES_IN'),
        }
      }),
      inject: [ConfigService]
    }),
    MailModule,
    UserModule,
    HiddenWordsModule,
  ],
  controllers: [AuthController, AccountController],
  providers: [JwtStrategy, AuthService, VerifyService, TokenService, AccountService],
  exports: [AuthService, AccountService],
})
export class AuthModule { }
