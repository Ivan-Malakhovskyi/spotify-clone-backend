import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { ArtistsService } from 'src/artists/artists.service';
import { LoginUserDTO } from 'src/auth/dto/login-user.dto';
import { UserService } from 'src/users/users.service';
import { Enable2FAAuth, PayloadType } from './types';
import { UpdateResult } from 'typeorm';
import { User } from 'src/users/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private artistsService: ArtistsService,
    private configService: ConfigService,
  ) {}
  async login(
    loginDTO: LoginUserDTO,
  ): Promise<
    { accessToken: string } | { validate2FA: string; message: string }
  > {
    console.log(loginDTO);
    const user = await this.userService.findOne(loginDTO);

    const isPasswordUserMatched = await bcryptjs.compare(
      loginDTO.password,
      user.password,
    );

    if (!isPasswordUserMatched) {
      throw new UnauthorizedException("Password doesn't match");
    } else {
      const { password, ...rest } = user;

      const payload: PayloadType = {
        email: rest.email,
        userId: rest.id,
        artistId: user.id,
      };

      const artist = await this.artistsService.findArtist(user.id);

      if (artist) {
        payload.artistId = artist.id;
      }
      console.log(rest);
      if (rest.enableTwoFA && rest.twoFASecret) {
        console.log('TRUE');
        return {
          validate2FA: 'http://localhost:3000/auth/validate-2fa',
          message: 'Send your one time password from Google Auth',
        };
      }

      return {
        accessToken: this.jwtService.sign(payload),
      };
    }
  }

  async enableTwoFAAuth(userId: number): Promise<Enable2FAAuth> {
    //! 1 Find user in DB
    const user = await this.userService.findById(userId);

    //! 2 if 2 Auth enabled return secret
    if (user.enableTwoFA) {
      return { secret: user.twoFASecret! };
    }

    //! 3 if not, create secret

    const secret = speakeasy.generateSecret();
    console.log(' AuthServiceenableTwoFAAuth', secret);

    user.twoFASecret = secret.base32; //! 4 save in base32 format

    await this.userService.updateSecret(user.id, user.twoFASecret); //! 5 find user and update fields

    return { secret: user.twoFASecret }; //! 6 return secret to user
  }

  async validate2FAToken(
    userId: number,
    token: string,
  ): Promise<{ verified: boolean }> {
    try {
      const user = await this.userService.findById(userId); //! Find User

      const isSecretVerified = speakeasy.totp.verify({
        secret: user.twoFASecret!,
        token: token,
        encoding: 'base32',
      }); //! Check if the secret verified with token the speakeasy verify method

      if (isSecretVerified) {
        return { verified: true };
      } else {
        return { verified: false };
      }
    } catch (error) {
      throw new UnauthorizedException('Error verifying token');
    }
  }

  async disableTwoFAAuth(userId: number): Promise<UpdateResult> {
    return this.userService.disableTwoFAAuth(userId);
  }

  async validateUserByApiKey(apiKey: string): Promise<User> {
    return this.userService.findByApiKey(apiKey);
  }

  getEnv() {
    const port = this.configService.get<number>('port');
    const secret = this.configService.get<string>('secret');
    const DB_NAME = this.configService.get<string>('dbName');
    const USER = this.configService.get<string>('USER');
    const DB_PORT = this.configService.get<number>('dbPort');
    const DB_HOST = this.configService.get<string>('host');

    return {
      port,
      secret,
      DB_HOST,
      DB_PORT,
      DB_NAME,
      USER,
    };
  }

  async validateGoogleUser(googleUserDto: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  }) {
    let user = await this.userService.findByEmail({
      email: googleUserDto.email,
    });

    if (!user) {
      user = this.userRepository.create({
        ...googleUserDto,
        provider: 'google',
      });

      await this.userRepository.save(user);
    }

    return user;
  }

  // async validateGoogleUser(googleUser: any) {
  //   console.log('googleUser', googleUser);
  //   const user = await this.userService.findByEmail(googleUser.email);

  //   if (user) return user;

  //   return await this.userService.createUser(googleUser);
  // }
}
