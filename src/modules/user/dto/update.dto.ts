import { IsDate, IsDateString, IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto {
    @IsNotEmpty()
    @IsString()
    fullName?: string;

    @IsString()
    bio?: string;

    gender: number;
    publicProfile?: number;
}