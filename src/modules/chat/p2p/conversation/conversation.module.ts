import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationService } from './services/conversation.service';
import { ConversationController } from './controller/conversation.controller';
import { Conversation, ConversationSchema } from '@/chat/p2p/conversation/schemas';
import { HandleConversationDB } from '@/chat/p2p/conversation/handle'
import { MessageModule } from '@/chat/p2p/message/message.module';
import { UserModule } from '@/user/user.module';
import { ConversationAdminController } from './controller/conversation.admin.controller';
import { ConversationAdminService } from './services/conversation.admin.service';
import { UserConversationModule } from '@/chat/user-conversation/user-conversation.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    forwardRef(() => MessageModule),
    forwardRef(() => UserModule),
    forwardRef(() => UserConversationModule)
  ],
  controllers: [ConversationController, ConversationAdminController],
  providers: [ConversationService, HandleConversationDB, ConversationAdminService],
  exports: [HandleConversationDB],
})
export class ConversationModule { }
