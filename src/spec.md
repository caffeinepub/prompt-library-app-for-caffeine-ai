# Specification

## Summary
**Goal:** Allow users to rename and delete categories directly from the category badges list shown below the “Favorites” control.

**Planned changes:**
- Add per-category rename and delete actions within the filter bar category badges area (below “Favorites”).
- Implement category rename (name-only): update the categories list and update all prompts that reference the old category name to use the new name.
- Implement category delete: remove the category from backend storage and categories list, and detach it from all prompts (without deleting prompts).
- Ensure the UI handles active filter state cleanly when a selected category is renamed or deleted (update selection or clear it).

**User-visible outcome:** Users can rename or delete any category directly from the category badges under “Favorites”; renames and deletions are reflected everywhere immediately, and prompts are preserved with categories updated/removed accordingly.
