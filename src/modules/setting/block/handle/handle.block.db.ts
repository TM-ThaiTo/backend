import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Block, BlockDocument } from '../schemas/block.schema';

@Injectable()
export class HandleBlockDB {
    constructor(
        @InjectModel(Block.name) private readonly blockModel: Model<BlockDocument>
    ) { }

    async findAllBlockById(id: string) { return await this.blockModel.find({ idUser: id }); }
    async findAllByIdUserAndPageLimit(page: number, limit: number, idUser) { return await this.blockModel.find({ idUser }).skip((page - 1) * limit).limit(limit).exec(); }
    async totalDocumentBlockByIdUser(idUser: string) { return await this.blockModel.countDocuments({ idUser }); }
    async checkBlock(idCheck: string, idUserBlock: string) { return await this.blockModel.findOne({ idUser: idCheck, idUserBlock }); }
    async create(data: any) { return await this.blockModel.create(data) }
}