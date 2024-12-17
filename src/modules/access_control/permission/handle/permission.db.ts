import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Permission, PermissionDocument } from "@/access_control/permission/schema/permission.schema";
import { Model } from "mongoose";
import { validateObjectId, validateId } from '@/utils/validateId';
import { CreatePermissionDto } from '@/access_control/permission/dto/create-permission.dto';

@Injectable()
export class PermissionServiceDB {
    constructor(
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    ) { }

    async findOnePermissionById(id: string) {
        return await this.permissionModel.findById(validateObjectId(id)).exec();
    }

    async findPermissionById(id: string) {
        return await this.permissionModel.findOne({ _id: validateObjectId(id) }).exec();
    }

    async findPermissionByIdAndEndpointAndMethod(id: string, endpoint: string, method: string) {
        return await this.permissionModel.findOne({ _id: id, endpoint, method }).exec();
    }

    async findPermissionByEndpointAndMethod(endpoint: string, method: string) {
        return await this.permissionModel.findOne({ endpoint, method }).exec();
    }

    async totalPermissions() {
        return await this.permissionModel.countDocuments().exec();
    }

    async getAllPermissionsPage(skip: number, limit: number) {
        return await this.permissionModel.find().skip(skip).limit(limit).exec();
    }

    async getAllPermissions() {
        return await this.permissionModel.find().exec();
    }

    async createPermission(permission: CreatePermissionDto) {
        return await this.permissionModel.create(permission);
    }

    async deletePermissionById(id: string) {
        const idValidated = validateObjectId(id);
        return await this.permissionModel.findByIdAndDelete(idValidated).exec();
    }

    async updatePermissionById(id: string, permission: CreatePermissionDto) {
        const idValidated = validateObjectId(id);
        return await this.permissionModel.findByIdAndUpdate(idValidated, permission, { new: true }).exec();
    }

    async searchPermissions(
        search: string,
        method: string,
        module: string,
        page: number = 1,
        limit: number = 10
    ) {
        const query: any = {};

        if (search) {
            query['$text'] = { $search: search };
        }

        if (method) {
            query['method'] = method;
        }

        if (module) {
            query['module'] = module;
        }

        // Tính toán skip dựa trên số trang
        const skip = (page - 1) * limit;

        const total = await this.permissionModel.countDocuments(query).exec();
        const permissions = await this.permissionModel.find(query).skip(skip).limit(limit).exec();

        return { permissions, total };
    }
}