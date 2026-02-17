/**
 * Constructs the post-logout return URL with the required caffeineAdminToken hash.
 * This ensures users are returned to the app with the admin token after logging out.
 */

/**
 * Builds the full return URL including the caffeineAdminToken hash fragment.
 * @returns The complete URL with hash that Internet Identity should redirect to after logout
 */
export function buildLogoutReturnUrl(): string {
  // Return the exact URL required for post-logout redirect
  return 'https://superior-blue-khg-draft.caffeine.xyz/#caffeineAdminToken=e8ad01e38c1ad73a33f29a2a304b0677f1ed0da01c7d2ea7cae59797947549db';
}
