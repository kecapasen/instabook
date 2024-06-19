import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { SupabaseService } from './supabase/supabase.service';
import { CreateAccountDTO } from 'src/dto/auth/create-account.dto';
import { EmailOtpType } from '@supabase/supabase-js';
import { LoginAccountDTO } from 'src/dto/auth/login-account.dto';

@Injectable()
export class AuthService {
  @Inject()
  private readonly prismaService: PrismaService;
  @Inject()
  private readonly supabaseService: SupabaseService;

  public async confirm(token_hash: string, type: EmailOtpType) {
    if (!token_hash || !type) throw new UnprocessableEntityException();
    const { error } = await this.supabaseService
      .getClient()
      .auth.verifyOtp({ token_hash, type });
    if (error) throw new UnprocessableEntityException();
  }

  public async register(createAccountDTO: CreateAccountDTO) {
    const isAlready = await this.prismaService.users.findUnique({
      where: {
        username: createAccountDTO.username,
      },
    });
    if (isAlready) throw new UnprocessableEntityException();
    const { error } = await this.supabaseService
      .getClient()
      .auth.signUp(createAccountDTO);
    if (error) throw new UnprocessableEntityException();
    await this.prismaService.users.create({
      data: createAccountDTO,
    });
    const responseData = {
      message: 'Success',
    };
    return responseData;
  }

  public async login(loginAccountDTO: LoginAccountDTO) {
    const user = await this.prismaService.users.findUnique({
      where: {
        username: loginAccountDTO.username,
      },
      select: {
        fullname: true,
        username: true,
        email: true,
        is_verified: true,
      },
    });
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email: user.email,
        password: loginAccountDTO.password,
      });
    if (error) throw new UnprocessableEntityException();
    const responseData = {
      accessToken: data.session.access_token,
      profile: user,
    };
    const parse = JSON.parse(
      JSON.stringify(responseData, (_, value) => {
        return typeof value === 'bigint' ? Number(value) : value;
      }),
    );
    return parse;
  }
}
