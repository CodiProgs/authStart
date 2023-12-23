import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Role } from "@prisma/client";

@ObjectType()
export class User {
    @Field()
    id: number;

    @Field()
    name: string;

    @Field()
    surname: string;

    @Field(() => [Role])
    role: Role[];

    @Field({ nullable: true })
    username?: string;

    @Field()
    email: string;

    @Field()
    avatar: string;
}

registerEnumType(Role, {
    name: 'UserRole',
});