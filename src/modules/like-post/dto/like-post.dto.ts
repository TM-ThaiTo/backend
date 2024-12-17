import { IsNotEmpty, IsString } from "class-validator";

export class LikePostDto {
    @IsNotEmpty()
    @IsString()
    idUser: string;

    @IsNotEmpty()
    @IsString()
    idPost: string;
}