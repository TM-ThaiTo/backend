import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update.dto';
import { STATUS_MESSAGE } from 'src/constants';
import { HandlePostDatabase } from '@/post/handle';
import { HandleUserDatabase } from '../handle/user.db';
import { HandleFollowDatabase } from '@/follows/handle';

@Injectable()
export class UserAdminService {

    constructor(
        private readonly handleUserDatabase: HandleUserDatabase,
        private readonly handlePostDatabase: HandlePostDatabase,
        private readonly handleFollowDatabase: HandleFollowDatabase,
    ) { }

    async GetAllUserService(page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;

            const users = await this.handleUserDatabase.findAllUser(skip, limit);
            if (!users) { throw new NotFoundException(STATUS_MESSAGE.USER_MESSAGE.ERROR.LIST_USER_NOT_FOUND) };

            const totalUsers = await this.handleUserDatabase.totalDocumentUser();

            const _query = {
                page: Number(page),
                limit: Number(limit),
                total: users?.length,
                total_page: (totalUsers / limit)
            }
            return { code: 0, message: 'Success', data: { _query, users } }
        } catch (error) { throw error; }
    }

    async searchCustomers(search: string, follower: string | null, following: string | null, post: string | null, report: string | null, page: number, limit: number) {
        try {
            const { data, pagination } = await this.handleUserDatabase.searchCustomer(search, follower, following, post, report, page, limit);
            if (!data) throw new NotFoundException('Customer not found');

            return {
                code: 0,
                message: 'Success',
                data: {
                    _query: pagination,
                    users: data,
                }
            }
        } catch (e) {
            throw new BadRequestException('error search customer')
        }
    }

    async PutUpdateUserService(req: any) {
        try {
            if (!req || !req?._id) throw new BadRequestException("Missing data or _id");
            await this.handleUserDatabase.updateCustomer(req);
            return {
                code: 0,
                message: 'Success'
            }
        } catch (error) {
            throw new BadRequestException('error update customer');
        }
    }
}