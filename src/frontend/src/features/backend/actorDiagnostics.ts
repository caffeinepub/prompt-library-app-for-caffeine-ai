/**
 * Diagnostic utilities for backend actor creation and connectivity issues.
 * Provides structured logging to help diagnose production connection failures.
 */

interface DiagnosticContext {
  phase: 'initialization' | 'actor-creation' | 'connectivity-check' | 'operation';
  isAuthenticated: boolean;
  principal?: string;
  error: Error | unknown;
  additionalContext?: Record<string, unknown>;
}

/**
 * Log structured diagnostic information for backend connectivity issues.
 * This helps diagnose production-only failures by capturing relevant context.
 */
export function logBackendDiagnostic(context: DiagnosticContext): void {
  const timestamp = new Date().toISOString();
  const errorMessage = context.error instanceof Error ? context.error.message : String(context.error);
  const errorStack = context.error instanceof Error ? context.error.stack : undefined;

  const diagnostic = {
    timestamp,
    phase: context.phase,
    environment: {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent,
    },
    authentication: {
      isAuthenticated: context.isAuthenticated,
      principal: context.principal || 'anonymous',
    },
    error: {
      message: errorMessage,
      stack: errorStack,
    },
    additionalContext: context.additionalContext || {},
  };

  console.error('[Backend Diagnostic]', diagnostic);
}

/**
 * Log configuration/misconfiguration failures with clear guidance.
 */
export function logConfigurationError(error: Error | unknown, context?: Record<string, unknown>): void {
  const diagnostic = {
    timestamp: new Date().toISOString(),
    phase: 'configuration',
    error: {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    context: context || {},
    guidance: 'Check that env.json exists and contains valid canister IDs. Rebuild the application if necessary.',
  };

  console.error('[Configuration Error]', diagnostic);
}
