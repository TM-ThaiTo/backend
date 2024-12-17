import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from '@/chat/p2p/message/message.service';
import { MessageController } from '@/chat/p2p/message/message.controller';
import { Message, MessageSchema } from '@/chat/p2p/message/schemas'
import { HandleMessageDB } from '@/chat/p2p/message/handle'
import { ConversationModule } from '@/chat/p2p/conversation/conversation.module';
import { UserModule } from '@/user/user.module';
import { CloudinaryModule } from '@cloudinary/cloudinary.module';
import { UserConversationModule } from '@/chat/user-conversation/user-conversation.module';
import { BlockModule } from '@/setting/block/block.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
    ]),
    forwardRef(() => ConversationModule),
    forwardRef(() => UserModule),
    forwardRef(() => UserConversationModule),
    forwardRef(() => BlockModule),
    CloudinaryModule
  ],
  controllers: [MessageController],
  providers: [MessageService, HandleMessageDB],
  exports: [HandleMessageDB, MessageService]
})
export class MessageModule { }
