import { IsString, IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
    @IsString()
    @IsNotEmpty()
    module: string;

    @IsString()
    @IsNotEmpty()
    permissionName: string;

    @IsString()
    @IsNotEmpty()
    method: string;

    @IsString()
    @IsNotEmpty()
    endpoint: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
