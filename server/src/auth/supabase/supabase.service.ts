import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { bucketName } from 'src/types/bucket.enum';

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  private clientInstance: SupabaseClient;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService,
  ) {}

  public getClient() {
    if (this.clientInstance) {
      return this.clientInstance;
    }
    this.clientInstance = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_KEY'),
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${ExtractJwt.fromAuthHeaderAsBearerToken()(
              this.request,
            )}`,
          },
        },
      },
    );
    return this.clientInstance;
  }

  public async uploadPost(
    bucketName: bucketName,
    file: Express.Multer.File | Express.Multer.File[],
    fileName?: string,
  ) {
    const upload = async (file: Express.Multer.File) => {
      const fileExtension = file.mimetype.toString().split('/')[1];
      const filePath = `${new Date().getTime()}-${fileName || ''}.${fileExtension}`;
      const { data, error } = await this.getClient()
        .storage.from(bucketName)
        .upload(filePath, file.buffer);
      if (error) throw new UnprocessableEntityException(error);
      const uploadedFilePublicUrl = this.getClient()
        .storage.from(bucketName)
        .getPublicUrl(data.path);
      return { storage_path: uploadedFilePublicUrl.data.publicUrl };
    };
    if (Array.isArray(file)) {
      const uploadPromises = file.map(upload);
      return await Promise.all(uploadPromises);
    } else {
      return await upload(file);
    }
  }
}
