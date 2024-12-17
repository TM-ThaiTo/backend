import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { RegisterDto, LoginDto, ForgotPasswordDto, VerifyAccountDto, LoginWithGoogleDto } from '@auth/dto/index.dto';
import { MailService } from '@/mail/mail.service';
import { env } from 'process';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import * as argon2 from "argon2";
import { HandleUserDatabase } from '@/user/handle/user.db';
import { AccountService, TokenService, VerifyService } from '@auth/handle/index';
import { HandleHiddenWordsDatabase } from '@/hidden_words/handle/handle.hiddenWord.db';

@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly handleUserDatabase: HandleUserDatabase,
        private readonly accountService: AccountService,
        private readonly tokenService: TokenService,
        private readonly verifyService: VerifyService,
        private readonly handleHiddenWordDatabase: HandleHiddenWordsDatabase,
    ) { }

    // fn: service register user
    async registerService(registerDto: RegisterDto) {
        try {
            const { email, password, userName, fullName, phone, address } = registerDto;
            const isEmailExists = await this.accountService.findOneAccountByEmail(email);
            if (isEmailExists) throw new BadRequestException({ code: 1, message: 'Email already exists' })

            const isUserExists = await this.handleUserDatabase.findOneUserBySlug(userName);
            if (isUserExists || isEmailExists?.userName === userName) throw new BadRequestException({ code: 2, message: 'UserName already exists' })

            const newAccount = await this.accountService.registerAccount({ email, password, userName });
            const user = await this.handleUserDatabase.registerUser({ idAccount: newAccount?.id, fullName, phone, address, userName });
            await this.handleHiddenWordDatabase.create(user?.id);

            const code = uuidv4();
            const codeExpired = dayjs().add(5, 'minute');
            const newVerify = { email, type: 1, code, codeExpired };
            await this.verifyService.create(newVerify);

            setImmediate(async () => {
                try {
                    const otp = code;
                    await this.mailService.sendCodeVerify(email, fullName, otp, 'Verify Account');
                } catch (emailError) {
                    console.error('Failed to send verification email:', emailError);
                }
            });

            return { code: 0, message: 'Success', data: newAccount._id };
        } catch (error) { throw error }
    }

    // fn: get id account verify
    async getIdAccountVerify(email: string) {
        try {
            const account = await this.accountService.findOneAccountByEmail(email);
            if (!account) throw new NotFoundException({ code: 1, message: 'Account not found' })
            if (account?.verifyAccount) throw new BadRequestException({ code: 2, message: "Account is active" })
            return { code: 0, message: 'success', data: account?.id }
        } catch (error) { throw error }
    }

    // fn: verify account 
    async checkCode(verify: VerifyAccountDto) {
        try {
            const { _id, code } = verify;
            const account = await this.accountService.findOneAccountById(_id);
            if (!account) throw new NotFoundException({ code: 1, message: "Tài khoản không tồn tại" });
            if (account.verifyAccount) throw new BadRequestException({ code: 2, message: "Tài khoản đã kích hoạt" })

            const verifyCode = await this.verifyService.findOneVerifyByEmailAndCode(account.email, code);
            if (!verifyCode) throw new BadRequestException({ code: 2, message: "Code hết hạn hoặc chưa tồn tại" });

            const isBeforeCheck = dayjs().isBefore(verifyCode?.codeExpired);
            if (isBeforeCheck) {
                await account.updateOne({ verifyAccount: true });
                await this.verifyService.deleteOneVerifyByEmailAndCode(account?.email, verifyCode?.code);
                return { code: 0, message: 'Success' }
            } else {
                throw new BadRequestException({ code: 3, message: 'Code hết hạn' })
            }
        } catch (error) { throw error }
    }

    // fn: retry code
    async retryCodeVerifyAccountService(email: string, type: string) {
        try {
            const account = await this.accountService.findOneAccountByEmail(email);
            if (!account) throw new NotFoundException({ code: 1, message: "Tài khoản không tồn tại" });
            if (account.verifyAccount) throw new BadRequestException({ code: 2, message: "Tài khoản đã kích hoạt" })

            const user = await this.handleUserDatabase.findOneUserBySlug(account?.userName);
            if (!user) throw new BadRequestException({ code: 3, message: "Lỗi thông tin người dùng" });
            setImmediate(async () => {
                try {
                    const code = uuidv4();
                    const codeExpired = dayjs().add(5, 'minute');
                    await this.verifyService.updateOneVerifyByEmailAndCode(email, { code, codeExpired });
                    await this.mailService.sendCodeVerify(email, user?.fullName, code, type);
                } catch (emailError) {
                    console.error('Failed to send verification email:', emailError);
                }
            });
            return { code: 0, message: 'Success', data: account._id };
        } catch (error) { throw error }
    }

    // fn: service login user
    async loginService(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const account = await this.accountService.validateAccount(email, password);
        // check logged failed
        const user = await this.handleUserDatabase.findOneUserBySlug(account?.userName);
        if (account.failedLogin >= 5 && user) {
            await this.mailService.sendMessageLoginFailed(account.email, user?.fullName || "User");
            throw new BadRequestException({ code: 4, message: 'Login failed too many times' });
        }

        const accessToken = await this.signToken(account?.id, env.EXPIRES_IN_ACCESSTOKEN);
        const refreshToken = await this.signToken(account?.id, env.EXPIRES_IN_REFRESHTOKEN);

        await this.tokenService.create({ idAccount: account.id, email: account.email, accessToken: accessToken, refreshToken: refreshToken });

        account.failedLogin = 0;
        await account.save();

        const EXPIRE_TIME = 20 * 1000;
        return {
            code: 0,
            message: 'Success',
            user: {
                id: user?.id,
                name: user?.fullName,
                email: account?.email,
                slug: user?.slug,
                avatar: user?.avatar,
            },
            backendTokens: {
                accessToken: accessToken,
                refreshToken: refreshToken,
                expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
            }
        };
    }

    // fn: service logout user
    async logoutService(token: string) {
        try {
            const tokenData = await this.tokenService.findOneTokenByAccessToken(token);
            if (!tokenData) return { code: 0, message: 'Success' };
            await tokenData.deleteOne();
            return { code: 0, message: 'Success' };
        }
        catch (error) { throw error; }
    }

    // fn: refresh token
    async refreshTokenService(refresh_token: string) {
        try {
            if (!refresh_token) { throw new BadRequestException('Refresh token is missing'); }
            const token = await this.tokenService.findOneTokenByRefreshToken(refresh_token);
            if (!token) { throw new BadRequestException('Invalid refresh token'); }

            const email = token.email;
            const account = await this.accountService.findOneAccountByEmail(email);

            // Check token expiration
            const tokenCreatedAt = Math.floor(token.createdAt.getTime() / 1000);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const expiresIn = tokenCreatedAt - currentTimestamp;

            if (expiresIn >= 0) { throw new BadRequestException('Refresh token has expired'); }
            if (!account) { throw new BadRequestException("Account not found") }

            const accessToken = await this.signToken(account?.id, env.EXPIRES_IN_ACCESSTOKEN);
            await token.updateOne({ accessToken });
            const EXPIRE_TIME = 20 * 1000;
            return {
                accessToken: accessToken,
                refreshToken: token?.refreshToken,
                expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
            };
        } catch (error) { throw error; }
    }

    // fn: forgot password
    async forgotPasswordService(req: ForgotPasswordDto) {
        try {
            const { email, password, code } = req;
            const checkVerifyCode = await this.verifyService.findOneVerifyByEmailAndCode(email, code);
            if (!checkVerifyCode) { throw new BadRequestException("Verify not found") }

            const account = await this.accountService.findOneAccountByEmail(email);
            if (!account) { throw new BadRequestException("Account not found"); }

            const hashPassword = await argon2.hash(password);
            account.hashPassword = hashPassword;
            await account.save();
            await this.verifyService.deleteOneVerifyByEmailAndCode(email, code);
            return { code: 0, message: "Success" };
        } catch (error) { throw error };
    }

    async retryCodeForgotPasswordService(email: string, type: string) {
        try {
            const account = await this.accountService.findOneAccountByEmail(email);
            if (!account) throw new NotFoundException({ code: 1, message: "Tài khoản không tồn tại" });

            const user = await this.handleUserDatabase.findOneUserBySlug(account?.userName);
            if (!user) throw new BadRequestException({ code: 3, message: "Lỗi thông tin người dùng" });
            setImmediate(async () => {
                try {
                    const verifyCode = await this.verifyService.findOneByEmail(email);
                    if (verifyCode) {
                        const code = uuidv4();
                        const codeExpired = dayjs().add(5, 'minute');
                        await this.verifyService.updateOneVerifyByEmailAndCode(email, { code, codeExpired, type: 2 })
                        await this.mailService.sendCodeVerify(email, user?.fullName, code, type);
                    } else {
                        const code = uuidv4();
                        const codeExpired = dayjs().add(5, 'minute');
                        await this.verifyService.create({ email, code, codeExpired, type: 2 })
                        await this.mailService.sendCodeVerify(email, user?.fullName, code, type);
                    }
                } catch (emailError) {
                    console.error('Failed to send verification email:', emailError);
                }
            });
            return { code: 0, message: 'Success', data: account._id };
        } catch (error) { throw error }
    }

    // fn: generate token
    async signToken(userId: string, expiresIn: string) {
        const payload = { sub: userId };
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: expiresIn,
            secret: process.env.JWT_SECRET || 'default_secret',
        });
        return token;
    }

    async loginWithGoogleService(dto: LoginWithGoogleDto) {
        try {
            const { tokenId, email, name, image, provider } = dto;
            const account = await this.accountService.findOneAccountByEmail(email);

            if (account) {
                const user = await this.handleUserDatabase.findOneUserBySlug(account.userName);
                if (user) {
                    const accessToken = await this.signToken(account.id, env.EXPIRES_IN_ACCESSTOKEN);
                    const refreshToken = await this.signToken(account.id, env.EXPIRES_IN_REFRESHTOKEN);
                    await this.tokenService.create({ idAccount: account.id, email: account.email, accessToken: accessToken, refreshToken: refreshToken });
                    const EXPIRE_TIME = 20 * 1000;
                    return {
                        code: 0,
                        message: 'Success',
                        user: {
                            id: user.id,
                            name: user.fullName,
                            email: account.email,
                            slug: user.slug,
                            avatar: user.avatar,
                        },
                        backendTokens: {
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
                        }
                    }
                } else throw new NotFoundException({ code: 1, message: 'User not found' });
            }
            else {
                const username = email.replace('@gmail.com', '');
                const newAccount = await this.accountService.registerAccount({ email, password: tokenId, userName: username, provider });

                const dataU = {
                    idAccount: newAccount?.id,
                    fullName: name,
                    phone: '',
                    address: '',
                    userName: username,
                    avatar: image,
                    theme: 0,
                    lang: 'en',
                    publicProfile: 0,
                    gender: 0,
                }
                const user = await this.handleUserDatabase.registerUser(dataU);
                await this.handleHiddenWordDatabase.create(user?.id);
                const accessToken = await this.signToken(newAccount?.id, env.EXPIRES_IN_ACCESSTOKEN);
                const refreshToken = await this.signToken(newAccount?.id, env.EXPIRES_IN_REFRESHTOKEN);
                await this.tokenService.create({ idAccount: newAccount.id, email: newAccount.email, accessToken: accessToken, refreshToken: refreshToken });
                return {
                    code: 0,
                    message: 'Success',
                    user: {
                        id: newAccount.id,
                        name: name,
                        email: email,
                        slug: username,
                        avatar: image,
                    },
                    backendTokens: {
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    }
                }
            }
        } catch (error) {
            console.log(error);
            throw error
        }
    }
}