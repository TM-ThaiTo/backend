import { Token, TokenDocument } from "@auth/schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';

@Injectable()
export class TokenService {
    constructor(
        @InjectModel(Token.name) private readonly tokenModel: Model<TokenDocument>
    ) { }

    async create(data: any) {
        return await this.tokenModel.create(data);
    }

    async findOneTokenByRefreshToken(refreshToken: string) {
        return await this.tokenModel.findOne({ refreshToken }).exec();
    }

    async findOneTokenByAccessToken(accessToken: string) {
        return await this.tokenModel.findOne({ accessToken }).exec();
    }
}