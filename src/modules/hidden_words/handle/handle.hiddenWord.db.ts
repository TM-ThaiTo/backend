import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HiddenWord, HiddenWordDocument } from "../schemas/hidden_word.schema";

@Injectable()
export class HandleHiddenWordsDatabase {
    constructor(
        @InjectModel(HiddenWord.name) private readonly hiddenWordsModel: Model<HiddenWordDocument>,
    ) { }

    async create(idUser: string) { return await this.hiddenWordsModel.create({ idUser }); }
    async findOneByIdUser(idUser: string) { return await this.hiddenWordsModel.findOne({ idUser }).exec() };
    async findOneById(id: string) { return await this.hiddenWordsModel.findById(id).exec() };
}
