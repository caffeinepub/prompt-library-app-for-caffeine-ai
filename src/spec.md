# Specification

## Summary
**Goal:** Fix production prompt saving failures by ensuring the frontend reliably connects to the correct backend canister, surfaces actor/connection errors clearly, and prevents saves until the backend is ready.

**Planned changes:**
- Add explicit backend actor creation state tracking (loading/success/error) and propagate detailed error information to the UI, with structured console logging for production diagnosis.
- Block/disable Save actions in the “+Add Prompt” / prompt editor flow until backend actor/connectivity is confirmed, showing an English “connecting”/retry status instead of allowing a failing save.
- Add a lightweight post-login backend connectivity self-check using the same actor path as saving; show an actionable English error on failure and log details to the console.
- Fix/validate production actor configuration so the frontend always targets the correct backend canister ID/host in live; fail fast with a clear English misconfiguration error if invalid/missing.

**User-visible outcome:** In production, users can add and save prompts without seeing “Not connected to backend” during startup; if the backend can’t be reached or is misconfigured, the app shows a clear, actionable error (and Save is prevented) with diagnostic details logged in the browser console.
