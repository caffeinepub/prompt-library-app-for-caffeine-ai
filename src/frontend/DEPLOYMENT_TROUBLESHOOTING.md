# Deployment Troubleshooting Guide

## Purpose
This document helps capture detailed information when a deployment fails, enabling faster diagnosis and resolution.

## When a Deployment Fails

If you encounter a generic "Deployment error" message, gather the following information:

### 1. Identify the Failing Step
Determine which phase of the deployment process failed:
- **Install**: Dependency installation (`npm install` or `pnpm install`)
- **Build**: Application build process (`npm run build` or `vite build`)
- **Test**: Test execution (if applicable)
- **Deploy**: Deployment to hosting platform

### 2. Capture the Full Error Output
Retrieve the complete error message and log output from the deployment system:
- Full error stack trace
- Any warning messages preceding the error
- Build tool output (Vite, TypeScript compiler, etc.)
- Dependency resolution messages

### 3. Check Common Issues
Before escalating, verify:
- All imports reference existing files with correct paths
- No circular dependencies exist
- TypeScript types are correctly defined and imported
- All required environment variables are set
- Package versions are compatible

### 4. Where to Find Logs
Depending on your deployment platform:
- **Caffeine Editor**: Check the build output panel or console
- **CI/CD Systems**: Review the pipeline logs for the failed job
- **Local Development**: Run `npm run build` to reproduce the error locally

### 5. Information to Include in Follow-up
When reporting a deployment failure, include:
- Exact failing step name (e.g., "Build failed during TypeScript compilation")
- Complete error message and stack trace
- Timestamp of the failed deployment
- Any recent changes made before the failure
- Browser console errors (if applicable to runtime issues)

## Quick Fixes

### TypeScript Errors
- Run `npm run typescript-check` locally to catch type errors
- Ensure all imports use correct paths and file extensions

### Build Errors
- Clear build cache: `rm -rf dist node_modules/.vite`
- Reinstall dependencies: `pnpm install`
- Check for syntax errors in recently modified files

### Runtime Errors
- Check browser console for client-side errors
- Verify all required providers are properly wrapped around components
- Ensure hooks are called at the top level of components
