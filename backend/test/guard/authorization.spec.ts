import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ServerErrorHandlingFilter } from '@root/common/filters/ServerErrorHandlingFilter';
import { HttpExceptionFilter } from '@root/common/filters/http-exception.filter';
import { FeedService } from '@feed/feed.service';
import { ConfigModule } from '@nestjs/config';
import { encrypt } from '@feed/feed.utils';

import { AuthorizationGuard } from '@common/guard/authorization.guard';

import {
  NonExistFeedError,
  NonExistTokenError,
  UnauthorizedError,
} from '@root/custom/customError/serverError';
import configuration from '../../configuration';

describe('권한 부여 가드(AuthorizationGuard) 동작 unit test', () => {
  let app: INestApplication;
  let authorizationGuard: AuthorizationGuard;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `${process.cwd()}/config/.${process.env.NODE_ENV}.env`,
          load: [configuration],
        }),
      ],
      providers: [AuthorizationGuard],
    })
      .useMocker((token) => {
        if (token === FeedService)
          return {
            checkFeedOwner: (id, feedId) => {
              return { userId: 1 };
            },
          };
        return null;
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(
      new ServerErrorHandlingFilter(),
      new HttpExceptionFilter(),
    );
    authorizationGuard = moduleFixture.get(AuthorizationGuard);
    await app.init();
  });

  it('주인 접근 시 통과', async () => {
    const mockContext = createMock<ExecutionContext>();
    const req = mockContext.switchToHttp().getRequest();
    const mockUser = {
      id: 1,
      nickname: '윤정민이지',
      profile: 'http://naver.com',
      kakaoId: 1121243,
      deletedAt: null,
      currentRefreshToken: null,
    };

    const encryptedFeedId = encrypt('1');
    const mockParam = { feedId: encryptedFeedId };

    Object.assign(req, { user: mockUser });
    Object.assign(req, { params: mockParam });

    expect(authorizationGuard.canActivate(mockContext)).resolves.toBe(
      mockUser.id,
    );
  });

  it('주인이 아닐 시 UnauthorizedException 던짐', async () => {
    const mockContext = createMock<ExecutionContext>();
    const req = mockContext.switchToHttp().getRequest();
    const mockUser = {
      id: 2,
      nickname: '주인아니지롱',
      profile: 'http://naver.com',
      kakaoId: 1121243,
      deletedAt: null,
      currentRefreshToken: null,
    };

    const encryptedFeedId = encrypt('1');
    const mockParam = { feedId: encryptedFeedId };

    Object.assign(req, { user: mockUser });
    Object.assign(req, { params: mockParam });

    expect(authorizationGuard.canActivate(mockContext)).rejects.toThrowError(
      new UnauthorizedError(),
    );
  });

  it('로그인 상태 아닐 시(token x) NoExistTokenException 던짐', async () => {
    const mockContext = createMock<ExecutionContext>();
    const req = mockContext.switchToHttp().getRequest();

    const encryptedFeedId = encrypt('1');
    const mockParam = { feedId: encryptedFeedId };

    Object.assign(req, { params: mockParam });

    expect(authorizationGuard.canActivate(mockContext)).rejects.toThrowError(
      new NonExistTokenError(),
    );
  });

  it('feedId 파라미터 제공 x 시 NoFeedIdException 던짐', async () => {
    const mockContext = createMock<ExecutionContext>();
    const req = mockContext.switchToHttp().getRequest();

    const mockUser = {
      id: 1,
      nickname: '주인이지롱',
      profile: 'http://naver.com',
      kakaoId: 1121243,
      deletedAt: null,
      currentRefreshToken: null,
    };

    Object.assign(req, { user: mockUser });

    expect(authorizationGuard.canActivate(mockContext)).rejects.toThrowError(
      new NonExistFeedError(),
    );
  });
});