import { User } from "./user.type";

export type Follow = {
  id: number;
  follower_id: number;
  following_id: number;
  is_accepted: number;
  created_at: Date;
  follower?: User;
  following?: User;
};
