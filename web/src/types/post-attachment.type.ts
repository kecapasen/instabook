import { Post } from "./post.type";

export type PostAttachment = {
  id: number;
  post_id: number;
  storage_path: string;
  post?: Post;
};
