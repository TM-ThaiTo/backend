import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST', 'smtp.gmail.com'),
          secure: false,
          auth: {
            user: config.get('MAIL_USER', 'default_email@gmail.com'),
            pass: config.get('MAIL_PASSWORD', 'default_password'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('MAIL_FROM', 'no-reply@example.com')}>`,
        },
        template: {
          // dir: join(__dirname, 'templates'),
          dir: process.cwd() + '/src/modules/mail/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
