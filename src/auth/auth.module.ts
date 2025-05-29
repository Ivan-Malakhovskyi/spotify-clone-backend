import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './strategies/jwt-strategy';
import { ArtistsModule } from 'src/artists/artists.module';
import { ApiKeyStrategy } from './strategies/api-key-strategy';
// import { GoogleStrategy } from './strategies/google.strategy';

import googleOAuthConfig from 'src/config/google-o-auth.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';

@Module({
  imports: [
    ConfigModule.forFeature(googleOAuthConfig),
    UsersModule,
    ArtistsModule,
    TypeOrmModule.forFeature([User]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('secret'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],

  providers: [AuthService, JwtStrategy, ApiKeyStrategy, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService], //! provide opportunity import that module in any other module
})
export class AuthModule {}
