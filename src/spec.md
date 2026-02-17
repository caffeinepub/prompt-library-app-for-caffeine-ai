# Specification

## Summary
**Goal:** Make “+ Add Prompt” reliably save new prompts and their categories so they immediately appear in the UI, persist after refresh, and category filtering works correctly.

**Planned changes:**
- Fix the “+ Add Prompt” Save flow to persist the new prompt to the backend and update in-memory UI state so the prompt appears immediately in the current view/filter after Save completes.
- Ensure Save error handling keeps the dialog open and shows an error toast if the backend call fails (no silent loss).
- Persist categories used/created in the prompt editor so new categories appear under Favorites in the CategoryFilterBar immediately after saving and remain after refresh, without creating duplicates for existing categories.
- Fix CategoryFilterBar click behavior to correctly filter prompts by category and allow opening prompt previews in the currently selected view mode (list/grid/table) without breaking the preview or forcing navigation after Save.

**User-visible outcome:** After creating a prompt (with at least one category) and clicking Save, the prompt and any new category show up right away in the current view; they still exist after refresh/re-authentication; clicking a category filters prompts correctly and prompts open normally in the current view mode.
