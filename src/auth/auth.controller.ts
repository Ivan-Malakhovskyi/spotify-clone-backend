import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';

import { CreateUserDTO } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/user.entity';
import { UserService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-guard';
import { Enable2FAAuth } from './types';
import { RequestUser } from 'src/users/types';
import { ValidateTokenDTO } from './dto/validate-token.dto';
import { GoogleOAuthGuard } from './guards/google-o-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}
  @Post('signup')
  signup(@Body() userDTO: CreateUserDTO): Promise<Omit<User, 'password'>> {
    return this.userService.createUser(userDTO);
  }

  @Post('signin')
  @HttpCode(200)
  signin(
    @Body() loginDTO: LoginUserDTO,
  ): Promise<
    { accessToken: string } | { validate2FA: string; message: string }
  > {
    return this.authService.login(loginDTO);
  }

  // @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @HttpCode(200)
  async googleAuthCallback(@Req() req: any, @Res() res) {
    console.log('req.USER', req);
    const resp = await this.authService.login(req.user);
    console.log(resp);
    return res.redirect(`http:localhost:3001${resp.user.accessToken}`);
  }

  @Get('enable-2fa')
  @UseGuards(JwtAuthGuard)
  enable2fa(@Request() req: { user: RequestUser }): Promise<Enable2FAAuth> {
    return this.authService.enableTwoFAAuth(req.user.userId);
  }

  @Post('validate-2fa')
  @UseGuards(JwtAuthGuard)
  validate2FAToken(
    @Request() req: { user: RequestUser },
    @Body() validateTokenDto: ValidateTokenDTO,
  ): Promise<{ verified: boolean }> {
    return this.authService.validate2FAToken(
      req.user.userId,
      validateTokenDto.token,
    );
  }

  @Get('disable-2fa')
  @UseGuards(JwtAuthGuard)
  disableTwoFAAuth(
    @Request() req: { user: RequestUser },
  ): Promise<UpdateResult> {
    return this.authService.disableTwoFAAuth(req.user.userId);
  }

  @Get('profile')
  @UseGuards(AuthGuard('bearer'))
  getProfile(@Request() req: { user: User }) {
    const { password, ...rest } = req.user;

    return {
      msg: 'Auth wit API KEY',
      user: rest,
    };
  }

  @Get('env')
  getEnv() {
    return this.authService.getEnv();
  }
}
