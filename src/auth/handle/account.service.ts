import { BadRequestException, Injectable } from "@nestjs/common";
import { Account, AccountDocument } from "@auth/schema/index";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';
import * as argon2 from "argon2";
import { CreateAccount } from "@auth/types";
import { Role } from "@constants/index";

@Injectable()
export class AccountService {
    constructor(
        @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
    ) { }

    async findOneAccountByEmail(email: string) { return await this.accountModel.findOne({ email }).exec(); }
    async getAllAccount(skip: number, limit: number) { return await this.accountModel.find().skip(skip).limit(limit).select('-hashPassword').exec(); }
    async totalAccount() { return await this.accountModel.countDocuments(); }
    async create(data: any) { return await this.accountModel.create(data); }
    async findOneAccountById(id: string) { const objectId = new Types.ObjectId(id); return await this.accountModel.findOne({ _id: objectId }).exec(); }
    async deleteAccountById(id: string) { const objectId = new Types.ObjectId(id); return await this.accountModel.deleteOne({ _id: objectId }).exec(); }

    async validateAccount(email: string, password: string) {
        try {
            const account = await this.accountModel.findOne({ email }).exec();
            if (!account) throw new BadRequestException({ code: 1, message: 'Account already exists' });
            if (account?.verifyAccount === false) throw new BadRequestException({ code: 2, message: 'Account chưa kích hoat' });

            if (!await argon2.verify(account?.hashPassword, password)) {
                account.failedLogin += 1;
                await account.save();
                throw new BadRequestException({ code: 3, message: 'Password is incorrect' });
            }
            return account;
        } catch (error) { throw error }
    }
    async registerAccount(account: CreateAccount) {
        try {
            const { email, userName, password, provider } = account;
            const typeAccount = provider === 'google' ? 2 : provider === 'github' ? 3 : 1;

            const roles: string[] = [Role.USER];
            const hashPassword = await argon2.hash(password);
            const newAccount = await this.accountModel.create({ email, password, userName, roles, hashPassword, verifyAccount: false, type: typeAccount });
            return newAccount;
        } catch (error) { throw error }
    }
    async searchAccount(search: string, type: string, roleName: string, page: number, limit: number,) {
        const query = {};
        if (search) query['$text'] = { $search: search };
        if (roleName) query['roles'] = { $in: [roleName] };

        if (type) {
            const typeNumber = type == 'GOOGLE' ? 2 : type === 'GITHUB' ? 3 : 1;
            query['type'] = typeNumber;
        }

        const skip = (page - 1) * limit;
        const accounts = await this.accountModel.find(query).skip(skip).limit(limit).exec();
        const totalCount = await this.accountModel.countDocuments(query);

        return { accounts, totalCount };
    }

    async updateAccount(id: string, data: any) {
        return await this.accountModel.findByIdAndUpdate(id, data, { new: true });
    }

}