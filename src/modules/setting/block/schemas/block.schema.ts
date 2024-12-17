import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlockDocument = HydratedDocument<Block>;

@Schema({ timestamps: true })
export class Block {

    @Prop({ required: true, type: String })
    idUser: string;

    @Prop({ required: true, type: String, default: null })
    idUserBlock: string;

    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const BlockSchema = SchemaFactory.createForClass(Block);