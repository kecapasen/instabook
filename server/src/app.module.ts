import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { SupabaseModule } from './auth/supabase/supabase.module';
import { LoggerMiddleware } from './logger.middleware';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    PassportModule,
    SupabaseModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
