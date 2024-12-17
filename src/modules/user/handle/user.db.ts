import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@/user/schemas/user.schema';
import mongoose, { Model, Types } from 'mongoose';
import { validateObjectId } from '@/utils/validateId';

@Injectable()
export class HandleUserDatabase {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async totalDocumentUser() { return await this.userModel.countDocuments().exec(); }
    async registerUser(user: any) {
        try {
            const { idAccount, fullName, phone, address, userName, avatar } = user;
            const newUser = await this.userModel.create({ idAccount, fullName, avatar, phone, address, slug: userName, privateAccount: 0 });
            return newUser;
        } catch (error) { throw error }
    }
    async findAllUser(skip: number, limit: number) { return await this.userModel.find().skip(skip).limit(limit).exec(); }
    async updateFollowCount(userId: string, field: 'following' | 'follower', increment: number): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(userId)) { throw new BadRequestException('Invalid ObjectId'); }
        await this.userModel.updateOne(
            { _id: userId },
            { $inc: { [field]: increment } }
        ).exec();
    }
    async findOneUserBySlug(slug: string) { return await this.userModel.findOne({ slug }).exec(); }
    async findOneUserById(id: string) { const objectId = new Types.ObjectId(id); return await this.userModel.findOne({ _id: objectId }).exec(); }
    async findOneCustomerById(id: string) {
        const objectId = validateObjectId(id);
        return await this.userModel.findById({ _id: objectId }).exec();
    }
    async findOneAllDataUserByIdAccount(id: string) { return await this.userModel.findOne({ idAccount: id }).exec(); }
    async findAllDataUserById(id: string) { return await this.userModel.findById(id).exec() }
    async deleteAccountByIdAccount(id: string) { return await this.userModel.deleteOne({ idAccount: id }).exec(); }

    async searchCustomer(
        search: string,
        follower: string | null,
        following: string | null,
        post: string | null,
        report: string | null,
        page: number,
        limit: number
    ) {
        const query: any = {};
        if (search) {
            query['$or'] = [
                { slug: { $regex: search, $options: 'i' } },
                { idAccount: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
            ];
        }
        if (follower && !isNaN(Number(follower))) query['follower'] = Number(follower);
        if (following && !isNaN(Number(following))) query['following'] = Number(following);
        if (post && !isNaN(Number(post))) query.posts = Number(post);
        if (report && !isNaN(Number(report))) query.reports = Number(report);

        const skip = (page - 1) * limit;
        const customers = await this.userModel.find(query).skip(skip).limit(limit);
        const totalCustomers = await this.userModel.countDocuments(query);

        return {
            data: customers,
            pagination: {
                total: totalCustomers,
                page,
                limit,
                totalPages: Math.ceil(totalCustomers / limit),
            },
        };
    }
    async updateCustomer(data: any) { const { _id, ...updateData } = data; return await this.userModel.findOneAndUpdate({ _id }, { $set: updateData }, { new: true }); }
    async findUser(key: string, page: number, limit: number) {
        const skip = (page - 1) * limit; const query = {};
        if (key) query['slug'] = { $regex: key, $options: 'i' };
        return await this.userModel.find(query).skip(skip).limit(limit).exec();
    }
    async getUserFollowLarget(limit: number) { return await this.userModel.find({}).sort({ follower: -1 }).limit(limit); }
}