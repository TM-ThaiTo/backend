import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserConversation, UserConversationSchema } from './user-conversation.schema';
import { HandleUserConversationDB } from './user-conversation.handle';
import { UserConversationService } from './user-conversation.service';
import { UserConversationController } from './user-conversation.controler';
import { ConversationGroupModule } from '../group/conversation-group/conversation-group.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserConversation.name, schema: UserConversationSchema },
        ]),
        forwardRef(() => ConversationGroupModule),
    ],
    controllers: [UserConversationController],
    providers: [HandleUserConversationDB, UserConversationService],
    exports: [HandleUserConversationDB, UserConversationService],
})
export class UserConversationModule { }
