import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {

    @Prop({ type: String, required: true }) slug: string;
    @Prop({ type: String, unique: true, required: true }) idAccount: string;
    @Prop({ type: String, default: null }) fullName?: string;
    @Prop({ type: String, default: null }) phone?: string;
    @Prop({ type: Date, default: new Date('1900-01-01') }) birthDay?: Date;
    @Prop({ type: String, default: null }) address?: string;
    @Prop({ type: String, default: null }) bio?: string;
    @Prop({ type: Number, default: 0 }) follower?: number;
    @Prop({ type: Number, default: 0 }) following?: number;
    @Prop({ type: Number, default: 0 }) posts?: number;
    @Prop({ type: String, default: null }) status?: string;
    @Prop({ type: String, default: null }) avatar?: string;
    @Prop({ type: String, default: null }) background?: string;
    @Prop({ type: Number, default: 0 }) theme?: number; // 0: light, 1: dark
    @Prop({ type: String, default: 'en' }) lang?: string; // en, vi
    @Prop({ type: Number, default: 0 }) publicProfile?: number; // 0: public, 1: private
    @Prop({ type: Number, default: 0 }) gender?: number; // 0: male, 1: female, 2: other
    @Prop({ type: Number, default: 0 }) reports?: number;
    @Prop({ type: Number, required: true, default: 0 }) privateAccount: number; // 0: public, 1: private

    _id?: string; createdAt?: Date; updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({
    _id: 'text',
    slug: 'text',
    idAccount: 'text',
    phone: 'text',
    address: 'text',
    fullName: 'text',
});