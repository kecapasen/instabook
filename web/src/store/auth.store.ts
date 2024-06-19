import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
  fullname: string | null;
  username: string | null;
  is_verified: string | number | null;
};

type AuthState = {
  accessToken: string | null;
  profile: UserState;
  setUser: (data: AuthState) => void;
  removeUser: () => void;
};

export const useUser = create(
  persist<AuthState>(
    (set) => ({
      accessToken: null,
      profile: {
        fullname: null,
        username: null,
        is_verified: null,
      },
      setUser: (data: { accessToken: string | null; profile: UserState }) => {
        set({
          accessToken: data.accessToken,
          profile: {
            fullname: data.profile.fullname,
            username: data.profile.username,
            is_verified: data.profile.is_verified,
          },
        });
      },
      removeUser: () => {
        set({
          accessToken: "",
          profile: {
            fullname: "",
            username: "",
            is_verified: "",
          },
        });
      },
    }),
    { name: "authStore" }
  )
);
