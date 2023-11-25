import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.model';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto, RegisterDto } from 'src/auth/dto/auth.dto';
import { Request, Response } from 'express';
import { BadRequestException, UseFilters, UseGuards } from '@nestjs/common';
import { GraphQLErrorFilter } from 'src/filter/exception.filter';
import { GraphqlAuthGuard } from 'src/auth/guards/auth.guard';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@Resolver()
export class UserResolver {
    constructor(
        private userService: UserService,
        private authService: AuthService
    ) {}

    @UseGuards(GraphqlAuthGuard)
    @Query(() => [User])
    async getUsers() {
        return await this.userService.getUsers();
    }

    @UseFilters(GraphQLErrorFilter)
    @Mutation(() => User)
    async login(
        @Args('loginInput') loginDto: LoginDto,
        @Context() context: {res: Response, req: Request},
    ){
        return await this.authService.login(loginDto, context.res, context.req)
    }

    @UseFilters(GraphQLErrorFilter)
    @Mutation(() => User)
    async register(
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: {res: Response}
    ){
        return await this.authService.register(registerDto, context.res)
    }

    @Mutation(() => String)
    async logout(@Context() context: {res: Response}) {
        return await this.authService.logout(context.res)
    }

    @UseFilters(GraphQLErrorFilter)
    @Mutation(() => String)
    async refreshTokens(
        @Context() context: {req: Request, res: Response}
    ){
        return this.authService.refreshTokens(context.req, context.res)
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
