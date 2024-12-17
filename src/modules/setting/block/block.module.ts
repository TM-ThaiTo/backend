import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '@/user/user.module';
import { BlockService } from './service/block.service';
import { BlockController } from './controller/block.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from './schemas/block.schema';
import { HandleBlockDB } from './handle/handle.block.db';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }]),
    forwardRef(() => UserModule),
  ],
  controllers: [BlockController],
  providers: [BlockService, HandleBlockDB],
  exports: [BlockService, HandleBlockDB],
})
export class BlockModule { }
