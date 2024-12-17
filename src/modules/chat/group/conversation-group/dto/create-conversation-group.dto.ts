import { IsNotEmpty, IsString } from "class-validator";

export class CreateConversationGroupDto {
    @IsNotEmpty()
    member: string[];
}
