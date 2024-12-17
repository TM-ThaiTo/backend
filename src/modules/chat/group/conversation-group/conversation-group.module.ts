import { Module, forwardRef } from '@nestjs/common';
import { ConversationGroupService } from './service/conversation-group.service';
import { ConversationGroupController } from './controller/conversation-group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationGroup, ConversationGroupSchema } from './schemas/conversation-group.schema';
import { UserModule } from '@/user/user.module';
import { HandleConversationGroupDB } from './handle/conversation-group.db';
import { BlockModule } from '@/setting/block/block.module';
import { UserConversationModule } from '@/chat/user-conversation/user-conversation.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConversationGroup.name, schema: ConversationGroupSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => BlockModule),
    forwardRef(() => UserConversationModule),
  ],
  providers: [ConversationGroupService, HandleConversationGroupDB],
  controllers: [ConversationGroupController],
  exports: [ConversationGroupService, HandleConversationGroupDB],
})
export class ConversationGroupModule { }
