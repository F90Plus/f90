'use client';

import Globe, { type GlobeMethods } from 'react-globe.gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { WorldCupStatus } from '@/lib/football/nations';

/**
 * WorldCupGlobe — the real 3D hero globe (react-globe.gl / three-globe).
 *
 * A living official map of WC2026: dark Earth Night + defined country polygons, gold
 * hosts (the instant focal point) + green officially-qualified nations + neutral rest
 * (states from verified real data — DECISIONS D-023). Cinematic atmosphere, slow
 * auto-rotate, bounded zoom/drag, reduced-motion safe, paused off-screen. Assets are
 * vendored locally (no runtime CDN). Loaded client-only via GlobeMount (ssr:false).
 */

const TEXTURE = '/globe/earth-night.jpg';
const BUMP = '/globe/earth-topology.png';
const GEOJSON = '/globe/countries-110m.geojson';

const HOST_LABELS = [
  { lat: 39.5, lng: -98.35, key: 'usa' },
  { lat: 56.1, lng: -106.3, key: 'canada' },
  { lat: 23.6, lng: -102.5, key: 'mexico' },
] as const;

interface Feat {
  properties: { ADMIN?: string; NAME?: string };
}
interface HostLabel {
  lat: number;
  lng: number;
  key: string;
}
interface NationPoint {
  lat: number;
  lng: number;
  name: string;
}

const adminOf = (f: object) => {
  const p = (f as Feat).properties;
  return p.ADMIN ?? p.NAME ?? '';
};

export function WorldCupGlobe({ status }: { status: WorldCupStatus }) {
  const t = useTranslations('globe');
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);

  const [size, setSize] = useState(0);
  const [polygons, setPolygons] = useState<Feat[]>([]);

  const hosts = useMemo(() => new Set(status.hostAdmins), [status.hostAdmins]);
  const qualified = useMemo(() => new Set(status.qualifiedAdmins), [status.qualifiedAdmins]);

  // Size the globe to its (square) container.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize(el.clientWidth));
    ro.observe(el);
    setSize(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Respect reduced motion.
  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Load the vendored country polygons.
  useEffect(() => {
    let active = true;
    fetch(GEOJSON)
      .then((r) => r.json())
      .then((geo: { features: Feat[] }) => {
        if (active) setPolygons(geo.features.filter((d) => d.properties.ADMIN !== 'Antarctica'));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Pause rendering when the globe scrolls off-screen (perf).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const g = globeEl.current;
        if (!g) return;
        if (entries[0]?.isIntersecting) g.resumeAnimation();
        else g.pauseAnimation();
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const capColor = useCallback(
    (f: object) => {
      const a = adminOf(f);
      if (hosts.has(a)) return 'rgba(245,166,35,0.46)';
      if (qualified.has(a)) return 'rgba(47,230,160,0.30)';
      return 'rgba(40,72,132,0.05)';
    },
    [hosts, qualified],
  );
  const strokeColor = useCallback(
    (f: object) => {
      const a = adminOf(f);
      if (hosts.has(a)) return 'rgba(255,205,100,0.98)';
      if (qualified.has(a)) return 'rgba(47,230,160,0.80)';
      return 'rgba(134,171,255,0.14)';
    },
    [hosts, qualified],
  );
  const altitude = useCallback(
    (f: object) => {
      const a = adminOf(f);
      if (hosts.has(a)) return 0.02;
      if (qualified.has(a)) return 0.01;
      return 0.002;
    },
    [hosts, qualified],
  );
  const label = useCallback(
    (f: object) => {
      const a = adminOf(f);
      if (hosts.has(a))
        return `<b style="font-family:'Space Grotesk',sans-serif;color:#ffdc8c">${a} · ${t('hostBadge')}</b>`;
      if (qualified.has(a))
        return `<b style="font-family:'Space Grotesk',sans-serif;color:#2fe6a0">${a} · ${t('qualifiedBadge')}</b>`;
      return `<span style="font-family:'Space Grotesk',sans-serif;color:#aab5d4">${a}</span>`;
    },
    [hosts, qualified, t],
  );

  const handleReady = useCallback(() => {
    const g = globeEl.current;
    if (!g) return;
    // Cap device pixel ratio — premium look without over-rendering on retina/mobile.
    const renderer = g.renderer() as { setPixelRatio?: (n: number) => void };
    renderer.setPixelRatio?.(Math.min(window.devicePixelRatio || 1, 1.6));
    g.pointOfView({ lat: 30, lng: -96, altitude: 2.4 }, 0);
    const c = g.controls() as {
      autoRotate: boolean;
      autoRotateSpeed: number;
      enableZoom: boolean;
      enablePan: boolean;
      minDistance: number;
      maxDistance: number;
    };
    c.autoRotate = !reducedMotion.current;
    c.autoRotateSpeed = 0.45;
    c.enableZoom = true;
    c.enablePan = false;
    c.minDistance = 200;
    c.maxDistance = 520;
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-square w-full max-w-[540px]"
      role="img"
      aria-label={t('a11y')}
    >
      {size > 0 && (
        <Globe
          ref={globeEl}
          width={size}
          height={size}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={TEXTURE}
          bumpImageUrl={BUMP}
          showAtmosphere
          atmosphereColor="#6aa0ff"
          atmosphereAltitude={0.26}
          polygonsData={polygons}
          polygonCapColor={capColor}
          polygonSideColor={() => 'rgba(10,18,38,0.4)'}
          polygonStrokeColor={strokeColor}
          polygonAltitude={altitude}
          polygonLabel={label}
          polygonsTransitionDuration={0}
          labelsData={HOST_LABELS as unknown as object[]}
          labelLat={(d: object) => (d as HostLabel).lat}
          labelLng={(d: object) => (d as HostLabel).lng}
          labelText={(d: object) => t(`hosts.${(d as HostLabel).key}`)}
          labelColor={() => 'rgba(255,223,150,0.96)'}
          labelSize={1.15}
          labelDotRadius={0.42}
          labelResolution={2}
          labelAltitude={0.022}
          pointsData={status.qualifiedPoints as unknown as object[]}
          pointLat={(d: object) => (d as NationPoint).lat}
          pointLng={(d: object) => (d as NationPoint).lng}
          pointColor={() => 'rgba(47,230,160,0.95)'}
          pointAltitude={0.012}
          pointRadius={0.45}
          onGlobeReady={handleReady}
        />
      )}
    </div>
  );
}
