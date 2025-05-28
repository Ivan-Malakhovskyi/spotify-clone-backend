import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { LoggerMiddleware } from './common/middleware/logger/logger.middleware';
import { DevConfigService } from './providers/DevConfigService';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { CatsModule } from './cats/cats.module';
import { SongsModule } from './songs/songs.module';
import { SongsController } from './songs/songs.controller';
import { PhotoModule } from './playlist/playlist.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArtistsModule } from './artists/artists.module';
import { typeOrmAsyncConfig } from 'db/data-source';
import { SeedService } from './seed/seed.service';
import { SeedModule } from './seed/seed.module';
import configuration from './config/configuration';
import { validate } from 'env.validation';

const devConfig = {
  port: 3000,
};

const prodConfig = {
  port: 4000,
};

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.production.local'],
      isGlobal: true,
      load: [configuration],
      validate: validate,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    CatsModule,
    SongsModule,
    AuthModule,
    UsersModule,
    ArtistsModule,
    SeedModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    PhotoModule,
    {
      provide: DevConfigService,
      useClass: DevConfigService,
    },
    {
      provide: 'CONFIG',
      useFactory: () => {
        return process.env.NODE_ENV === 'development' ? devConfig : prodConfig;
      },
    },
    SeedService,
  ],
})
export class AppModule implements NestModule {
  constructor(dataSource: DataSource) {
    console.log('Connect to DB with name', dataSource.driver.database);
  }

  configure(consumer: MiddlewareConsumer) {
    //* consumer.apply(LoggerMiddleware).forRoutes('songs'); first USAGE
    //* consumer
    //   .apply(LoggerMiddleware)
    //   .forRoutes({ path: 'songs', method: RequestMethod.GET }); second USAGE

    consumer.apply(LoggerMiddleware).forRoutes(SongsController);
  }
}
