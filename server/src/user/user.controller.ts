import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
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

  @Get(':username/followers')
  @UseGuards(SupabaseGuard)
  public async getUserFollowers(@Param('username') username: string) {
    const followers = await this.userService.getUserFollowers(username);
    return followers;
  }

  @Get(':username/following')
  @UseGuards(SupabaseGuard)
  public async getUserFollowing(@Param('username') username: string) {
    const following = await this.userService;
    return following;
  }

  @Post(':username/follow')
  @UseGuards(SupabaseGuard)
  public async followUser(
    @User('email') userEmail: string,
    @Param('username') username: string,
  ) {
    const follow = await this.userService.followUser(userEmail, username);
    return follow;
  }

  @Put(':username/accept')
  @UseGuards(SupabaseGuard)
  public async acceptUser(
    @User('email') userEmail: string,
    @Param('username') username: string,
  ) {
    const accept = await this.userService.acceptUser(userEmail, username);
    return accept;
  }

  @Delete(':username/unfollow')
  @UseGuards(SupabaseGuard)
  public async unfollowUser(
    @User('email') userEmail: string,
    @Param('username') username: string,
  ) {
    const unfollow = await this.userService.unfollowUser(userEmail, username);
    return unfollow;
  }
}
