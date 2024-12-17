import { IsNotEmpty, IsString } from "class-validator";

export class VerifyAccountDto {
    @IsString()
    @IsNotEmpty()
    _id: string;

    @IsString()
    @IsNotEmpty()
    code: string;
}