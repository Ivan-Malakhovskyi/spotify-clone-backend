import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import config from '../../config/configuration';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject() private configService: ConfigType<typeof config>,

    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      clientID: configService.clientId!,
      clientSecret: configService.clientSecret!,
      callbackURL: configService.redirectUrl!,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log(profile);

    //   const user = {
    //       provider: 'google',
    //       providerId
    //   }
  }
}
