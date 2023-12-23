import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class GraphqlRefreshGuard implements CanActivate {
  constructor(
    private authService: AuthService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlCtx = context.getArgByIndex(2)
    const request: Request = gqlCtx.req
    const token = this.extractTokenFromCookies(request)

    if (!token) {
      throw new UnauthorizedException()
    }
    const refreshToken = await this.authService.validateRefreshToken(token, gqlCtx.req)
    if (refreshToken.userId !== request.user.sub) {
      throw new UnauthorizedException()
    }

    return true
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    return request.cookies.refreshToken
  }
}