import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission {
    @Prop({ required: true })
    permissionName: string;

    @Prop({ required: true })
    method: string;

    @Prop({ required: true })
    module: string;

    @Prop({ required: true })
    endpoint: string;

    @Prop({ required: true })
    description: string;

    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

PermissionSchema.index({ permissionName: 'text', description: 'text' });
