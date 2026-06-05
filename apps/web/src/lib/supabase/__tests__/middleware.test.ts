import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest, NextResponse } from 'next/server';

// Simulate Supabase refreshing an expiring token: createServerClient is replaced
// so that getUser() emits a new session cookie through the provided setAll adapter,
// exactly as @supabase/ssr does on a real token rotation — without a live backend.
vi.mock('@supabase/ssr', () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        getAll: () => Array<{ name: string; value: string }>;
        setAll: (
          cookies: Array<{ name: string; value: string; options?: unknown }>,
        ) => void;
      };
    },
  ) => ({
    auth: {
      getUser: async () => {
        options.cookies.setAll([
          { name: 'sb-access-token', value: 'refreshed', options: { path: '/' } },
        ]);
        return { data: { user: null }, error: null };
      },
    },
  }),
}));

import { updateSession } from '../middleware';

// Minimal cookie jar mirroring the slice of the NextRequest/NextResponse cookies
// API that updateSession touches (getAll / get / set).
function cookieJar(initial: Array<{ name: string; value: string }> = []) {
  const map = new Map(initial.map((c) => [c.name, c.value]));
  return {
    getAll: () => [...map.entries()].map(([name, value]) => ({ name, value })),
    get: (name: string) =>
      map.has(name) ? { name, value: map.get(name)! } : undefined,
    set: (name: string, value: string) => {
      map.set(name, value);
    },
  };
}

describe('updateSession — cookie propagation (composed next-intl + Supabase middleware)', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
  });

  it('writes a refreshed session cookie onto BOTH the request and the response', async () => {
    const reqJar = cookieJar([{ name: 'sb-access-token', value: 'stale' }]);
    const resJar = cookieJar();
    const request = { cookies: reqJar } as unknown as NextRequest;
    const response = { cookies: resJar } as unknown as NextResponse;

    await updateSession(request, response);

    // Response cookie reaches the browser so the NEXT request is authenticated
    // (this already worked).
    expect(resJar.get('sb-access-token')?.value).toBe('refreshed');
    // Request cookie lets the CURRENT request's Server Components read the fresh
    // session instead of the rotated/expired one — prevents the ~1h "unexpected
    // logout" (D-047). This is the canonical @supabase/ssr contract.
    expect(reqJar.get('sb-access-token')?.value).toBe('refreshed');
  });

  it('is inert without Supabase env (preview-safe): returns the response untouched', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const resJar = cookieJar();
    const request = { cookies: cookieJar() } as unknown as NextRequest;
    const response = { cookies: resJar } as unknown as NextResponse;

    const result = await updateSession(request, response);

    expect(result).toBe(response);
    expect(resJar.get('sb-access-token')).toBeUndefined();
  });
});
