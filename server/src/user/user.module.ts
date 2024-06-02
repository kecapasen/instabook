import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/lib/prisma.service';
import { SupabaseService } from 'src/auth/supabase/supabase.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, SupabaseService],
})
export class UserModule {}
