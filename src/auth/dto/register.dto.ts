import { IsNotEmpty, IsEmail } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsNotEmpty({ message: 'Password cannot be empty' })
    password: string;

    @IsNotEmpty()
    userName: string;

    @IsNotEmpty()
    fullName: string;

    @IsNotEmpty()
    phone: string;

    @IsNotEmpty()
    address: string;
}