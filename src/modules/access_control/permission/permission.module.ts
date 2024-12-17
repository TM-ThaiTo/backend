import { Global, Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from '@/access_control/permission/schema/permission.schema';
import { PermissionServiceDB } from '@/access_control/permission/handle/permission.db';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionServiceDB],
  exports: [PermissionServiceDB],
})
export class PermissionModule { }
