import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FollowDocument = HydratedDocument<Follow>;

@Schema({ timestamps: true })
export class Follow {
    @Prop({ type: String, required: true }) idUser: string;
    @Prop({ type: String, required: true }) idFollow: string;
    @Prop({ type: Number, default: 0 }) request: number;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);