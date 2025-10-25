export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.server.config');
  }
}

export const onRequestError = async (err: Error, request: { method: string; url: string }, context: { routerKind: string; routePath?: string }) => {
  // This is called for all errors in your application
  // You can use this to send errors to Sentry
  const { captureException } = await import('@sentry/nextjs');
  captureException(err, {
    tags: {
      route: context.routePath,
      router_kind: context.routerKind,
      method: request.method,
    },
  });
};

