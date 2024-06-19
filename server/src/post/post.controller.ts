import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { SupabaseGuard } from 'src/auth/supabase/supabase.guard';
import { User } from 'src/auth/user.decorator';
import { CreatePostDTO } from 'src/dto/post/create-post.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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

  @Post()
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 10 }]))
  public async createPost(
    @User('email') userEmail: string,
    @Body() createPostDto: CreatePostDTO,
    @UploadedFiles() files: { file: Express.Multer.File[] },
  ) {
    console.log(files);
    const post = await this.postService.createPost(
      userEmail,
      createPostDto,
      files.file,
    );
    return post;
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  public async deletePost(
    @User('email') userEmail: string,
    @Param('id', ParseIntPipe) postID: number,
  ) {
    const post = await this.postService.deletePost(userEmail, postID);
    return post;
  }
}
