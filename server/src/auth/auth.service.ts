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
    ){}

    async login(loginDto: LoginDto, res: Response, req: Request){
        const user = await this.validateUser(loginDto.email, loginDto.password)
        if(!user) throw new BadRequestException({invalidCredentials: 'Invalid credentials'})
        return await this.createTokens(user, res, req)
    }

    async register(registerDto: RegisterDto, res: Response, req: Request){
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: registerDto.email
            }
        })
        if(existingUser) throw new BadRequestException({email: 'Email already taken'})

        const hashedPassword = await bcrypt.hash(registerDto.password, 10)
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                fullname: registerDto.fullname
            }
        })

        return await this.createTokens(user, res, req)
    }

    async logout(res: Response){
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        return 'Success logged out'
    }

    private async validateUser(email: string, password: string){
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        })
        if(user && await bcrypt.compare(password, user.password)){
            return user
        }
        return null
    }

    private async createTokens(user: User, res: Response, req: Request){
        const payload = { sub: user.id, username: user.fullname };
        const accessToken = this.jwtService.sign(
            {...payload},
            {
                secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
                expiresIn: '60sec' //15000
            }
        )
        const refreshToken = this.jwtService.sign(
            payload, {
                secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
                expiresIn: '7d'
            }
        )

        const oldRefreshToken = await this.prisma.session.findUnique({
            where: {
                userId: user.id,
                userAgent: req.headers['user-agent']
            }
        })
        if(oldRefreshToken){
            await this.prisma.session.delete({
                where: {
                    id: oldRefreshToken.id
                }
            })
        }

        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                token: refreshToken,
                userAgent: req.headers['user-agent'],
            }
        })

        res.cookie('sessionUuid', session.id, { httpOnly: true })
        res.cookie('accessToken', accessToken, { httpOnly: true })
        return user
    }

    async refreshTokens(req: Request, res: Response){
        
        if(!req.cookies['sessionUuid']) throw new BadRequestException({invalidSession: 'Invalid session'})
        const session = await this.prisma.session.findUnique({
            where: {
                id: req.cookies['sessionUuid']
            }
        })
        
        if(!session) throw new BadRequestException({invalidSession: 'Invalid session'})

        const refreshToken = this.jwtService.verify(session.token, {
            secret: this.config.get<string>('REFRESH_TOKEN_SECRET')
        })
        if(!refreshToken) throw new BadRequestException({invalidSession: 'Invalid session'})
        const user = await this.prisma.user.findUnique({
            where: {
                id: refreshToken.sub
            }
        })
        if(session.userId !== user.id || session.userAgent !== req.headers['user-agent']) throw new BadRequestException({invalidSession: 'Invalid session'})
        
        const accessExpiresIn = 60
        const accessExpiration = Math.floor(Date.now() / 1000) + accessExpiresIn
        const accessToken = this.jwtService.sign(
            {sub: user.id, username: user.fullname, exp: accessExpiration},
            {
                secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
            }
        )
        const refreshTokenExpiration = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
        const newRefreshToken = this.jwtService.sign(
            {sub: user.id, username: user.fullname, exp: refreshTokenExpiration},
            {
                secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
            }
        )
        await this.prisma.session.update({
            where: {
                id: session.id
            },
            data: {
                token: newRefreshToken
            }
        })
        res.cookie('sessionUuid', session.id, { httpOnly: true })
        res.cookie('accessToken', accessToken, { httpOnly: true })

        return accessToken
    }

    async showSession(userId: string, req: Request, res: Response){
        if(req.cookies['sessionUuid']) {
            const session = await this.prisma.session.findUnique({
                where: {
                    id: req.cookies['sessionUuid']
                }
            })
            if(session.userAgent === req.headers['user-agent'] && session.userId === userId) {
                return 'Success'
            }else{
                await this.prisma.session.delete({
                    where: {
                        id: req.cookies['sessionUuid']
                    }
                })
                res.clearCookie('sessionUuid')
                res.clearCookie('accessToken')
                throw new BadRequestException({invalidSession: 'Invalid session'})
            }
        }else{
            const sessions = await this.prisma.session.findMany({
                where: {
                    userId
                }
            })
            const session = sessions.find(session => session.userAgent === req.headers['user-agent'])
            if(!session) return
            res.cookie('sessionUuid', session.id, { httpOnly: true })
            res.cookie('accessToken', session.token, { httpOnly: true })
            return 'Success'
        }


    }
    

}
