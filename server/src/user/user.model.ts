import { Field, ObjectType } from "@nestjs/graphql";


@ObjectType()
export class User {
    @Field()
    id?: number;

    @Field()
    fullname: string;

    @Field()
    email: string;

    @Field()
    image: string;

}