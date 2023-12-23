import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService
  ) { }

  async getAll(userId: number) {
    return await this.prisma.refreshToken.findMany({
      where: {
        userId
      }
    })
  }

  async delete(id: number, req: Request, res: Response) {
    const refreshToken = await this.prisma.refreshToken.delete({
      where: {
        id
      }
    })
    if (refreshToken.userAgent === req.headers['user-agent'] && refreshToken.ip === req.ip) {
      this.authService.logout(res)
      return true
    } else {
      return false
    }

  }
}
