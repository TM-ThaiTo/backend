import { IsNotEmpty, IsString } from "class-validator";

export class AddMember {

    @IsString()
    @IsNotEmpty()
    slug: string;
    members: string[];
}