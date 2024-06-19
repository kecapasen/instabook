import { PostAttachment } from "./post-attachment.type";
import { User } from "./user.type";

export type Post = {
  id: number;
  user_id: number;
  caption: string;
  post_attachments: PostAttachment[];
  created_at: Date;
  deleted_at?: Date;
  user?: User;
};
