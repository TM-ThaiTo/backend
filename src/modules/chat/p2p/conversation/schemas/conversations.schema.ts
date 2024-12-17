import { Message } from '@/chat/p2p/message/schemas/message.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {

    @Prop({ required: true })
    slug: string;

    @Prop({ required: true })
    creator: string;

    @Prop({ required: true })
    recipient: string;

    @Prop({ type: String, required: true })
    key: string;

    @Prop({ default: 'padding', enum: ['padding', 'active', 'archived', 'blocked', 'nomessage'] })
    status: string;

    @Prop({ type: Message, default: null })
    lastMessageAt: Message;

    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}




export const ConversationSchema = SchemaFactory.createForClass(Conversation);
