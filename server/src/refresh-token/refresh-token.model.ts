import { Field, ObjectType } from "@nestjs/graphql";
@ObjectType()
export class RefreshToken {
  @Field()
  id: number;

  @Field()
  ip: string;

  @Field()
  device: string;

  @Field()
  createdAt: Date;
}