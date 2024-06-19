import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/lib/prisma.service';
import { SupabaseService } from './supabase/supabase.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, PrismaService],
})
export class AuthModule {}
