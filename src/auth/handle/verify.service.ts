import { Verify, VerifyDocument } from "@auth/schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class VerifyService {

    constructor(
        @InjectModel(Verify.name) private readonly verifyModel: Model<VerifyDocument>,
    ) { }

    async create(data: any) {
        return await this.verifyModel.create(data);
    }

    async findOneByEmail(email: string) {
        return await this.verifyModel.findOne({ email });
    }

    async findOneVerifyByEmailAndCode(email: string, code: string) {
        return await this.verifyModel.findOne({ email, code }).exec();
    }

    async deleteOneVerifyByEmailAndCode(email: string, code: string) {
        return await this.verifyModel.deleteOne({ email, code }).exec();
    }

    async updateOneVerifyByEmailAndCode(email: string, data: any) {
        return await this.verifyModel.updateOne({ email }, { data });
    }
}