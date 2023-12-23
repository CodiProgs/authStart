import { BadRequestException, Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { extname } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs'
import { AuthService } from 'src/auth/auth.service';
import { Response } from 'express';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private authService: AuthService
    ) { }

    async getUsers() {
        return await this.prisma.user.findMany();
    }

    async saveImage(image: {
        createReadStream: () => any;
        filename: string;
        mimetype: string;
    }): Promise<string> {
        if (!image || !['image/jpeg'].includes(image.mimetype)) {
            throw new BadRequestException('Invalid format for image');
        }
        const imageName = `${Date.now()}${extname(image.filename)}`;
        const imagePath = `/avatars/${imageName}`
        const stream = image.createReadStream()
        const outputPath = `public${imagePath}`
        const writeStream = createWriteStream(outputPath)
        stream.pipe(writeStream);

        await new Promise((resolve, reject) => {
            stream.on('end', resolve)
            stream.on('error', reject)
        })

        return imagePath
    }

    async updateImage(id: number, image: any) {
        const imagePath = await this.saveImage(image)
        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        })
        if (user.avatar !== '/avatars/default.jpg') {
            fs.unlinkSync(`public${user.avatar}`)
        }
        return await this.prisma.user.update({
            where: { id },
            data: {
                avatar: imagePath
            }
        })
    }

    async getUserProfile(username: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                username
            }
        })
        if (!user) throw new BadRequestException({ message: 'User not found' })
        return user
    }

    async setUsername(id: number, username: string) {
        return await this.prisma.user.update({
            where: {
                id
            },
            data: {
                username
            }
        })
    }

    async validateUsername(username: string) {
        const regex = /[^a-zA-Z1-9_-]/g;
        if (regex.test(username)) throw new BadRequestException({ message: 'Use numbers, letters, dashes, underscores' })
        const user = await this.prisma.user.findUnique({
            where: {
                username
            }
        })
        if (Number(username)) throw new BadRequestException({ message: 'The address cannot be equal to a number' })
        if (username === '' || username === 'admin' || username === '_' || username === '-') throw new BadRequestException({ message: 'Invalid username' })
        if (user) return false
        return true
    }

    async deleteUser(id: number, res: Response) {
        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        })
        if (user.avatar !== '/avatars/default.jpg') {
            fs.unlinkSync(`public${user.avatar}`)
        }
        await this.authService.logout(res)
        await this.prisma.user.delete({
            where: {
                id
            }
        })
        return true
    }
}
