import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { AuthService } from '@auth/service/auth.service';
import { Request } from 'express';
import { ForgotPasswordDto, RegisterDto, LoginDto, VerifyAccountDto, LoginWithGoogleDto } from '@auth/dto/index.dto';
import Routes from '@/utils/constants/endpoint';

@Controller(Routes.AUTH)
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('register')
    async RegisterUserController(@Body() registerDto: RegisterDto) {
        return await this.authService.registerService(registerDto);
    }

    @Get('account-verify/:email')
    async getIdAccountVerify(@Param('email') email: string) {
        return await this.authService.getIdAccountVerify(email);
    }

    @Post('google')
    async loginGoogle(@Body() body: LoginWithGoogleDto) {
        return await this.authService.loginWithGoogleService(body);
    }

    @Post('check-code')
    async verifyAccount(@Body() verify: VerifyAccountDto) {
        return await this.authService.checkCode(verify);
    }

    @Post('retry-code')
    async retryCode(@Body() body: { email: string }) {
        const { email } = body;
        return await this.authService.retryCodeVerifyAccountService(email, 'Verify Account');
    }

    @Post('login')
    async LoginController(@Body() loginDto: LoginDto) {
        return await this.authService.loginService(loginDto);
    }

    @Post('logout')
    async LogoutUserController(@Req() req: Request) {
        const accessToken = req.headers['authorization']?.split(' ')[1];
        return await this.authService.logoutService(accessToken);
    }

    @Post('forgot')
    async ForgotPasswordController(@Body() req: ForgotPasswordDto) {
        return await this.authService.forgotPasswordService(req);
    }

    @Post('retry-code-forgotpassword')
    async retryCodeForgotpassword(@Body() body: { email: string }) {
        const { email } = body;
        return await this.authService.retryCodeForgotPasswordService(email, 'Forgot Password');
    }

    @Post('refresh')
    async RefreshTokenController(@Body('refreshToken') refreshToken: string) {
        return await this.authService.refreshTokenService(refreshToken);
    }
}