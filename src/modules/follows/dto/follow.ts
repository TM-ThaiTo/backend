import { IsNotEmpty, IsString } from "class-validator";

export class FollowDto {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    idFollow: string;
}