import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePostDto {
    @IsNotEmpty()
    content: string;
}