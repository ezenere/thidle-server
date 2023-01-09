import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthCheckService } from './controllers/auth/services/check.service';
import { LoginService } from './controllers/auth/services/login.service';
import { RevalidateService } from './controllers/auth/services/revalidate.service';
import { JWTMiddleware } from './controllers/middlewares/jwe.middleware.service';
import { InfoService } from './controllers/user/services/info.service';
import { ProfileSuggestionsService } from './controllers/user/services/suggestions.service';
import { UserController } from './controllers/user/user.controller';
import { ThoughtMainService } from './controllers/thought/services/main.service';
import { ThoughtController } from './controllers/thought/thought.controller';
import { databaseProviders } from './database/database.providers';
import { ProfileController } from './controllers/profile/profile.controller';
import { ProfileInfoService } from './controllers/profile/services/info.service';
import { UploadController } from './controllers/upload/upload.controller';
import { InitUploadService } from './controllers/upload/services/init.service';
import { UploadProvider } from './controllers/upload/upload.provider';
import { NewThoughtService } from './controllers/thought/services/new.service';
import { LikeThoughtService } from './controllers/thought/services/like.service';
import { FileUploadService } from './controllers/upload/services/file.service';
import { FinishUploadService } from './controllers/upload/services/finish.service';
import { ThoughtProfileService } from './controllers/profile/services/thoughts.service';

@Module({
  imports: [],
  controllers: [
    AuthController,
    UserController,
    ThoughtController,
    ProfileController,
    UploadController,
  ],
  providers: [
    ...databaseProviders,
    LoginService,
    InfoService,
    ThoughtProfileService,
    RevalidateService,
    AuthCheckService,
    ProfileSuggestionsService,
    ThoughtMainService,
    NewThoughtService,
    LikeThoughtService,
    ProfileInfoService,
    UploadProvider,
    InitUploadService,
    FileUploadService,
    FinishUploadService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JWTMiddleware).exclude('/v0/auth/(.*)').forRoutes('*');
  }
}
