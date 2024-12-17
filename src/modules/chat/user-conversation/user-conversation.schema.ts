import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserConversationDocument = HydratedDocument<UserConversation>;

@Schema({ timestamps: true })
export class UserConversation {

    @Prop({ type: String, required: true }) idUser: string;
    @Prop({ type: String, required: true }) userName: string;
    @Prop({ type: String, required: true }) idConversation: string;
    @Prop({ type: String, required: true }) slug: string;
    @Prop({ type: String, required: true }) displayName: string;
    @Prop({ type: Number, required: true }) type: number; // 0: p2p, 1: group
    @Prop({ type: Number, required: true }) status: number; // -1: block, 0: nomessage, 1: padding, 2: accept, 3: delete
    @Prop({ type: Number, required: true }) notification: number; // 0: off, 1: on
    @Prop({ type: Number, required: true }) pin: number; // 0: unpin, 1: pin
    @Prop({ type: String, default: null }) idDelete: string;

    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export const UserConversationSchema = SchemaFactory.createForClass(UserConversation);
