import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt'
import { User } from 'src/user/user.model';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    async login(loginDto: LoginDto, res: Response, req: Request) {
        const user = await this.validateUser(loginDto.email, loginDto.password)
        if (!user) throw new BadRequestException({ invalidCredentials: 'Invalid credentials' })
        return await this.createTokens(user, res, req)
    }

    async register(registerDto: RegisterDto, res: Response, req: Request) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: registerDto.email
            }
        })
        if (existingUser) throw new BadRequestException({ email: 'Email already taken' })

        const hashedPassword = await bcrypt.hash(registerDto.password, 10)
        let user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name,
                surname: registerDto.surname,
                role: ['USER'],
            }
        })

        user = await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                username: user.id.toString()
            }
        })

        return await this.createTokens(user, res, req)
    }

    private async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        })
        if (user && await bcrypt.compare(password, user.password)) {
            return user
        }
        return null
    }

    async logout(res: Response) {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        return 'Success logged out'
    }

    private async createTokens(user: User, res: Response, req: Request) {
        const payload = { sub: user.id, username: user.name + ' ' + user.surname, role: user.role };

        const refreshTokenFromDb = await this.prisma.refreshToken.findFirst({
            where: {
                userAgent: req.headers['user-agent'],
                userId: user.id
            }
        })
        if (refreshTokenFromDb) {
            const accessToken = this.jwtService.sign(
                { ...payload },
                {
                    secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
                    expiresIn: '10m'
                }
            )
            const refreshToken = this.jwtService.sign(
                payload, {
                secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
                expiresIn: '7d'
            }
            )
            await this.prisma.refreshToken.update({
                where: {
                    id: refreshTokenFromDb.id
                },
                data: {
                    token: refreshToken
                }
            })
            res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: 'localhost', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 })
            res.cookie('accessToken', accessToken, { httpOnly: true, domain: 'localhost', path: '/', maxAge: 10 * 60 * 1000 })
            return user
        } else {
            const accessToken = this.jwtService.sign(
                { ...payload },
                {
                    secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
                    expiresIn: '10m'
                }
            )
            const refreshToken = this.jwtService.sign(
                payload, {
                secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
                expiresIn: '7d'
            }
            )
            await this.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    ip: req.ip,
                    device: req.headers['sec-ch-ua-platform'].toString(),
                    userId: user.id,
                    userAgent: req.headers['user-agent']
                }
            })
            res.cookie('refreshToken', refreshToken, { httpOnly: true, domain: 'localhost', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 })
            res.cookie('accessToken', accessToken, { httpOnly: true, domain: 'localhost', path: '/', maxAge: 10 * 60 * 1000 })
            return user
        }
    }

    async refreshTokens(req: Request, res: Response) {
        const refreshToken = req.cookies['refreshToken']
        if (!refreshToken) throw new BadRequestException({ invalidSession: 'Invalid session' })
        const refreshTokenFromDb = await this.validateRefreshToken(refreshToken, req)
        if (!refreshTokenFromDb) throw new BadRequestException({ invalidSession: 'Invalid session' })
        const user = await this.prisma.user.findUnique({
            where: {
                id: refreshTokenFromDb.userId
            }
        })

        const accessExpiration = Math.floor(Date.now() / 1000) + 10 * 60
        const accessToken = this.jwtService.sign(
            { sub: user.id, username: user.name + ' ' + user.surname, role: user.role, exp: accessExpiration },
            {
                secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
            }
        )

        const refreshTokenExpiration = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
        const newRefreshToken = this.jwtService.sign(
            { sub: user.id, username: user.name + ' ' + user.surname, role: user.role, exp: refreshTokenExpiration },
            {
                secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
            }
        )

        await this.prisma.refreshToken.update({
            where: {
                id: refreshTokenFromDb.id
            },
            data: {
                token: newRefreshToken
            }
        })

        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, domain: 'localhost', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 })
        res.cookie('accessToken', accessToken, { httpOnly: true, domain: 'localhost', path: '/', maxAge: 10 * 60 * 1000 })

        return accessToken
    }

    async validateRefreshToken(token: string, req: Request) {
        const refreshTokenFromDb = await this.prisma.refreshToken.findFirst({
            where: {
                token: token,
                userAgent: req.headers['user-agent'],
                ip: req.ip,
            }
        })
        if (!refreshTokenFromDb) throw new BadRequestException({ invalidSession: 'Invalid session' })
        const valid = this.jwtService.verify(token, {
            secret: this.config.get<string>('REFRESH_TOKEN_SECRET')
        })
        if (!valid) throw new BadRequestException({ invalidSession: 'Invalid session' })
        return refreshTokenFromDb
    }


}
