import { IsNotEmpty } from "class-validator";
import { NewMessageDto } from '@/chat/p2p/message/dto'

export class CreateConversationDto {
    @IsNotEmpty({ message: 'Recipient ID is required' })
    idUser: string;

    data?: NewMessageDto;
}
