import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DuplicatKakaoId } from 'src/customValidators/kakaoIdValidate';
import {
  DuplicatNickname,
  InvalidNickname,
} from 'src/customValidators/nicknameValidate';
import Users from 'src/entities/User.entity';
import { OauthModule } from 'src/oauth/oauth.module';
import UsersController from './users.controller';
import UserFacade from './users.facade';
import UsersService from './users.service';

@Module({
  imports: [OauthModule, TypeOrmModule.forFeature([Users])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserFacade,
    InvalidNickname,
    DuplicatNickname,
    DuplicatKakaoId,
  ],
  exports: [UsersService],
})
export default class UsersModule {}
