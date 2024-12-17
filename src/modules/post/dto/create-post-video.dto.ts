import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePostVideoDto {
    @IsNotEmpty()
    @IsString()
    idUser: string;

    @IsNotEmpty()
    status: number; // 1: public, 2: private, 3: share

    @IsNotEmpty()
    type: number; // 1: image, 2: video

    @IsNotEmpty()
    title: string;

    @IsOptional()
    content: string;

    @IsNotEmpty()
    url: {
        thumbnail: string,
        file: {
            timeStart: number,
            timeEnd: number,
            width: number,
            height: number,
            soundOn: boolean,
        }
        accessibility: string,
    };

    @IsOptional()
    tag: string[];

    @IsOptional()
    collab: string[];

    @IsOptional()
    location: string[];

    @IsNotEmpty()
    hideLikes: boolean;

    @IsNotEmpty()
    openComment: boolean;
}