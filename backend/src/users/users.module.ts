import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthenticationService } from 'src/authentication/authentication.service';

import {
  DuplicatNickname,
  InvalidNickname,
} from 'src/customValidators/nicknameValidate';
import User from 'src/entities/User.entity';

import { OauthModule } from 'src/oauth/oauth.module';
import UsersController from './users.controller';
import UserFacade from './users.facade';
import UsersService from './users.service';

@Module({
  imports: [OauthModule, TypeOrmModule.forFeature([User])],
  controllers: [UsersController],

  providers: [
    UsersService,
    UserFacade,
    AuthenticationService,
    JwtService,
    InvalidNickname,
    DuplicatNickname,
  ],
  exports: [UsersService],
})
export default class UsersModule {}
