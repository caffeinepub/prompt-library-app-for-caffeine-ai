# Specification

## Summary
**Goal:** Persist prompts (including rich-text HTML colors) per authenticated user in the backend, preserve Word-pasted color formatting, and set the uploaded icon as the app favicon.

**Planned changes:**
- Add backend (single Motoko actor) storage and CRUD methods for prompts and categories/metadata, scoped to the caller’s Internet Identity principal and blocked for anonymous users.
- Store and return prompt rich-text content as sanitized HTML while preserving allowed inline color styling so saved prompts round-trip without color resets.
- Update frontend data flow to load prompts/categories from the backend after login and persist all prompt edits (create/edit/delete/duplicate/favorite) to the backend; stop treating localStorage as the source of truth once backend persistence is enabled.
- Fix rich-text editor paste behavior to prefer clipboard HTML (when available, e.g., from Microsoft Word) and sanitize it into the app’s allowed subset while preserving supported color styling.
- Replace the app’s favicon with the uploaded icon by referencing generated 16x16 and 32x32 PNG favicon assets in the HTML.

**User-visible outcome:** After logging in, users can paste colored rich text (including from Word), save prompts, refresh/search later, and see the same text colors preserved; the browser tab shows the new uploaded favicon.
