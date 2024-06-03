import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PrismaService } from 'src/lib/prisma.service';
import { SupabaseService } from 'src/auth/supabase/supabase.service';
import { PostController } from './post.controller';

@Module({
  controllers: [PostController],
  providers: [PostService, PrismaService, SupabaseService],
})
export class PostModule {}
