# Specification

## Summary
**Goal:** Ensure pasting from Microsoft Word produces clean, readable text across all user-editable text surfaces, while preserving basic structure (line breaks, bullets, numbering, tabs/indentation).

**Planned changes:**
- Add a client-side paste-cleaning utility to strip Word/HTML/CSS junk (e.g., tags, `<style>` blocks, HTML comments) while normalizing whitespace and preserving line breaks and list readability.
- Apply the paste-cleaning behavior to every user-editable text entry surface, including the prompt content editor and standard text inputs (titles, search, category create/rename, and any other editable fields).
- Harden rendering sanitization so that if HTML still enters stored content, Word-specific/unsafe nodes (style/script/head/meta/link and HTML comments) never render as visible text in prompt previews/details while continuing to support allowed basic formatting.

**User-visible outcome:** Pasting content from Microsoft Word anywhere in the app inserts clean text without hidden HTML/CSS/comment blocks, keeps line breaks and list structure readable, and any residual unsafe HTML will not display as raw text in prompt views.
