import { IsNotEmpty, IsString } from "class-validator";

export class CreateLikeCommentDto {
    @IsNotEmpty()
    @IsString()
    idUser: string;

    @IsNotEmpty()
    @IsString()
    idPost: string;

    @IsNotEmpty()
    @IsString()
    idComment: string;
}
