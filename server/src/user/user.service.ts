import { BadRequestException, Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { extname } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService
    ){}

    async getUsers() {
        return await this.prisma.user.findMany();
    }

    async saveImage(image: {
        createReadStream: () => any;
        filename: string;
        mimetype: string;
    }): Promise<string> {
        if(!image || !['image/jpeg'].includes(image.mimetype)) {
            throw new BadRequestException('Invalid format for image' );
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

    async updateImage(id: number, imagePath: string){
        return await this.prisma.user.update({
            where: { id },
            data: {
                image: imagePath
            }
        })
    }
}
