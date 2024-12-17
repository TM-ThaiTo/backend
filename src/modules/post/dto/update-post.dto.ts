import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdatePostDto {

    @IsNotEmpty()
    @IsString()
    idPost: string;

    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    status: number;

    @IsOptional()
    content: string;

    @IsNotEmpty()
    listUrl: string[];

    @IsOptional()
    tag: string[];

    @IsNotEmpty()
    hideLike: boolean;

    @IsNotEmpty()
    openComment: boolean;
}