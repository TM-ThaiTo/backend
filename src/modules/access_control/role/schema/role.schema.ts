import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {

    @Prop({ required: true, unique: true })
    roleName: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    active: boolean;

    @Prop({ required: true, type: [String] })
    permission: string[];

    @Prop({ required: true })
    dashboard: string[];

    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ description: 'text' });