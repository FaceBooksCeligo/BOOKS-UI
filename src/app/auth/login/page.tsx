"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { toast } from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const { setAuth, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated) router.replace(redirect);
  }, [isAuthenticated, redirect, router]);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const response = await api.login(values.email, values.password);

      if (response.success) {
        const { accessToken, user } = response.data as any;
        setAuth({ 
          token: accessToken, 
          user: user,
          orgId: user?.orgId 
        });

        // set cookie for middleware as well
        document.cookie = `books_ui_token=${accessToken}; path=/`;
        toast.success("Login successful!");
        router.replace(redirect);
      } else {
        setError(response.detail || "Login failed");
      }
    } catch (e: any) {
      const errorMessage = e.response?.data?.detail || e.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              No account?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={() => router.push("/auth/signup")}
              >
                Create one
              </Button>
            </div>
            <div className="text-sm text-center">
              <Button 
                variant="link" 
                className="p-0 h-auto text-indigo-600" 
                onClick={() => router.push("/admin/login")}
              >
                Admin Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


