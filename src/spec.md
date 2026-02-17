# Specification

## Summary
**Goal:** Use the uploaded app icon as the browser tab favicon for Prompt Library.

**Planned changes:**
- Add `prompt-library-favicon.png` (and/or derived favicon-sized files) to the frontend’s publicly served static assets so it can be referenced by URL at runtime.
- Replace the existing favicon mechanism (including any base64/utility-driven favicon in `frontend/src/lib/favicon.ts`) so it no longer determines the tab icon.
- Update `frontend/index.html` (and/or pre-render initialization) to include a proper `<link rel="icon" ...>` referencing the new favicon asset, applied on initial page load.

**User-visible outcome:** When the app loads in a browser, the tab shows the new favicon based on the uploaded icon, with no other UI/branding changes.
