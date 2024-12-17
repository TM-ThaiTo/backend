import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateContentReportDto {
    @IsNotEmpty()
    @IsNumber()
    type: number;

    @IsNotEmpty()
    @IsString()
    titleVN: string;

    @IsNotEmpty()
    @IsString()
    titleEN: string;

    @IsNotEmpty()
    @IsString()
    contentVN: string;

    @IsNotEmpty()
    @IsString()
    contentEN: string;

    @IsNotEmpty()
    @IsBoolean()
    open: boolean;
}