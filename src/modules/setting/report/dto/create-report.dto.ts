import { IsNotEmpty, IsNumber, IsInt, IsOptional, IsString, Length, IsIn } from "class-validator";

export class CreateReportDto {

    @IsNotEmpty()
    @IsString()
    @Length(24, 24, { message: 'id must be exactly 24 characters long' })
    idReporter: string;

    @IsNotEmpty()
    @IsNumber({ allowNaN: false, allowInfinity: false })
    type: number;

    @IsNotEmpty()
    @IsString()
    @Length(24, 24, { message: 'id must be exactly 24 characters long' })
    idReport: string;

    @IsString()
    @IsOptional()
    @Length(24, 24, { message: 'id must be exactly 24 characters long' })
    idContent?: string;

    @IsString()
    @IsOptional()
    other: string;
}
