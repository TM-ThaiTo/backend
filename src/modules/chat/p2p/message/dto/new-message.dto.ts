import { IsNotEmpty, IsString, IsArray, IsOptional, IsUrl, Length } from 'class-validator';

export class NewMessageDto {
    @IsNotEmpty()
    @IsString()
    @Length(24, 24, { message: 'id must be exactly 24 characters long' })
    idConversation: string;

    @IsNotEmpty()
    @IsString()
    @Length(24, 24, { message: 'id must be exactly 24 characters long' })
    receiver: string;

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