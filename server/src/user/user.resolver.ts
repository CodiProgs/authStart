import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import { BadRequestException, UseFilters, UseGuards } from '@nestjs/common';
import { GraphQLErrorFilter } from 'src/filter/exception.filter';
import { User } from './user.model';
import { Request, Response } from 'express';
import { LoginDto, RegisterDto } from 'src/auth/dto/auth.dto';
import { GraphqlAuthGuard } from 'src/auth/guards/auth.guard';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@Resolver()
export class UserResolver {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ){}

    @UseFilters(GraphQLErrorFilter)
    @Mutation(() => User)
    async register(
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: {res: Response}
    ) {
        return await this.authService.register(registerDto,context.res)
    }

    @UseFilters(GraphQLErrorFilter)
    @Mutation(() => User)
    async login(
        @Args('loginInput') loginDto: LoginDto,
        @Context() context: {res: Response}
    ){
        return await this.authService.login(loginDto, context.res)
    }

    @Mutation(() => String)
    async logout(
        @Context() context: {res: Response}
    ){
        return this.authService.logout(context.res)
    }

    @Query(() => [User])
    async getUsers(){
        return this.userService.getUsers()
    }

    @Mutation(() => String)
    async refreshToken(
        @Context() context: {req: Request, res: Response}
    ){
        try {
            return this.authService.refreshToken(context.req, context.res)
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }

    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => String)
    async updateImage(
        @Args({ name: 'image', type: () => GraphQLUpload }) image: any,
        @Args('id') id: number
    ){
        const imagePath = await this.userService.saveImage(image)

        await this.userService.updateImage(id, imagePath)
        return imagePath
    }
}
