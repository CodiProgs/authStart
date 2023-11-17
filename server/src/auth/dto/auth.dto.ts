import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


@InputType()
export class RegisterDto {
    @Field()
    @IsNotEmpty({ message: 'Fullname is required' })
    @IsString({ message: 'Fullname must be a string' })
    fullname: string;

    @Field()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;

    @Field()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email is invalid' })
    email: string;
}

@InputType()
export class LoginDto {
    @Field()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid' })
    email: string;

    @Field()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}