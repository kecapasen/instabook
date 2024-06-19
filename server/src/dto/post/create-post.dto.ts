import { IsString, Length } from 'class-validator';
export class CreatePostDTO {
  @IsString()
  @Length(1, 255)
  public readonly caption: string;
}
