import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Role, RoleDocument } from "@/access_control/role/schema/role.schema";
import { Model } from "mongoose";
import { UpdateRoleDto } from "@/access_control/role/dto/update-role.dto";
import { validateObjectId } from "@/utils/validateId";
import { CreateRoleDto } from "../dto/create-role.dto";

@Injectable()
export class RoleServiceDB {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    ) { }

    // Tạo role SUPER_ADMIN nếu chưa tồn tại
    public async initRoleSuperAdmin_NormalUser() {
        const existingRoleSuper_Admin = await this.roleModel.findOne({ roleName: 'SUPER_ADMIN' });
        if (!existingRoleSuper_Admin) {
            const superAdminRole = new this.roleModel({
                roleName: 'SUPER_ADMIN',
                description: 'Super administrator with full access',
                active: true,
                permission: [],
            });
            await superAdminRole.save();
        }

        const existingRoleNormal_User = await this.roleModel.findOne({ roleName: 'NORMAL_USER' });
        if (!existingRoleNormal_User) {
            const normalUserRole = new this.roleModel({
                roleName: 'NORMAL_USER',
                description: 'Normal user with limited access',
                active: true,
                permission: [],
            });
            await normalUserRole.save();
        }
    }

    async findRoleByRoleName(role_name: string) {
        return await this.roleModel.findOne({ roleName: role_name }).exec();
    }

    async getDashboardByRoleName(role_name: any) {
        return await this.roleModel.findOne({ roleName: role_name }).exec();
    }

    async getAllRole() {
        return await this.roleModel.find().exec();
    }

    async findRoleById(id: string) {
        const roleId = validateObjectId(id);
        return await this.roleModel.findOne({ _id: roleId }).exec();
    }

    async findAllRole(skip: number, limit: number) {
        return await this.roleModel.find().skip(skip).limit(limit).exec();
    }

    async totalRole() {
        return await this.roleModel.countDocuments().exec();
    }

    async searchRole(
        search: string,
        roleName: string,
        active: boolean | string,
        page: number,
        limit: number
    ) {
        const skip = (page - 1) * limit;

        const query: any = {};
        if (search) {
            query['$text'] = { $search: search };
        }

        if (roleName) {
            query['roleName'] = roleName;
        }

        if (typeof active === 'boolean') {
            query['active'] = active;
        }
        const total = await this.roleModel.countDocuments(query).exec();
        const roles = await this.roleModel.find(query).skip(skip).limit(limit).exec();
        return { total, roles };
    }

    async updateRole(data: UpdateRoleDto) {
        const id = validateObjectId(data.id);
        return await this.roleModel.findOneAndUpdate({ _id: id }, data).exec();
    }

    async createRole(data: CreateRoleDto) {
        const newRole = new this.roleModel(data);
        return await newRole.save();
    }

    async removeRole(idR: string) {
        const id = validateObjectId(idR);
        return await this.roleModel.findOneAndDelete({ _id: id }).exec();
    }
}