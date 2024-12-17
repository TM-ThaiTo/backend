import { Global, Module } from '@nestjs/common';
import { RoleService } from '@/access_control/role/role.service';
import { RoleController } from '@/access_control/role/role.controller';
import { Role, RoleSchema } from '@/access_control/role/schema/role.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleServiceDB } from './handle/role.db';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [RoleController],
  providers: [RoleService, RoleServiceDB],
  exports: [RoleService],
})
export class RoleModule { }
