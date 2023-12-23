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
import { GraphqlRefreshGuard } from 'src/auth/guards/refresh.guard';

@Resolver()
export class UserResolver {
    constructor(
        private userService: UserService,
        private authService: AuthService
    ) { }

    @UseFilters(GraphQLErrorFilter)
    @UseGuards(GraphqlAuthGuard)
    @Query(() => [User])
    async getUsers() {
        return await this.userService.getUsers();
    }

    @UseFilters(GraphQLErrorFilter)
    @Mutation(() => User)
    async login(
        @Args('loginInput') loginDto: LoginDto,
        @Context() context: { res: Response, req: Request }
    ) {
        return await this.authService.login(loginDto, context.res, context.req)
    }

    @UseFilters(GraphQLErrorFilter)
    @Mutation(() => User)
    async register(
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: { res: Response, req: Request },
    ) {
        return await this.authService.register(registerDto, context.res, context.req)
    }

    @Mutation(() => String)
    async logout(@Context() context: { res: Response }) {
        return await this.authService.logout(context.res)
    }

    @UseFilters(GraphQLErrorFilter)
    @Mutation(() => String)
    async refreshTokens(
        @Context() context: { req: Request, res: Response }
    ) {
        return this.authService.refreshTokens(context.req, context.res)
    }

    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    async updateImage(
        @Args({ name: 'image', type: () => GraphQLUpload }) image: any,
        @Context() context: { req: Request }
    ) {
        return await this.userService.updateImage(context.req.user.sub, image)
    }

    @Query(() => User)
    async getUserProfile(
        @Args({ name: 'username' }) username: string,
    ) {
        return await this.userService.getUserProfile(username)
    }

    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    async setUsername(
        @Context() context: { req: Request },
        @Args({ name: 'username' }) username: string
    ) {
        return await this.userService.setUsername(context.req.user.sub, username)
    }

    @Query(() => Boolean)
    async validateUsername(
        @Args({ name: 'username' }) username: string
    ) {
        return await this.userService.validateUsername(username)
    }

    @UseFilters(GraphQLErrorFilter)
    @UseGuards(GraphqlAuthGuard, GraphqlRefreshGuard)
    @Mutation(() => Boolean)
    async deleteUser(
        @Context() context: { req: Request, res: Response }
    ) {
        return await this.userService.deleteUser(context.req.user.sub, context.res)
    }
}
