import { IsNotEmpty, IsString } from "class-validator";

export class UpdateCommentDto {

    @IsNotEmpty()
    @IsString()
    idComment: string;

    @IsNotEmpty()
    @IsString()
    content: string;
}