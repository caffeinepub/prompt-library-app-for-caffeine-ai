# Specification

## Summary
**Goal:** Persist categories per authenticated user in the backend and ensure they load automatically under “Favorites” on login, with correct create/rename/delete behavior end-to-end.

**Planned changes:**
- Backend: Store categories per authenticated user and return only that user’s categories on list calls; reject anonymous category CRUD consistently.
- Backend: Align category CRUD semantics with frontend identity (category name strings), including rename propagation to all prompts and delete detaching from all prompts.
- Backend: Persist prompts and categories across canister upgrades, including conditional migration if needed.
- Frontend: On successful login, automatically fetch categories from the backend and render them under “Favorites,” with an explicit error state on backend connectivity failure.
- Frontend: Add an always-available “Create category” entry directly below “Favorites,” prevent case-insensitive duplicates with an English message, and persist creation to the backend.
- Frontend: Ensure create/rename/delete category actions invoke backend-backed sync actions and reflect success/failure in English while keeping UI consistent with backend responses.

**User-visible outcome:** After logging in, users immediately see their own saved categories under “Favorites,” can create/rename/delete categories that persist across logout/login and upgrades, and receive clear English feedback on errors (including backend connectivity issues and duplicate category names).
