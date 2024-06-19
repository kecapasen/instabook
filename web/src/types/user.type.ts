import { Follow } from "./follow.type";
import { Post } from "./post.type";

export type User = {
  id: number;
  fullname: string;
  email: string;
  phone?: number;
  username: string;
  password: string;
  bio?: string;
  is_private: number;
  is_verified: number;
  created_at: Date;
  posts?: Post[];
  follower?: Follow[];
  following?: Follow[];
};
