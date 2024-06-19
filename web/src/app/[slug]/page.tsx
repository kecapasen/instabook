"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@/store/auth.store";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { useAxiosInstance } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { FollowingStatus, Post, User } from "@/types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PiSpinnerGapBold } from "react-icons/pi";
import {
  FiHeart,
  FiUser,
  FiMail,
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiUploadCloud,
  FiGrid,
} from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useRouter } from "next/navigation";
import { MdVerified } from "react-icons/md";

type Profile = {
  id: number;
  fullname: string;
  username: string;
  bio?: string;
  is_private: number;
  is_verified: number;
  created_at: Date;
  is_your_account: boolean;
  following_status?: FollowingStatus;
  posts_count: number;
  followers_count: number;
  following_count: number;
  posts?: Post[];
};

type UploadedFile = Blob & {
  preview: string;
};

const formSchema = z.object({
  file: z
    .array(z.instanceof(Blob))
    .min(1, "At least one file is required.")
    .max(10, "You can upload a maximum of 10 files."),
  caption: z
    .string()
    .min(1, "The caption must be at least 1 character long.")
    .max(50, "The caption must be at most 50 characters long."),
});

const Page = ({ params }: { params: { slug: string } }) => {
  const user = useUser();
  const router = useRouter();
  const instance = useAxiosInstance();
  const formMethods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caption: "",
    },
  });
  const { getInputProps, inputRef } = useDropzone({
    maxFiles: 10,
    multiple: true,
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setSelectedImages((prevFiles) => [...prevFiles, ...newFiles]);
      formMethods.setValue("file", [...selectedImages, ...newFiles]);
    },
    onDragEnter: () => {},
    onDragLeave: () => {},
    onDragOver: () => {},
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [selectedImages, setSelectedImages] = useState<UploadedFile[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const handleGetUser = async () => {
    const response = await instance.get(`/user/${params.slug}`);
    setProfile(response.data);
    console.log(response.data);
  };
  const handleGetUsers = async () => {
    try {
      const response = await instance.get("/user");
      setUsers(response.data.users);
    } catch (error) {
      console.error(error);
    }
  };
  const hanldeFollowUser = async (username: string) => {
    try {
      await instance.post(`/user/${username}/follow`);
    } catch (error) {
      console.error(error);
    }
  };
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    const formData = new FormData();
    data.file.map((file) => {
      formData.append("file", file);
    });
    formData.append("caption", data.caption);
    try {
      await instance.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };
  useEffect(() => {
    if (user.accessToken) {
      handleGetUser();
      handleGetUsers();
    } else if (user.accessToken === "") return router.push("/auth/login");
  }, [user.accessToken]);
  return (
    <>
      {user.accessToken && (
        <div className="min-h-dvh">
          <div className="sticky top-0 z-50 bg-white w-full">
            <div className="flex justify-between items-center p-4">
              <p className="font-poppins text-stone-800 font-bold text-lg">
                Facegram
              </p>
              <div className="flex items-center gap-4">
                <FiHeart className="w-6 h-6" />
                <FiMail className="w-6 h-6" />
              </div>
            </div>
            <Separator />
          </div>
          <div className="md:container md:flex md:flex-row md:justify-between py-4">
            {profile && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-around items-center">
                  <Avatar>
                    <AvatarFallback>
                      <FiUser className="w-12 h-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-center">
                    <p className="font-poppins text-stone-800 font-medium">
                      {profile.posts_count}
                    </p>
                    <p className="font-inter text-stone-600 font-medium">
                      Posts
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-poppins text-stone-800 font-medium">
                      {profile.followers_count}
                    </p>
                    <p className="font-inter text-stone-600 font-medium">
                      Followers
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-poppins text-stone-800 font-medium">
                      {profile.following_count}
                    </p>
                    <p className="font-inter text-stone-600 font-medium">
                      Following
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="hidden md:flex flex-col gap-4">
              <div className="flex justify-between w-80 items-center">
                <div className="flex gap-2 items-center">
                  <Avatar>
                    <AvatarFallback>
                      <FiUser className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-inter text-stone-800 font-bold text-sm flex items-center gap-1">
                      <span>{user.profile.username}</span>
                      {user.profile.is_verified === 1 && (
                        <span>
                          <MdVerified />
                        </span>
                      )}
                    </span>
                    <p className="font-inter text-stone-600 font-medium text-sm">
                      {user.profile.fullname}
                    </p>
                  </div>
                </div>
                <Button
                  variant="link"
                  className="font-inter text-sky-600 font-medium text-sm"
                  onClick={() => {
                    router.push("/auth/login");
                    user.removeUser();
                  }}
                >
                  Logout
                </Button>
              </div>
              <p className="font-inter text-stone-800 font-bold text-sm">
                Sugested For You.
              </p>
              {users &&
                users.map((user, index) => {
                  return (
                    <div
                      className="flex justify-between items-center"
                      key={index}
                    >
                      <div className="flex gap-2 items-center">
                        <Avatar>
                          <AvatarFallback>
                            <FiUser className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-inter text-stone-800 font-bold text-sm flex items-center gap-1">
                            <span>{user.username}</span>
                            {user.is_verified === 1 && (
                              <span>
                                <MdVerified />
                              </span>
                            )}
                          </p>
                          <p className="font-inter text-stone-600 font-medium text-sm">
                            {user.fullname}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="link"
                        className="font-inter text-sky-600 font-medium text-sm"
                        onClick={() => {
                          hanldeFollowUser(user.username);
                        }}
                      >
                        Follow
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="relative">
            <div className="fixed bottom-0 z-50 bg-white w-full">
              <Separator />
              <div className="flex justify-around items-center py-1">
                <Button variant="ghost">
                  <FiHome className="w-6 h-6" />
                </Button>
                <Button variant="ghost">
                  <FiSearch className="w-6 h-6" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost">
                      <FiPlusSquare className="w-6 h-6" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <FormProvider {...formMethods}>
                      <form
                        onSubmit={formMethods.handleSubmit(onSubmit)}
                        className="flex flex-col gap-4"
                      >
                        <DialogHeader>
                          <DialogTitle className="font-poppins text-stone-800 font-bold">
                            Create Post
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-2 font-inter text-stone-600 font-medium">
                          <Carousel className="w-full">
                            <CarouselContent>
                              {selectedImages.length > 0 &&
                                selectedImages.map((file, index) => (
                                  <CarouselItem
                                    key={index}
                                    className="flex justify-center bg-slate-100 max-h-[300px]"
                                  >
                                    <Image
                                      src={file.preview}
                                      alt={`preview posts.`}
                                      quality={100}
                                      width={300}
                                      height={300}
                                      className="h-[300px] w-auto rounded-sm"
                                    />
                                  </CarouselItem>
                                ))}
                              <CarouselItem className="flex justify-center items-center bg-slate-100 h-[300px] w-[300px]">
                                <FormField
                                  control={formMethods.control}
                                  name="file"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        <FiUploadCloud className="h-64 w-64 text-slate-200" />
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          className="hidden"
                                          {...getInputProps()}
                                          ref={inputRef}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </CarouselItem>
                            </CarouselContent>
                          </Carousel>
                          {selectedImages.length > 0 && (
                            <div className="flex gap-2 p-2 bg-slate-100 rounded-sm">
                              {selectedImages.map((file, index) => (
                                <Image
                                  key={index}
                                  src={file.preview}
                                  alt={`preview posts.`}
                                  quality={100}
                                  width={300}
                                  height={300}
                                  className="h-16 w-auto rounded-sm"
                                />
                              ))}
                            </div>
                          )}
                          <FormField
                            control={formMethods.control}
                            name="caption"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Caption</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter caption."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <DialogFooter className="md:justify-end">
                          <Button
                            disabled={isPending}
                            type="submit"
                            className="font-poppins font-medium"
                          >
                            {isPending ? (
                              <>
                                <PiSpinnerGapBold className="mr-2 h-4 w-4 animate-spin" />
                                <p>Please wait</p>
                              </>
                            ) : (
                              <p>Create</p>
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </FormProvider>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost">
                  <Avatar>
                    <AvatarFallback>
                      <FiUser className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
