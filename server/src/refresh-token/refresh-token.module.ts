import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenResolver } from './refresh-token.resolver';
import { AuthService } from 'src/auth/auth.service';

@Module({
  providers: [RefreshTokenService, RefreshTokenResolver, AuthService]
})
export class RefreshTokenModule { }
