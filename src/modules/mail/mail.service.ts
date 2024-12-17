import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }


    async sendCodeVerify(email: string, userName: string, otp: string, type: string) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Welcome to Alex Social App! Confirm your Email!',
                template: './sendOTP',
                context: {
                    name: userName ?? 'User',
                    otp: otp,
                    type: type ?? 'Verify Account'
                },
            });
        } catch (error) { throw error }
    }

    async sendMessageLoginFailed(email: string, userName: string) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Welcome to Alex Social App! Confirm your Email!',
                template: './loginFailed',
                context: { name: userName, },
            });
        } catch (error) { throw error }
    }
}
