"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAxiosInstance } from "@/lib/axios";
import { Separator } from "@/components/ui/separator";
import { PiSpinnerGapBold } from "react-icons/pi";
import { useRouter } from "next/navigation";
import { useUser } from "@/store/auth.store";

const formSchema = z.object({
  username: z
    .string()
    .min(3, "The username field must be at least 3 characters.")
    .max(15)
    .regex(
      /^[\w.]+$/,
      "The username field must contain only alphanumeric characters, dots, or underscores."
    ),
  password: z
    .string()
    .min(6, "The password field must be at least 6 characters.")
    .max(50),
});

const Login = () => {
  const user = useUser();
  const router = useRouter();
  const instance = useAxiosInstance();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const formMethods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsPending(true);
      const token = await instance.post("/auth/login", values);
      user.setUser(token.data);
      router.push("/");
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };
  return (
    <div className="min-h-dvh md:container flex justify-center items-center">
      <Card className="w-[350px]">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-poppins text-stone-800 font-bold">
                Login to Your Account
              </CardTitle>
              <CardDescription className="font-inter text-stone-600 font-medium">
                Access your account with your credentials.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="font-inter text-stone-600 font-medium py-2 flex flex-col gap-2">
              <FormField
                control={formMethods.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Username." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formMethods.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Password."
                        {...field}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full">
                <Button
                  type="button"
                  variant="link"
                  className="font-inter text-sky-600 font-medium text-sm px-0"
                  onClick={() => {
                    router.push("/auth/register");
                  }}
                >
                  Don&apos;t have an account?
                </Button>
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="py-4 flex justify-end items-center">
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
                  <p>Login</p>
                )}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
};
export default Login;
