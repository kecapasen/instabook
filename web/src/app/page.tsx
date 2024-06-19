"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FiHeart,
  FiUser,
  FiMessageCircle,
  FiSend,
  FiMail,
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiUploadCloud,
} from "react-icons/fi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { MdVerified } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { useAxiosInstance } from "@/lib/axios";
import { useUser } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { useInView } from "react-intersection-observer";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PiSpinnerGapBold } from "react-icons/pi";

type User = {
  id?: number;
  fullname?: string;
  username: string;
  bio?: string;
  is_private?: number;
  is_verified: number;
  created_at?: string;
};

type PostAttachments = {
  id?: number;
  storage_path: string;
};

type Post = {
  id?: number;
  caption: string;
  created_at: string;
  deleted_at?: string | null;
  user: User;
  attachments: PostAttachments[];
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

const Page = () => {
  const user = useUser();
  const instance = useAxiosInstance();
  const router = useRouter();
  const { ref, inView } = useInView();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[] | null>(null);
  const [page, setPage] = useState<number>(0);
  const [maxPages, setMaxPages] = useState<number>(0);
  const [selectedImages, setSelectedImages] = useState<UploadedFile[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
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
  const handleGetPosts = async () => {
    try {
      const response = await instance.get("/post", {
        params: {
          page,
          size: 10,
        },
      });
      setPosts((prev) => [...prev, ...response.data.posts]);
      setMaxPages(response.data.maxPages - 1);
    } catch (error) {
      console.error(error);
    }
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
      const newPost: Post = {
        user: {
          username: user.profile.username!,
          is_verified: Number(user.profile.is_verified),
        },
        caption: data.caption,
        attachments: data.file.map((file) => {
          return {
            storage_path: URL.createObjectURL(file),
          };
        }),
        created_at: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };
  useEffect(() => {
    if (user.accessToken) {
      handleGetPosts();
    } else if (user.accessToken === "") return router.push("/auth/login");
  }, [user.accessToken, page]);
  useEffect(() => {
    if (user.accessToken) {
      handleGetUsers();
    } else if (user.accessToken === "") return router.push("/auth/login");
  }, [user.accessToken]);
  useEffect(() => {
    if (inView) {
      page < maxPages && setPage((prev) => prev + 1);
    }
  }, [inView, maxPages]);
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
            <div className="flex flex-col gap-4">
              {posts &&
                posts.map((post: Post, index) => {
                  return (
                    <div className="flex flex-col gap-2 px-4" key={index}>
                      <div className="flex gap-2 items-center">
                        <Avatar>
                          <AvatarFallback>
                            <FiUser className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-inter flex items-center gap-1">
                            <span className="font-inter text-stone-800 font-bold text-sm flex items-center gap-1">
                              <span>{post.user.username}</span>
                              {post.user.is_verified! === 1 && <MdVerified />}
                            </span>
                            <span className="text-stone-600 font-medium text-sm">
                              • {formatDistanceToNow(post.created_at)}
                            </span>
                          </p>
                          <p className="font-inter text-stone-600 font-medium text-sm">
                            No Context.
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="border rounded-sm max-w-[500px]">
                          <Carousel>
                            <CarouselContent>
                              {post.attachments.map((attachment, index) => {
                                return (
                                  <CarouselItem key={index}>
                                    <Image
                                      src={attachment.storage_path}
                                      alt={`${post.user.username} posts.`}
                                      quality={100}
                                      width={500}
                                      height={500}
                                      className="w-full h-full rounded-sm"
                                    />
                                  </CarouselItem>
                                );
                              })}
                            </CarouselContent>
                          </Carousel>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <FiHeart className="w-6 h-6" />
                        <FiMessageCircle className="w-6 h-6" />
                        <FiSend className="w-6 h-6" />
                      </div>
                      <p className="font-inter space-x-1">
                        <span className="text-stone-800 font-bold text-sm">
                          {post.user.username}
                        </span>
                        <span className="text-stone-700 font-medium text-sm">
                          {post.caption}
                        </span>
                      </p>
                    </div>
                  );
                })}
            </div>
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
          {posts.length >= 10 && (
            <div
              className="flex justify-center items-center text-stone"
              ref={ref}
            >
              <PiSpinnerGapBold className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default Page;
