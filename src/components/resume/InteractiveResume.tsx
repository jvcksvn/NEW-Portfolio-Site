/*
  The interactive resume tab shell. Ported from App.tsx `ExperienceAssets` (275).

  Faithful replica. Structure and behavior are unchanged: the same tab rail with
  Prev and Next arrows, the same animated viewport height driven by a
  ResizeObserver on the active panel, the same touch swipe threshold of 48px, the
  same dot indicators, the same fixed tab order, the same scrollIntoView on tab
  change. Only colors, type, spacing, borders and shadows were restyled.

  Four things were added, all of them things 08 asks the port to fix rather than
  preserve:

  1. Arrow key handling on the tab rail. The original had role="tablist" and
     role="tab" but no keyboard handler, so the rail was mouse only.
  2. Roving tabindex, which the tablist pattern requires and the original lacked.
  3. `inert` on inactive panels. The original set aria-hidden on panels whose
     links and buttons were still keyboard reachable, which is worse than not
     setting it.
  4. The animated height snaps under prefers-reduced-motion.
*/

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  assetAccentTokens,
  experienceAssets,
  experienceOrder,
  getAssetTabTitleLines,
  isLucidRole,
  type ExperienceAssetId,
} from '../../data/experienceAssets';
import type { ReactNode } from 'react';
import ExperienceAssetPanel from './ExperienceAssetPanel';
import LucidWordmark from './LucidWordmark';

const SWIPE_THRESHOLD = 48;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function InteractiveResume({ collage }: { collage?: ReactNode }) {
  const [activeId, setActiveId] = useState<ExperienceAssetId>('planner');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  /*
    Bumped when a visual disclosure opens or closes. The panel height is
    animated from a measured value, so without a remeasure an opening
    disclosure is clipped. 04 requires this explicitly.
  */
  const [remeasureTick, setRemeasureTick] = useState(0);

  const activePanelRef = useRef<HTMLElement | null>(null);
  const tabRailRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Partial<Record<ExperienceAssetId, HTMLButtonElement | null>>>({});

  const activeIndex = experienceOrder.indexOf(activeId);

  /* Server rendered markup carries no measured height, so the first paint uses
     the CSS min-height and nothing shifts when the measurement arrives. */
  useEffect(() => setMounted(true), []);

  /*
    Scroll the rail on a tab change, never on mount. scrollIntoView also sets
    Chromium's sequential focus navigation starting point, so running it at
    mount put the first Tab inside the island and made the skip link and the
    whole nav unreachable on /resume, where the island hydrates on load.
  */
  const railSettled = useRef(false);

  useEffect(() => {
    if (!mounted) return;
    if (!railSettled.current) {
      railSettled.current = true;
      return;
    }
    tabRefs.current[activeId]?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeId, mounted]);

  useLayoutEffect(() => {
    const panel = activePanelRef.current;
    if (!panel) return;

    const syncHeight = () => setViewportHeight(panel.offsetHeight);

    syncHeight();
    const frame = window.requestAnimationFrame(syncHeight);
    const observer = new ResizeObserver(syncHeight);
    observer.observe(panel);
    window.addEventListener('resize', syncHeight);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', syncHeight);
    };
  }, [activeId, remeasureTick]);

  const requestRemeasure = useCallback(() => setRemeasureTick((tick) => tick + 1), []);

  const moveAsset = useCallback((direction: -1 | 1) => {
    setActiveId((current) => {
      const index = experienceOrder.indexOf(current);
      const next = Math.min(experienceOrder.length - 1, Math.max(0, index + direction));
      return experienceOrder[next];
    });
  }, []);

  const finishSwipe = (clientX: number) => {
    if (touchStart === null) return;
    const delta = touchStart - clientX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) moveAsset(delta > 0 ? 1 : -1);
    setTouchStart(null);
  };

  const slideTabRail = (direction: -1 | 1) => {
    moveAsset(direction);
    const rail = tabRailRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * (rail.clientWidth / 3 + 14),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  /* Added by the port. The tablist keyboard contract. */
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: activeIndex + 1,
      ArrowLeft: activeIndex - 1,
      Home: 0,
      End: experienceOrder.length - 1,
    };

    const target = keys[event.key];
    if (target === undefined) return;

    event.preventDefault();
    const next = experienceOrder[Math.min(experienceOrder.length - 1, Math.max(0, target))];
    setActiveId(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      className="asset-os-shell"
      data-active={activeId}
      style={{ '--asset-accent': assetAccentTokens[activeId] } as React.CSSProperties}
    >
      <div className="asset-tab-carousel">
        <button
          className="asset-tab-arrow"
          type="button"
          onClick={() => slideTabRail(-1)}
          disabled={activeIndex === 0}
          aria-label="Previous resume tab"
        >
          Prev
        </button>

        <div
          ref={tabRailRef}
          className="asset-tabs"
          role="tablist"
          aria-label="Interactive resume tabs"
        >
          {experienceOrder.map((id) => {
            const asset = experienceAssets[id];
            const isActive = id === activeId;

            return (
              <button
                key={asset.id}
                ref={(node) => {
                  tabRefs.current[asset.id] = node;
                }}
                id={`asset-tab-${asset.id}`}
                className={`asset-tab${isActive ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-controls={`asset-panel-${asset.id}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveId(asset.id)}
                onKeyDown={onTabKeyDown}
                style={{ '--tab-accent': assetAccentTokens[asset.id] } as React.CSSProperties}
              >
                <span className="asset-tab-title">
                  {getAssetTabTitleLines(asset).map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
                {isLucidRole(asset) ? (
                  <span className="asset-tab-logo-frame">
                    <LucidWordmark className="asset-tab-logo" title="Lucid" />
                  </span>
                ) : (
                  asset.company && <span className="asset-tab-company">{asset.company}</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          className="asset-tab-arrow"
          type="button"
          onClick={() => slideTabRail(1)}
          disabled={activeIndex === experienceOrder.length - 1}
          aria-label="Next resume tab"
        >
          Next
        </button>
      </div>

      <div
        className="asset-viewport"
        style={mounted && viewportHeight ? { height: viewportHeight } : undefined}
        onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0].clientX)}
      >
        <div className="asset-track">
          {experienceOrder.map((id) => (
            <ExperienceAssetPanel
              key={id}
              asset={experienceAssets[id]}
              active={id === activeId}
              collage={collage}
              onRemeasure={requestRemeasure}
              panelRef={
                id === activeId
                  ? (node) => {
                      activePanelRef.current = node;
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      <div className="asset-controls">
        <button
          type="button"
          onClick={() => moveAsset(-1)}
          disabled={activeIndex === 0}
          aria-label="Previous experience asset"
        >
          Prev
        </button>
        <div className="asset-dots" aria-hidden="true">
          {experienceOrder.map((id) => (
            <span key={id} className={id === activeId ? 'is-active' : ''} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => moveAsset(1)}
          disabled={activeIndex === experienceOrder.length - 1}
          aria-label="Next experience asset"
        >
          Next
        </button>
      </div>
    </div>
  );
}
