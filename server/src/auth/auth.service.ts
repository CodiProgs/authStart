import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/user/user.model';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { compare, hash } from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) {}

    async createTokens(user: User, res: Response) {
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

    async validateUser(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email }
        })

        if(user && (await compare(loginDto.password, user.password))) {
            return user
        }
        return null
    }

    async register(registerDto: RegisterDto, response: Response) {

        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email }
        })
        if(existingUser) throw new BadRequestException({email: 'Email already exists'})

        const hashedPassword = await hash(registerDto.password, 10)
        const user = await this.prisma.user.create({
            data: {
                fullname: registerDto.fullname,
                password: hashedPassword,
                email: registerDto.email,
            }
        })
        
        return this.createTokens(user, response)
    }

    async login(loginDto: LoginDto, response: Response) {
        const user = await this.validateUser(loginDto)
        if(!user) throw new BadRequestException({invalidCredentials: 'Invalid credentials'})

        return this.createTokens(user, response)
    } 

    async logout(response: Response) {
        response.clearCookie('accessToken')
        response.clearCookie('refreshToken')
        return 'Success logged out'
    }

    async refreshToken(req: Request, res: Response): Promise<string> {
        const refreshToken = req.cookies['refreshToken'];
        if(!refreshToken) throw new UnauthorizedException('Refresh token not found');

        let payload
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
            })
        }catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const userExists = await this.prisma.user.findUnique({
            where: { id: payload.sub }
        })
        if(!userExists) throw new BadRequestException('User not longer exists');

        const expiresIn = 15000
        const expiration = Math.floor(Date.now() / 1000) + expiresIn
        const accessToken = this.jwtService.sign(
            {...payload, exp: expiration},
            {
                secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
            }
        )
        res.cookie('accessToken', accessToken, { httpOnly: true })
        return accessToken
    }
}
