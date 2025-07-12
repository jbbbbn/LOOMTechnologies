import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import loomLogo from "@assets/LOOM_logo_2_1752244843559.jpg";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm<LoginForm | SignupForm>({
    resolver: zodResolver(isSignUp ? signupSchema : loginSchema),
    defaultValues: isSignUp
      ? { email: "", password: "", username: "" }
      : { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm | SignupForm) => {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const response = await apiRequest("POST", endpoint, data);
      return await response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("authToken", data.token);
      toast({
        title: isSignUp
          ? "Account created successfully!"
          : "Welcome back!",
        description: isSignUp
          ? "You can now start building your digital twin."
          : "Let's continue building your consciousness profile.",
      });
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Authentication failed",
        description:
          error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm | SignupForm) => {
    const cleanedData = isSignUp
      ? data
      : {
          email: (data as LoginForm).email,
          password: (data as LoginForm).password,
        };

    loginMutation.mutate(cleanedData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={loomLogo}
              alt="LOOM"
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "Create Your Digital Twin" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Start your consciousness upload journey"
              : "Continue building your digital consciousness"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isSignUp && (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Choose a username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-[var(--loom-orange)] hover:bg-[var(--loom-orange)]/90"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending
                  ? "Processing..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[var(--loom-orange)]"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}