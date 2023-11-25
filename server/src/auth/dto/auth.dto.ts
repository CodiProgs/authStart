import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, Length } from "class-validator";

@InputType()
export class RegisterDto {
    @Field()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email is invalid' })
    email: string;

    @Field()
    @IsNotEmpty({ message: 'Password is required' })
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    password: string;

    @Field()
    @IsNotEmpty({ message: 'Fullname is required' })
    @Length(6, 20, { message: 'Fullname must be between 6 and 20 characters' })
    fullname: string;
}

@InputType()
export class LoginDto {
    @Field()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email is invalid' })
    email: string;

    @Field()
    @IsNotEmpty({ message: 'Password is required' })
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    password: string;
}