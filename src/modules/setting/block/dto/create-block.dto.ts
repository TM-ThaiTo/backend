import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateBlockDto {
    @IsString()
    @IsNotEmpty()
    @Length(24, 24, { message: 'idUserBlock must be exactly 24 characters long' })
    idUserBlock: string;
}
