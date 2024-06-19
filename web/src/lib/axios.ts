"use client";
import { useUser } from "@/store/auth.store";
import axios, { AxiosInstance } from "axios";
export const useAxiosInstance = (): AxiosInstance => {
  const { accessToken } = useUser((state) => state);
  const instance = axios.create({
    baseURL: "http://192.168.18.7:3001/api",
  });
  instance.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  return instance;
};
