import React from 'react';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SignInScreenProps {
  onSignIn: () => void;
  isLoggingIn?: boolean;
}

/**
 * Dedicated sign-in screen shown when the user is not authenticated.
 * Provides a clear call-to-action to sign in with Internet Identity.
 */
export function SignInScreen({ onSignIn, isLoggingIn = false }: SignInScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Prompt Library
          </CardTitle>
          <CardDescription className="text-base">
            Organize and manage your AI prompts securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Sign in to access your prompt library and start organizing your AI prompts.
          </p>
          <Button 
            onClick={onSignIn} 
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            {isLoggingIn ? 'Signing in...' : 'Sign in with Internet Identity'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Your prompts are stored securely and privately on the Internet Computer
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
