import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from 'src/auth/supabase/supabase.service';
import { CreatePostDTO } from 'src/dto/post/create-post.dto';
import { PrismaService } from 'src/lib/prisma.service';
import { bucketName } from 'src/types/bucket.enum';

@Injectable()
export class PostService {
  @Inject()
  private readonly prismaService: PrismaService;
  @Inject()
  private readonly supabaseService: SupabaseService;

  public async getPosts(userEmail: string, page: number, size: number) {
    const user = await this.prismaService.users.findUnique({
      where: {
        email: userEmail,
      },
    });
    const skip = Number(size) * Number(page);
    const totalRows = await this.prismaService.posts.count();
    const result = await this.prismaService.posts.findMany({
      take: size,
      skip,
      orderBy: {
        id: 'desc',
      },
      where: {
        OR: [
          {
            user: {
              following: {
                some: {
                  follower_id: user.id,
                  is_accepted: 1,
                },
              },
            },
          },
          {
            user_id: user.id,
          },
        ],
      },
      include: {
        user: true,
        post_attachments: true,
      },
    });
    const responseData = {
      maxPages: Math.ceil(totalRows / size),
      page,
      size,
      posts: result.map((post) => {
        return {
          id: post.id,
          caption: post.caption,
          created_at: post.created_at,
          deleted_at: post.deleted_at,
          user: {
            id: post.user.id,
            fullname: post.user.fullname,
            username: post.user.username,
            bio: post.user.bio,
            is_private: post.user.is_private,
            is_verified: post.user.is_verified,
            created_at: post.user.created_at,
          },
          attachments: post.post_attachments.map((attachment) => {
            return {
              id: attachment.id,
              storage_path: attachment.storage_path,
            };
          }),
        };
      }),
    };
    const parse = JSON.parse(
      JSON.stringify(responseData, (_, value) => {
        return typeof value === 'bigint' ? Number(value) : value;
      }),
    );
    return parse;
  }

  public async createPost(
    userEmail: string,
    createPostDto: CreatePostDTO,
    files: Express.Multer.File[],
  ) {
    const user = await this.prismaService.users.findUnique({
      where: {
        email: userEmail,
      },
    });
    const url = await this.supabaseService.uploadPost(
      bucketName.post,
      files,
      user.username,
    );
    await this.prismaService.posts.create({
      data: {
        user_id: user.id,
        caption: createPostDto.caption,
        post_attachments: {
          createMany: {
            data: url,
          },
        },
      },
    });
    return {
      message: 'Create post success',
    };
  }

  public async deletePost(userEmail: string, postID: number) {
    const user = await this.prismaService.users.findUnique({
      where: {
        email: userEmail,
      },
    });
    const result = await this.prismaService.posts.findUnique({
      where: {
        id: postID,
      },
      include: {
        user: true,
      },
    });
    if (!result) throw new NotFoundException({ message: 'Post not found' });
    const match = user.id === result.user.id;
    if (!match) throw new ForbiddenException({ message: 'Forbidden access' });
    await this.prismaService.posts.delete({
      where: {
        id: postID,
      },
    });
    return null;
  }
}
