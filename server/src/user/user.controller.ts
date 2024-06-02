import { Controller, Get, Inject, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SupabaseGuard } from 'src/auth/supabase/supabase.guard';
import { User } from 'src/auth/user.decorator';

@Controller('api/user')
export class UserController {
  @Inject()
  private readonly userService: UserService;

  @Get()
  @UseGuards(SupabaseGuard)
  public async getUsers(@User('email') userEmail: string) {
    const user = await this.userService.getUsers(userEmail);
    return user;
  }

  @Get(':username')
  @UseGuards(SupabaseGuard)
  public async getUserByUsername(
    @User('email') userEmail: string,
    @Param('username') username: string,
  ) {
    const user = await this.userService.getUserByUsername(userEmail, username);
    return user;
  }

  @Put(':username/accept')
  @UseGuards(SupabaseGuard)
  public async acceptFollow(
    @User('email') userEmail: string,
    @Param('username') username: string,
  ) {
    const accept = await this.userService.acceptFollow(userEmail, username);
    return accept;
  }
}
