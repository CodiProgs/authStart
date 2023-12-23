import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshToken } from './refresh-token.model';
import { Request, Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(GraphqlAuthGuard)
@Resolver()
export class RefreshTokenResolver {
  constructor(
    private refreshTokenService: RefreshTokenService
  ) { }

  @Query(() => [RefreshToken])
  async getRefreshTokens(
    @Context() context: { req: Request }
  ) {
    return await this.refreshTokenService.getAll(context.req.user.sub)
  }


  @Mutation(() => Boolean)
  async deleteRefreshToken(
    @Args('id') id: number,
    @Context() context: { req: Request, res: Response }
  ) {
    return await this.refreshTokenService.delete(id, context.req, context.res)
  }

}
