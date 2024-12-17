import { Module, forwardRef } from '@nestjs/common';
import { MessageGroupService } from './message-group.service';
import { MessageGroupController } from './message-group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageGroup, MessageGroupSchema } from './schemas/message-group.schema';
import { ConversationGroupModule } from '../conversation-group/conversation-group.module';
import { CloudinaryModule } from '@cloudinary/cloudinary.module';
import { UserModule } from '@/user/user.module';
import { UserConversationModule } from '@/chat/user-conversation/user-conversation.module';
import { HandleMessageGroupDB } from './handle/message-group.db';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MessageGroup.name, schema: MessageGroupSchema },
    ]),
    forwardRef(() => ConversationGroupModule),
    forwardRef(() => UserModule),
    forwardRef(() => UserConversationModule),
    CloudinaryModule
  ],
  controllers: [MessageGroupController],
  providers: [MessageGroupService, HandleMessageGroupDB],
})
export class MessageGroupModule { }
