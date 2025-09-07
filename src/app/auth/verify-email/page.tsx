"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.verifyEmail(token);
      
      if (response.success) {
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
        toast.success('Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(response.detail || 'Email verification failed');
      }
    } catch (e: any) {
      setStatus('error');
      const errorMessage = e.response?.data?.detail || e.message || 'Email verification failed';
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  const resendVerification = async () => {
    const email = searchParams.get('email');
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    try {
      await api.resendVerification(email);
      toast.success('Verification email sent!');
    } catch (e: any) {
      const errorMessage = e.response?.data?.detail || e.message || 'Failed to resend verification email';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'verifying' && 'Please wait while we verify your email address.'}
            {status === 'success' && 'Your email has been successfully verified.'}
            {status === 'error' && 'There was a problem verifying your email address.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-4xl">✓</div>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Button 
                className="w-full" 
                onClick={() => router.push("/auth/login")}
              >
                Go to Login
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="text-red-600 text-4xl">✗</div>
              <p className="text-sm text-muted-foreground">{message}</p>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => router.push("/auth/login")}
                >
                  Go to Login
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={resendVerification}
                >
                  Resend Verification Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
