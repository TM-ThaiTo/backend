import { IsNotEmpty, IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    roleName: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsBoolean()
    @IsNotEmpty()
    active: boolean;

    @IsOptional()
    permission: string[];

    @IsOptional()
    dashboard: string[];
}
