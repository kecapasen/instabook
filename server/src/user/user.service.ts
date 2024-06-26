import {
  Inject,
  Injectable,
  NotAcceptableException,
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
              not: user.id,
            },
          },
          {
            following: {
              none: {
                follower_id: {
                  equals: user.id,
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
    if (!result[0])
      throw new NotFoundException({
        message: 'User not found',
      });
    const responseData = {
      users: result.map((data) => {
        return {
          id: data.id,
          fullname: data.fullname,
          username: data.username,
          bio: data.bio,
          is_private: data.is_private,
          is_verified: data.is_verified,
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
        is_verified: true,
        created_at: true,
        posts: {
          include: {
            post_attachments: true,
          },
        },
        following: {
          where: {
            follower_id: {
              equals: user.id,
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
    if (!result)
      throw new NotFoundException({
        message: 'User not found',
      });
    const responseData = {
      id: result.id,
      fullname: result.fullname,
      username: result.username,
      bio: result.bio,
      is_private: result.is_private,
      is_verified: result.is_verified,
      created_at: result.created_at,
      is_your_account: result.id === user.id,
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

  public async getUserFollowers(username: string) {
    const user = await this.prismaService.users.findUnique({
      where: {
        username,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const result = await this.prismaService.users.findMany({
      where: {
        follower: {
          some: {
            following_id: {
              equals: Number(user.id),
            },
          },
        },
      },
      include: {
        following: true,
      },
    });
    if (!result[0])
      throw new NotFoundException({
        message: 'User not found',
      });
    const responseData = {
      followers: result.map((data) => {
        return {
          id: data.id,
          fullname: data.fullname,
          username: data.username,
          bio: data.bio,
          is_private: data.is_private,
          is_verified: data.is_verified,
          created_at: data.created_at,
          is_requested: data.following[0].is_accepted ? 0 : 1,
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

  public async getUserFollowing(username: string) {
    const user = await this.prismaService.users.findUnique({
      where: {
        username,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const result = await this.prismaService.users.findMany({
      where: {
        following: {
          some: {
            follower_id: {
              equals: user.id,
            },
          },
        },
      },
      include: {
        following: true,
      },
    });
    if (!result[0])
      throw new NotFoundException({
        message: 'User not found',
      });
    const responseData = {
      following: result.map((data) => {
        return {
          id: data.id,
          full_name: data.fullname,
          username: data.username,
          bio: data.bio,
          is_private: data.is_private,
          is_verified: data.is_verified,
          created_at: data.created_at,
          is_requested: data.following[0].is_accepted ? 0 : 1,
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

  public async followUser(userEmail: string, username: string) {
    const user = await this.prismaService.users.findUnique({
      where: {
        email: userEmail,
      },
    });
    if (username === user.username)
      throw new UnprocessableEntityException({
        message: 'You are not allowed to follow yourself',
      });
    const check = await this.prismaService.users.findUnique({
      where: {
        username,
      },
    });
    if (!check)
      throw new NotFoundException({
        message: 'User not found',
      });
    const isFollowed = await this.prismaService.follow.findMany({
      where: {
        AND: [
          {
            follower_id: {
              equals: user.id,
            },
          },
          {
            following_id: {
              equals: check.id,
            },
          },
        ],
      },
    });
    if (isFollowed[0])
      throw new UnprocessableEntityException({
        message: 'You are already followed',
        status: isFollowed[0].is_accepted ? 'following' : 'requested',
      });
    const result = await this.prismaService.follow.create({
      data: {
        follower_id: user.id,
        following_id: check.id,
        is_accepted: check.is_private ? 0 : 1,
      },
    });
    return {
      message: 'Follow success',
      status: result.is_accepted ? 'following' : 'requested',
    };
  }

  public async acceptUser(userEmail: string, username: string) {
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
    if (!check)
      throw new NotFoundException({
        message: 'User not found',
      });
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
              equals: user.id,
            },
          },
        ],
      },
    });
    if (!isFollowed[0])
      throw new UnprocessableEntityException({
        message: 'The user is not following you',
      });
    if (isFollowed[0].is_accepted)
      throw new UnprocessableEntityException({
        message: 'Follow request is already accepted',
      });
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
              equals: user.id,
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

  public async unfollowUser(userEmail: string, username: string) {
    const user = await this.prismaService.users.findUnique({
      where: {
        email: userEmail,
      },
    });
    const check = await this.prismaService.users.findUnique({
      where: {
        username,
      },
    });
    if (!check) throw new NotFoundException({ message: 'User not found' });
    const checkFollowed = await this.prismaService.follow.findMany({
      where: {
        AND: [
          {
            follower_id: {
              equals: user.id,
            },
          },
          {
            following_id: {
              equals: Number(check.id),
            },
          },
        ],
      },
    });
    if (!checkFollowed[0])
      throw new NotAcceptableException({
        message: 'You are not following the user',
      });
    await this.prismaService.follow.deleteMany({
      where: {
        AND: [
          {
            follower_id: {
              equals: user.id,
            },
          },
          {
            following_id: {
              equals: Number(check.id),
            },
          },
        ],
      },
    });
    return null;
  }
}
