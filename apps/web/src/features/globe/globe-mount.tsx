'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import type { WorldCupStatus } from '@/lib/football/nations';
import { GlobeFallback, GlobeSkeleton } from './globe-fallback';

/**
 * Client-only mount for the WebGL globe: dynamic import (ssr:false — needs window/WebGL),
 * a lightweight loading skeleton, and an error boundary that drops to the static image
 * fallback so the hero can never break.
 */
const WorldCupGlobe = dynamic(() => import('./world-cup-globe').then((m) => m.WorldCupGlobe), {
  ssr: false,
  loading: () => <GlobeSkeleton />,
});

class GlobeErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <GlobeFallback /> : this.props.children;
  }
}

export function GlobeMount({ status }: { status: WorldCupStatus }) {
  return (
    <GlobeErrorBoundary>
      <WorldCupGlobe status={status} />
    </GlobeErrorBoundary>
  );
}
