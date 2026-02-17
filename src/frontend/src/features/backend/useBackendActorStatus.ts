/**
 * Hook that wraps useActor and useInternetIdentity to expose backend actor status
 * and provide structured diagnostics when actor creation fails.
 */

import { useEffect, useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { logBackendDiagnostic } from './actorDiagnostics';

export interface BackendActorStatus {
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
  error?: Error;
  canSave: boolean;
  statusMessage?: string;
}

/**
 * Provides backend actor status with enhanced error reporting.
 * Monitors actor creation and logs diagnostic information when failures occur.
 */
export function useBackendActorStatus(): BackendActorStatus {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const [error, setError] = useState<Error | undefined>(undefined);

  const isAuthenticated = !!(identity && !identity.getPrincipal().isAnonymous());
  const isLoading = isInitializing || actorFetching;
  const isReady = !!actor && isAuthenticated && !isLoading;
  const isError = !isLoading && isAuthenticated && !actor;

  // Log diagnostic information when actor creation fails
  useEffect(() => {
    if (isError && !error) {
      const actorError = new Error('Backend actor creation failed. The app cannot connect to the backend canister.');
      setError(actorError);

      logBackendDiagnostic({
        phase: 'actor-creation',
        isAuthenticated,
        principal: identity?.getPrincipal().toString(),
        error: actorError,
        additionalContext: {
          actorFetching,
          hasActor: !!actor,
        },
      });
    }
  }, [isError, error, isAuthenticated, identity, actorFetching, actor]);

  // Determine status message
  let statusMessage: string | undefined;
  if (isLoading) {
    statusMessage = 'Connecting to backend...';
  } else if (isError) {
    statusMessage = 'Backend connection failed. Please reload the page to retry.';
  }

  return {
    isLoading,
    isReady,
    isError,
    error,
    canSave: isReady,
    statusMessage,
  };
}
