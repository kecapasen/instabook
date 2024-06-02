import {
  Inject,
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SupabaseService } from './auth/supabase/supabase.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  @Inject()
  private readonly supabaseService: SupabaseService;
  private readonly logger = new Logger('User Log');

  async use(request: Request, response: Response, next: NextFunction) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    if (!accessToken) throw new UnauthorizedException();

    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(accessToken);
    if (error) throw new UnauthorizedException();

    request.user = data.user;

    this.logger.log(
      `[${data.user.email}] accessing ${request.method} "${request.originalUrl}"`,
    );

    next && next();
  }
}
