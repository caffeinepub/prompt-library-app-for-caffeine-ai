/**
 * Banner component that displays backend connection status and errors.
 * Shows loading state during initialization and actionable error messages on failure.
 */

import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface BackendConnectionBannerProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}

export function BackendConnectionBanner({
  isLoading,
  isError,
  errorMessage,
}: BackendConnectionBannerProps) {
  if (!isLoading && !isError) {
    return null;
  }

  if (isLoading) {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Connecting to backend</AlertTitle>
        <AlertDescription>
          Please wait while we establish a connection to the backend canister...
        </AlertDescription>
      </Alert>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Backend Connection Failed</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            {errorMessage || 'Unable to connect to the backend. This may be due to a configuration issue or network problem.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Reload Page
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
