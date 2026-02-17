/**
 * Utility to perform a full-page Internet Identity provider logout.
 * This forces the browser to navigate to the II logout endpoint,
 * ensuring the provider session is completely terminated.
 */

const DEFAULT_II_URL = 'https://identity.ic0.app';
const BLOCKED_DOMAINS = ['id.ai'];

interface LogoutOptions {
  /** The Internet Identity provider URL (defaults to production II) */
  identityProviderUrl?: string;
  /** The URL to return to after logout completes (may include hash fragment) */
  returnUrl?: string;
}

/**
 * Validates and normalizes the Internet Identity provider URL.
 * Returns a safe default if the URL is invalid or blocked.
 */
function validateAndNormalizeProviderUrl(url?: string): string {
  // If no URL provided, use default
  if (!url || url.trim() === '') {
    return DEFAULT_II_URL;
  }

  try {
    const parsedUrl = new URL(url);
    
    // Check if the domain is in the blocked list
    const hostname = parsedUrl.hostname.toLowerCase();
    for (const blockedDomain of BLOCKED_DOMAINS) {
      if (hostname === blockedDomain || hostname.endsWith(`.${blockedDomain}`)) {
        console.warn(`Blocked identity provider domain: ${hostname}. Using default: ${DEFAULT_II_URL}`);
        return DEFAULT_II_URL;
      }
    }
    
    // Return the origin (protocol + hostname + port)
    return parsedUrl.origin;
  } catch (error) {
    console.warn(`Invalid identity provider URL: ${url}. Using default: ${DEFAULT_II_URL}`);
    return DEFAULT_II_URL;
  }
}

/**
 * Constructs the Internet Identity logout URL with return-to parameter.
 * Preserves hash fragments in the return URL when explicitly provided.
 */
function buildLogoutUrl(options: LogoutOptions = {}): string {
  const {
    identityProviderUrl,
    returnUrl = window.location.origin
  } = options;

  // Validate and normalize the provider URL
  const safeProviderUrl = validateAndNormalizeProviderUrl(identityProviderUrl);
  
  try {
    // Preserve the full return URL including hash if provided
    // Only strip login/authorization hashes, not admin tokens or other required hashes
    let cleanReturnUrl = returnUrl;
    
    // Remove only login-related hash fragments that could trigger unwanted flows
    if (returnUrl.includes('#authorize') || returnUrl.includes('#login')) {
      cleanReturnUrl = returnUrl.split('#')[0];
    }
    
    // Construct logout endpoint with return URL
    // Format: https://identity.ic0.app/?action=logout&returnTo=<app-url-with-hash>
    const logoutUrl = new URL(safeProviderUrl);
    logoutUrl.searchParams.set('action', 'logout');
    logoutUrl.searchParams.set('returnTo', cleanReturnUrl);
    
    return logoutUrl.toString();
  } catch (error) {
    throw new Error('Failed to construct logout URL. Invalid Internet Identity provider URL.');
  }
}

/**
 * Performs a full-page navigation to the Internet Identity logout endpoint.
 * This will leave the current app and navigate to II, then return after logout.
 * 
 * @throws Error if the logout URL cannot be constructed or navigation fails
 */
export function performProviderLogout(options: LogoutOptions = {}): void {
  try {
    const logoutUrl = buildLogoutUrl(options);
    
    // Set a flag in sessionStorage to track that we initiated logout
    sessionStorage.setItem('ii_logout_pending', 'true');
    
    // Perform the navigation - this will leave the app
    window.location.href = logoutUrl;
  } catch (error) {
    // Clear the pending flag if navigation fails
    sessionStorage.removeItem('ii_logout_pending');
    throw error instanceof Error 
      ? error 
      : new Error('Failed to perform provider logout navigation.');
  }
}

/**
 * Checks if we just returned from a provider logout and clears the flag.
 * Returns true if we were in the middle of a logout flow.
 */
export function checkAndClearLogoutPending(): boolean {
  const pending = sessionStorage.getItem('ii_logout_pending') === 'true';
  if (pending) {
    sessionStorage.removeItem('ii_logout_pending');
  }
  return pending;
}
