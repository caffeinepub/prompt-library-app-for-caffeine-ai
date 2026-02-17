import { useCallback, useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { performProviderLogout } from './iiProviderLogout';
import { buildLogoutReturnUrl } from './logoutReturnUrl';

interface UseReliableIILogoutResult {
  /** Initiates the logout process */
  logout: () => void;
  /** True while logout is in progress */
  isLoggingOut: boolean;
  /** Error that occurred during logout, if any */
  lastError?: Error;
}

/**
 * Custom hook that orchestrates a reliable Internet Identity logout.
 * 
 * This hook ensures that:
 * 1. Local auth state is cleared first via AuthClient.logout()
 * 2. The app waits for the identity to become unauthenticated
 * 3. Only then does it trigger the full-page provider logout navigation
 * 4. After logout, the user is returned to the app with the caffeineAdminToken hash
 * 
 * This prevents race conditions and ensures the UI properly transitions
 * to the sign-in screen before navigating to the provider logout.
 */
export function useReliableIILogout(): UseReliableIILogoutResult {
  const { clear, identity } = useInternetIdentity();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [lastError, setLastError] = useState<Error | undefined>(undefined);
  const [waitingForClear, setWaitingForClear] = useState(false);

  // Monitor identity changes after initiating logout
  useEffect(() => {
    if (waitingForClear) {
      // Check if identity is now anonymous (logged out)
      const isAnonymous = !identity || identity.getPrincipal().isAnonymous();
      
      if (isAnonymous) {
        // Local logout complete, now perform provider logout
        setWaitingForClear(false);
        
        try {
          performProviderLogout({
            identityProviderUrl: process.env.II_URL,
            returnUrl: buildLogoutReturnUrl()
          });
          // Note: Code after this won't execute because we're navigating away
        } catch (error) {
          setIsLoggingOut(false);
          const errorObj = error instanceof Error 
            ? error 
            : new Error('Failed to initiate logout navigation.');
          setLastError(errorObj);
        }
      }
    }
  }, [identity, waitingForClear]);

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    setLastError(undefined);

    try {
      // Step 1: Clear local auth state
      // This calls AuthClient.logout() which properly ends the session
      clear();
      
      // Step 2: Wait for identity to become anonymous
      // The useEffect above will detect this and proceed with provider logout
      setWaitingForClear(true);
    } catch (error) {
      setIsLoggingOut(false);
      setWaitingForClear(false);
      const errorObj = error instanceof Error 
        ? error 
        : new Error('Failed to clear local auth state.');
      setLastError(errorObj);
    }
  }, [clear]);

  return {
    logout,
    isLoggingOut,
    lastError
  };
}
