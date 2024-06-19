import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAccountDTO } from 'src/dto/auth/create-account.dto';
import { EmailOtpType } from '@supabase/supabase-js';
import { LoginAccountDTO } from 'src/dto/auth/login-account.dto';

@Controller('api/auth')
export class AuthController {
  @Inject()
  private readonly authService: AuthService;

  @Get('confirm')
  public async confirm(
    @Query('token_hash') token_hash: string,
    @Query('type') type: EmailOtpType,
  ) {
    await this.authService.confirm(token_hash, type);
  }

  @Post('register')
  public async register(@Body() createAccountDTO: CreateAccountDTO) {
    const register = await this.authService.register(createAccountDTO);
    return register;
  }
  @Post('login')
  public async login(@Body() loginAccountDTO: LoginAccountDTO) {
    const login = await this.authService.login(loginAccountDTO);
    return login;
  }
}
