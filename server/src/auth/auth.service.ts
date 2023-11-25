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
        return await this.createTokens(user, res)
    }

    async register(registerDto: RegisterDto, res: Response){
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

        return await this.createTokens(user, res)
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

    private async createTokens(user: User, res: Response){
        const payload = { sub: user.id, username: user.fullname };
        const accessToken = this.jwtService.sign(
            {...payload},
            {
                secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
                expiresIn: '15000sec'
            }
        )
        const refreshToken = this.jwtService.sign(
            payload, {
                secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
                expiresIn: '7d'
            }
        )

        res.cookie('accessToken', accessToken, { httpOnly: true })
        res.cookie('refreshToken', refreshToken, { httpOnly: true })
        
        return user 
    }

    async refreshTokens(req: Request, res: Response){
        const refreshToken = req.cookies['refreshToken']
        if(!refreshToken) throw new BadRequestException({refresh: 'Refresh token not found'})

        let payload: {
            sub: number
            username: string
        }

        try{
            payload = await this.jwtService.verify(refreshToken, {
                secret: this.config.get<string>('REFRESH_TOKEN_SECRET')
            })
        }catch(error){
            throw new BadRequestException({refresh: 'Invalid refresh token'})
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub
            }
        })
        if(!user) throw new BadRequestException('User not found')

        const accessExpiresIn = 15000 
        const accessExpiration = Math.floor(Date.now() / 1000) + accessExpiresIn
        const accessToken = this.jwtService.sign(
            {...payload, exp: accessExpiration},
            {
                secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
            }
        )
        const refreshExpiresIn = 7 * 24 * 60 * 60 
        const refreshExpiration = Math.floor(Date.now() / 1000) + refreshExpiresIn

        const newRefreshToken = this.jwtService.sign(
            {...payload, exp: refreshExpiration},
            {
                secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
            }
        )

        res.cookie('accessToken', accessToken, {httpOnly: true})
        res.cookie('refreshToken', newRefreshToken, {httpOnly: true})

        return accessToken
    }

}
