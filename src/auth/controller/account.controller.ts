import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, Req } from '@nestjs/common';
import Routes from '@/utils/constants/endpoint';
import { AccountService } from '@auth/handle';
import { CreateAccountDto } from '@auth/dto/create.account.dto';
import { HandleUserDatabase } from '@/user/handle/user.db';
import * as argon2 from "argon2";

@Controller(Routes.ACCOUNT)
export class AccountController {

    constructor(
        private readonly accountService: AccountService,
        private readonly handleUser: HandleUserDatabase,
    ) { }

    @Get('all')
    async getAllAccount(
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        const skip = (page - 1) * limit;
        const accounts = await this.accountService.getAllAccount(skip, limit);
        const totalAccount = await this.accountService.totalAccount();

        const _query = {
            page: Number(page),
            limit: Number(limit),
            total: totalAccount,
            total_page: Math.ceil(accounts.length / limit)
        }
        return {
            code: 0,
            message: 'Success',
            data: {
                _query: _query,
                accounts: accounts,
            },
        }
    }

    @Get('/search')
    async searchAccount(
        @Query('search') search: string,
        @Query('type') type: string,
        @Query('roleName') roleName: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        try {
            const { accounts, totalCount } = await this.accountService.searchAccount(search, type, roleName, page, limit);

            const _query = {
                page: Number(page),
                limit: Number(limit),
                total: totalCount,
                total_page: Math.ceil(accounts.length / limit)
            }
            return {
                code: 0,
                message: 'Success',
                data: {
                    _query: _query,
                    accounts: accounts,
                },
            }
        } catch (error) {
            throw new BadRequestException(error)
        }

    }

    @Get('/item/:id')
    async getItemAccoun(@Param('id') id: string) {
        try {
            const account = await this.accountService.findOneAccountById(id);
            if (!account) throw new NotFoundException('Account not found');
            return { code: 0, message: 'success', data: account, }
        } catch (e) { throw new BadRequestException('error delete account') }
    }

    @Post('create')
    async createAccount(@Body() dto: CreateAccountDto) {
        try {
            const { email, userName, name, password, type, roles, verify } = dto;
            const checkEmail = await this.accountService.findOneAccountByEmail(email);
            if (checkEmail) throw new BadRequestException('Email đã tồn tại');
            const checkUserName = await this.handleUser.findOneUserBySlug(userName);
            if (checkUserName) throw new BadRequestException('UserName đã tồn tại');

            const hashPassword = await argon2.hash(password);
            const dataAccount = {
                email: email,
                userName: userName,
                hashPassword: hashPassword,
                type: type === 'GOOGLE' ? 2 : type === 'GITHUB' ? 3 : 1,
                roles: [roles],
                verifyAccount: verify,
            }
            const account = await this.accountService.create(dataAccount);
            const dataUser = {
                idAccount: account?.id,
                fullName: name,
                userName: userName,
                phone: '',
                address: '',
                theme: 0,
                lang: 'en',
                publicProfile: 0,
                gender: 0,
            }
            await this.handleUser.registerUser(dataUser);
            return { code: 0, message: 'Success' }
        } catch (e) {
            throw new BadRequestException('Error create');
        }
    }

    @Delete('delete/:id')
    async deleteAccount(@Param('id') id: string) {
        try {
            const account = await this.accountService.findOneAccountById(id);
            if (!account) throw new NotFoundException('Account not found');
            const idAccount = account?.id;
            await this.accountService.deleteAccountById(id);
            await this.handleUser.deleteAccountByIdAccount(idAccount);
            return { code: 0, message: 'Success' }
        } catch (e) { throw new BadRequestException('error delete account') }
    }

    @Put(':id')
    async updateAccount(@Param('id') id: string, @Body() dto: any) {
        try {
            const findAccount = await this.accountService.findOneAccountById(id);
            if (!findAccount) throw new NotFoundException('account not found');

            const { email, userName, password, type, roles, verify, failedLogin } = dto;

            let hashPassword = findAccount.hashPassword;
            if (password) {
                hashPassword = await argon2.hash(password);
            }

            let typeAccount = type === 'GOOGLE' ? 2 : type === 'GITHUB' ? 3 : 1;

            const data = {
                email: email || findAccount.email,
                userName: userName || findAccount.userName,
                password: hashPassword,
                type: typeAccount || findAccount.type,
                // roles: [roles] || findAccount.roles,
                verifyAccount: typeof verify !== 'undefined' ? verify : findAccount.verifyAccount,
                failedLogin: typeof failedLogin !== 'undefined' ? failedLogin : findAccount.failedLogin,
            };

            await this.accountService.updateAccount(id, data);
            return { message: 'Account updated successfully' };
        } catch (e) {
            throw new BadRequestException('error update');
        }
    }
}