import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateMessageGroupDto {
    @IsNotEmpty()
    idConversation: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsArray()
    @IsUrl()
    image?: string;

    @IsOptional()
    @IsUrl()
    file?: string;
}
