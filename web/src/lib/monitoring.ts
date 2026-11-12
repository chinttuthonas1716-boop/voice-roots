/**
 * Production Frontend Monitoring & Error Tracking Utility (Task T3.4).
 *
 * Provides:
 * - Centralized client error reporting with graceful fallbacks.
 * - Correlation ID injection for end-to-end request tracing.
 * - Safe client-side diagnostics and telemetry logging.
 */

export interface ErrorReportContext {
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Generate a unique correlation request ID for distributed tracing.
 */
export function generateRequestId(): string {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36);
  return `req_client_${timePart}_${randomPart}`;
}

/**
 * Attach an X-Request-ID correlation header to outgoing fetch requests.
 */
export function attachTracingHeaders(existingHeaders: HeadersInit = {}): Record<string, string> {
  const headers = new Headers(existingHeaders);
  if (!headers.has("X-Request-ID")) {
    headers.set("X-Request-ID", generateRequestId());
  }

  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Report an application runtime error to observability sinks.
 */
export function reportClientError(
  error: unknown,
  context: ErrorReportContext = {}
): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const payload = {
    timestamp,
    level: "ERROR",
    message: errorMessage,
    stack: errorStack,
    component: context.component || "unknown",
    action: context.action || "unknown",
    url: typeof window !== "undefined" ? window.location.href : "server",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    metadata: context.metadata || {},
  };

  // Safe developer console logging in development/production
  if (process.env.NODE_ENV !== "test") {
    console.error("[VoiceRoots:Monitoring]", JSON.stringify(payload));
  }

  // If Sentry browser SDK is loaded globally or configured, forward it
  if (typeof window !== "undefined" && (window as unknown as { Sentry?: { captureException: (e: unknown, extra: unknown) => void } }).Sentry) {
    try {
      (window as unknown as { Sentry: { captureException: (e: unknown, extra: unknown) => void } }).Sentry.captureException(error, {
        extra: payload,
      });
    } catch {
      // Ignore APM delivery failures to avoid cascading UI errors
    }
  }
}
