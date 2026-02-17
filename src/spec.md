# Specification

## Summary
**Goal:** Preserve and consistently display per-prompt rich-text text color formatting after saving and across all prompt views.

**Planned changes:**
- Update the “Add Prompt” rich-text save pipeline to preserve/normalize color markup during HTML sanitization (including browser-generated `<font color="...">` and equivalent inline `style="color: ..."`).
- Ensure all rendering paths (list, preview, and search results) display the stored prompt HTML without re-sanitizing in a way that strips saved text colors, while still sanitizing unsafe HTML.

**User-visible outcome:** After changing text color in “+ Add Prompt” and clicking Save, the prompt retains its colors when re-opened, shown in the list/preview, and when found via search—even after refresh/reload.
