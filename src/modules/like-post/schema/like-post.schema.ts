import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LikePostDocument = HydratedDocument<LikePost>;

@Schema({ timestamps: true })
export class LikePost {
    @Prop({ required: true })
    idPost: string;

    @Prop({ required: true })
    idUser: string;
}

export const LikePostSchema = SchemaFactory.createForClass(LikePost);