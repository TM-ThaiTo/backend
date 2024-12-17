import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true })
export class Account {
    @Prop({ unique: true, required: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
    email: string;

    @Prop({ required: true })
    userName: string;

    @Prop({ required: true })
    hashPassword: string;

    @Prop({ required: true })
    type: number; // type: 1-LOCAL, 2-GOOGLE, 3-GITHUB

    @Prop({ required: true, default: 0 })
    failedLogin: number;

    @Prop({ required: true })
    roles: string[];

    @Prop({ required: true, default: false })
    verifyAccount: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
AccountSchema.index({ email: 'text', userName: 'text' });