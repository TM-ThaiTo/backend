import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MessageGroup } from '../../message-group/schemas/message-group.schema';

export type ConversationGroupDocument = HydratedDocument<ConversationGroup>;

@Schema({ timestamps: true })
export class ConversationGroup {
    @Prop({ type: String, required: true }) slug: string;
    @Prop({ type: String, required: true }) creator: string;
    @Prop({ type: String, required: true }) key: string;
    @Prop({ type: String, required: true }) status: string;
    @Prop({ type: String }) avatar: string;
    @Prop({ type: String, required: true }) name: string;
    @Prop({ type: String, required: true }) owner: string;
    @Prop({ type: Number, required: true, default: 0 }) totalMember: number;
    @Prop({ type: [], required: true }) members: string[];
    @Prop({ type: MessageGroup, default: null }) lastMessageAt: MessageGroup;

    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const ConversationGroupSchema = SchemaFactory.createForClass(ConversationGroup);
