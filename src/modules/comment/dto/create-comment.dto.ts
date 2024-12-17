import { IsNotEmpty, IsString } from "class-validator";

export class CreateCommentDto {

    @IsNotEmpty()
    @IsString()
    idPost: string;

    @IsNotEmpty()
    @IsString()
    idUser: string;

    idParent: string;

    @IsNotEmpty()
    @IsString()
    content: string;
}