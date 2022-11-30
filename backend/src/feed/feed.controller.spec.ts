import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import configuration from 'configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerErrorHandlingFilter } from '@root/ServerErrorHandlingFilter';
import { HttpExceptionFilter } from '@root/http-exception.filter';
import { DataSource } from 'typeorm';
import { Feed } from '@root/entities/Feed.entity';
import { FeedModule } from './feed.module';
import { FeedService } from './feed.service';
import { decrypt } from './feed.utils';

describe('FeedController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let feedService: FeedService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `${process.cwd()}/config/.${process.env.NODE_ENV}.env`,
          load: [configuration],
        }),
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          synchronize: false,
          logging: true,
          keepConnectionAlive: true,
          entities: [`${__dirname}/../entities/*.entity{.ts,.js}`],
        }),
        FeedModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(
      new ServerErrorHandlingFilter(),
      new HttpExceptionFilter(),
    );
    dataSource = moduleFixture.get(DataSource);
    feedService = moduleFixture.get(FeedService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/feed 개인 피드 생성 : 정상 동작일 시 디비 삽입 확인', async () => {
    const mockCreateFeedDto = {
      name: '피드 이름 1',
      thumbnail: 'naver.com',
      description: '피드 1 설명',
      dueDate: new Date('2022-11-20'),
    };

    const mockUserId = 1;

    const encryptedId = await feedService.createFeed(
      mockCreateFeedDto,
      mockUserId,
    );
    const res = await dataSource
      .getRepository(Feed)
      .find({ where: { id: Number(decrypt(encryptedId)) } });

    expect(res.length).toBe(1);
    expect(res[0]).toEqual(expect.objectContaining(mockCreateFeedDto));
  });

  it(`/feed 개인 피드 생성 : 피드 이름 유효성 검사`, () => {
    const mockCreateFeedDto = {
      name: '피드 이름이 열자 이상 입니다용',
      thumbnail: 'naver.com',
      description: '피드 1 설명',
      dueDate: new Date(),
    };

    return request(app.getHttpServer())
      .post('/feed')
      .send(mockCreateFeedDto)
      .expect(HttpStatus.CONFLICT)
      .expect((res) => {
        expect(res.body.data.error).toBe('InvalidFeedName');
      });
  });

  it(`/feed 개인 피드 생성 : 유효한 user_id인지 검사`, () => {
    const mockCreateFeedDto = {
      name: '피드 이름',
      thumbnail: 'naver.com',
      description: '피드 1 설명',
      dueDate: new Date(),
      userId: 1000,
    };

    return request(app.getHttpServer())
      .post('/feed')
      .send(mockCreateFeedDto)
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect((res) => {
        expect(res.body.data.error).toBe('NonExistUserException');
      });
  });
});
