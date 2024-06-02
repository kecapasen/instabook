import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';

@Injectable()
export class UserService {
  @Inject()
  private readonly prismaService: PrismaService;

  public async getUsers(userEmail: string) {
    const user = await this.prismaService.users.findUnique({
      where: {
        email: userEmail,
      },
    });
    const result = await this.prismaService.users.findMany({
      where: {
        AND: [
          {
            id: {
              not: user!.id,
            },
          },
          {
            following: {
              none: {
                follower_id: {
                  equals: user!.id,
                },
              },
            },
          },
        ],
      },
      include: {
        following: true,
      },
    });
    if (!result[0]) throw new NotFoundException();
    const responseData = {
      users: result.map((data) => {
        return {
          id: data.id,
          fullname: data.fullname,
          username: data.username,
          bio: data.bio,
          is_private: data.is_private,
          created_at: data.created_at,
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

  public async getUserByUsername(userEmail: string, username: string) {
    const user = await this.prismaService.users.findUnique({
      where: {
        email: userEmail,
      },
    });
    const result = await this.prismaService.users.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        bio: true,
        is_private: true,
        created_at: true,
        posts: {
          include: {
            post_attachments: true,
          },
        },
        following: {
          where: {
            follower_id: {
              equals: user!.id,
            },
          },
          select: {
            is_accepted: true,
          },
        },
        _count: {
          select: {
            posts: true,
            follower: true,
            following: true,
          },
        },
      },
    });
    if (!result) throw new NotFoundException();
    const responseData = {
      id: result.id,
      fullname: result.fullname,
      username: result.username,
      bio: result.bio,
      is_private: result.is_private,
      created_at: result.created_at,
      is_your_account: result.id === user!.id,
      ...(result.id !== user.id && {
        following_status: result.following[0]
          ? result.following[0].is_accepted === 1
            ? 'following'
            : 'requested'
          : 'not-following',
      }),
      posts_count: result._count.posts,
      followers_count: result._count.follower,
      following_count: result._count.following,
      posts:
        (result.is_private === 0 || result.following[0]?.is_accepted === 1) &&
        result.posts,
    };
    const parse = JSON.parse(
      JSON.stringify(responseData, (_, value) => {
        return typeof value === 'bigint' ? Number(value) : value;
      }),
    );
    return parse;
  }

  public async acceptFollow(userEmail: string, username: string) {
    const user = await this.prismaService.users.findUnique({
      where: {
        email: userEmail,
      },
    });
    const check = await this.prismaService.users.findUnique({
      where: {
        username: username,
      },
    });
    if (!check) throw new NotFoundException();
    const isFollowed = await this.prismaService.follow.findMany({
      where: {
        AND: [
          {
            follower_id: {
              equals: Number(check.id),
            },
          },
          {
            following_id: {
              equals: user!.id,
            },
          },
        ],
      },
    });
    if (!isFollowed[0]) throw new UnprocessableEntityException();
    if (isFollowed[0].is_accepted) throw new UnprocessableEntityException();
    await this.prismaService.follow.updateMany({
      where: {
        AND: [
          {
            follower_id: {
              equals: Number(check.id),
            },
          },
          {
            following_id: {
              equals: user!.id,
            },
          },
        ],
      },
      data: {
        is_accepted: 1,
      },
    });
    return {
      message: 'Follow request accepted',
    };
  }
}
