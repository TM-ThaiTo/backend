import { IsNotEmpty } from "class-validator";

export class DeleteUrlDto {
    @IsNotEmpty()
    data: string[]
}