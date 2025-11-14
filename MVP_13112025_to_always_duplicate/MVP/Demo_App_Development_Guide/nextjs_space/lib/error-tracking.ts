import * as Sentry from '@sentry/nextjs';

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

export function setUserContext(userId: string, email?: string, name?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username: name,
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    captureError(error as Error, { context: errorMessage });
    throw error;
  }
}
