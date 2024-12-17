import { IsNotEmpty, IsString } from "class-validator";

export class UploadImageDto {

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    urlBase64: string[];
}