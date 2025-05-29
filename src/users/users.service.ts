import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { User } from './user.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginUserDTO } from 'src/auth/dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(userDTO: CreateUserDTO): Promise<Omit<User, 'password'>> {
    console.log('userDTO', userDTO);
    const user = new User();
    user.firstName = userDTO.firstName;
    user.lastName = userDTO.lastName;
    user.email = userDTO.email;
    user.apiKey = uuidv4();

    const salt = await bcryptjs.genSalt();
    user.password = await bcryptjs.hash(userDTO.password, salt);

    const savedUserInDB = await this.userRepository.save(user);

    const { password, ...rest } = savedUserInDB;

    console.log(savedUserInDB);

    return rest;
  }

  async findOne(data: LoginUserDTO): Promise<User> {
    const user = await this.userRepository.findOneBy({ email: data.email });
    if (!user) {
      throw new UnauthorizedException('User was not found 🥲');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    console.log('USER', user);
    if (!user) {
      throw new UnauthorizedException('User was not found 🥲');
    }

    return user;
  }

  async findById(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User was not found 🥲');
    }
    return user;
  }

  async updateSecret(userId: number, secret: string): Promise<UpdateResult> {
    return this.userRepository.update(
      { id: userId },
      {
        twoFASecret: secret,
        enableTwoFA: true,
      },
    );
  }

  async disableTwoFAAuth(userId: number): Promise<UpdateResult> {
    return this.userRepository.update(
      { id: userId },
      {
        enableTwoFA: false,
        twoFASecret: null,
      },
    );
  }

  async findByApiKey(apiKey: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ apiKey });

    if (!user) {
      throw new UnauthorizedException('User was not found 🥲');
    }

    return user;
  }
}
