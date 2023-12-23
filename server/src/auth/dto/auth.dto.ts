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
    @IsNotEmpty({ message: 'Name is required' })
    @Length(3, 20, { message: 'Name must be between 3 and 20 characters' })
    name: string;

    @Field()
    @IsNotEmpty({ message: 'Surname is required' })
    @Length(3, 20, { message: 'Surname must be between 3 and 20 characters' })
    surname: string;
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