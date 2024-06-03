import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';

@Injectable()
export class PostService {
  @Inject()
  private readonly prismaService: PrismaService;

  public async getPosts(userEmail: string, page: number, size: number) {
    const user = await this.prismaService.users.findUnique({
      where: {
        email: userEmail,
      },
    });
    const skip = Number(size) * Number(page);
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
                  follower_id: user!.id,
                  is_accepted: 1,
                },
              },
            },
          },
          {
            user_id: user!.id,
          },
        ],
      },
      include: {
        user: true,
        post_attachments: true,
      },
    });
    const responseData = {
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
}
