import {
  Controller,
  Get,
  Inject,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { SupabaseGuard } from 'src/auth/supabase/supabase.guard';
import { User } from 'src/auth/user.decorator';

@Controller('api/post')
export class PostController {
  @Inject()
  private readonly postService: PostService;

  @Get()
  @UseGuards(SupabaseGuard)
  public async getPosts(
    @User('email') userEmail: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number,
  ) {
    const posts = await this.postService.getPosts(userEmail, page, size);
    return posts;
  }
}
