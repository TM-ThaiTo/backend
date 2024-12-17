import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
}

export class LoginWithGoogleDto {
    tokenId?: string;
    email: string;
    name: string;
    image: string;
    provider: string;
}