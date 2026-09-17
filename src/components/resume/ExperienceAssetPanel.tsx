/*
  Ported from App.tsx `ExperienceAssetPanel` (437), `AssetPanelMarker` (493),
  `EducationDetails` (523), `EducationSection` (538) and `AboutStory` (551).

  Structure unchanged: the same header, the same scorecard on planner, intern and
  growth only, the same visual on every tab except education, the same outcome
  line. The bullets list is rendered where the original rendered it.

  Two changes, both required by 08 rather than chosen:

  - The panel is a div rather than an article: an article already exposes a
    role, and role="tabpanel" on top of it is an invalid combination.
  - The panel title is an h2. It sits under the page h1 and was an h3, which
    skipped a level.
  - `inert` replaces the bare `aria-hidden` on inactive panels. The original hid
    them from assistive technology while leaving their links and buttons in the
    tab order, which is the worst of both.
  - Scorecard tone. The original carried a `tone` of blue, green, yellow, red,
    risk or success, rendered as color with no textual counterpart, which is
    status by color alone. The tone prop is retained in the type but no metric
    now sets it, so nothing on this panel carries meaning in color alone. Noted
    in the session report.
*/

import type { ReactNode } from 'react';
import { ABOUT_BODY_SHORT } from '../../data/copy/about';
import VisualDisclosure from './VisualDisclosure';
import { DisclosureVisual } from './AssetVisual';
import {
  CAPABILITY_GROUPS,
  VISUAL_DISCLOSURES,
  EDUCATION_GROUPS,
  isLucidRole,
  type ExperienceAsset,
} from '../../data/experienceAssets';
import LucidWordmark from './LucidWordmark';

function AssetPanelMarker({ asset }: { asset: ExperienceAsset }) {
  if (isLucidRole(asset)) {
    return (
      <span className="asset-company-logo-frame">
        <LucidWordmark className="asset-company-logo" title="Lucid" />
      </span>
    );
  }

  if (asset.id === 'growth' && asset.company) {
    return <p className="asset-label">{asset.company}</p>;
  }

  return null;
}

/*
  02 section 6, "Capability chip group", as a React component so the resume
  island can render it. A bordered container with a 2px left border in the
  category hue and the label at the top in that hue.

  04: the Clubs group is omitted because the list exists in no source document.
*/
function ChipGroup({ label, hue, items }: { label: string; hue: string; items: readonly string[] }) {
  return (
    <section className="chip-group" data-hue={hue}>
      <h3 className="group-label t-label">{label}</h3>
      <ul className="chips">
        {items.map((item) => (
          <li key={item} className="chip t-small">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function EducationDetails() {
  /* Four groups, two by two. 04. */
  return (
    <div className="group-grid education-grid">
      {EDUCATION_GROUPS.map((g) => (
        <ChipGroup key={g.label} label={g.label} hue={g.hue} items={g.items} />
      ))}
    </div>
  );
}

function CapabilityGroups() {
  return (
    <div className="group-grid">
      {CAPABILITY_GROUPS.map((g) => (
        <ChipGroup key={g.label} label={g.label} hue={g.hue} items={g.items} />
      ))}
    </div>
  );
}

/*
  Consecutive groups that share a rail number become one block, which renders
  as one unbroken rail. Groups one and two of the planner share rail 1, so the
  two shorter rails and the gap between them become a single continuous one.
  No word, order or nesting changes; this only decides where the border runs.
*/
function railBlocks<T extends { rail: number }>(groups: readonly T[]): T[][] {
  const blocks: T[][] = [];
  for (const group of groups) {
    const current = blocks[blocks.length - 1];
    if (current && current[0].rail === group.rail) current.push(group);
    else blocks.push([group]);
  }
  return blocks;
}

/* The short body, which is the right one here. /about carries the long one. */
function AboutStory() {
  return (
    <div className="about-story">
      {ABOUT_BODY_SHORT.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

export default function ExperienceAssetPanel({
  asset,
  active,
  panelRef,
  collage,
  onRemeasure,
}: {
  asset: ExperienceAsset;
  active: boolean;
  panelRef?: (node: HTMLElement | null) => void;
  /** Tells the island to remeasure this panel when a disclosure opens. */
  onRemeasure?: () => void;
  /* The /about photo collage, server rendered by Astro and passed in as a
     slot. It stays an Astro component so its images keep the responsive set
     and the intrinsic dimensions that hold CLS at zero; a Preact <img> here
     would lose both. */
  collage?: ReactNode;
}) {

  return (
    <div
      id={`asset-panel-${asset.id}`}
      ref={panelRef}
      className={`asset-panel asset-${asset.id}${active ? ' is-active' : ''}`}
      role="tabpanel"
      aria-labelledby={`asset-tab-${asset.id}`}
      /* React renders `inert` as a bare attribute when true. */
      inert={!active}
    >
      <div className="asset-panel-header">
        <div className="asset-copy">
          <AssetPanelMarker asset={asset} />
          <h2 className="t-h3">{asset.title}</h2>
          {asset.date && <p className="asset-date t-data">{asset.date}</p>}
        </div>

        {/*
          02 section 6 and 08 v2: the stat cards sit at the top of the panel
          beside the role title, not below the body copy.
        */}
        {asset.metrics.length > 0 && (
          <div className="stat-cards" style={{ '--count': asset.metrics.length } as React.CSSProperties}>
            {asset.metrics.map((metric) => (
              <div
                key={`${metric.figure}-${metric.label}`}
                className="stat-card"
                data-hue={metric.hue ?? 'graphite'}
              >
                <p className="figure t-stat">{metric.figure}</p>
                {metric.unit && <p className="unit">{metric.unit}</p>}
                <p className="stat-label t-label">{metric.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="asset-body">
        {asset.id === 'about' ? (
          <AboutStory />
        ) : (
          asset.tagline && <p className="asset-tagline">{asset.tagline}</p>
        )}

        {asset.id === 'education' && <EducationDetails />}
        {asset.id === 'tools' && <CapabilityGroups />}

        {/* Grouped bullets: a bold claim with its sub points nested. 04. */}
        {asset.groups && (
          <ul className="asset-groups">
            {railBlocks(asset.groups).map((block) => {
              const last = block[block.length - 1];
              return (
                <li key={block[0].claim}>
                  {/* The rail itself. Consecutive groups sharing a rail number
                      run inside one unbroken border rather than two. */}
                  <div className="rail">
                    {block.map((group) => (
                      <div className="rail-group" key={group.claim}>
                        <p className="claim">{group.claim}</p>
                        <ul className="points">
                          {group.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                        {/* Inside the rail, on the group it belongs to. 04. */}
                        {group.visual && (
                          <VisualDisclosure
                            label={VISUAL_DISCLOSURES[group.visual]}
                            onToggle={onRemeasure}
                          >
                            <DisclosureVisual id={group.visual} />
                          </VisualDisclosure>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Below the rail, closing the block rather than sitting in
                      it. 04: the ECR readiness dashboard does this. */}
                  {last.closeWith && (
                    <VisualDisclosure
                      label={VISUAL_DISCLOSURES[last.closeWith]}
                      onToggle={onRemeasure}
                    >
                      <DisclosureVisual id={last.closeWith} />
                    </VisualDisclosure>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* 04: Digital Growth carries one disclosure for the whole bullet
            set rather than one per group. */}
        {asset.id === 'growth' && (
          <VisualDisclosure label={VISUAL_DISCLOSURES.growth} onToggle={onRemeasure}>
            <DisclosureVisual id="growth" />
          </VisualDisclosure>
        )}

        {asset.stack && (
          <p className="stack t-data">
            <span className="stack-label t-label">Stack</span> {asset.stack}
          </p>
        )}
      </div>

      {/*
        Nothing is stacked beneath the panel any more. 04 moves the
        responsibility, chart and outcome blocks into disclosures on their own
        bullet groups, and 09 version 3 removes the About portrait in favour of
        the photo carousel below.
      */}
      {asset.id === 'about' && collage && <div className="asset-collage">{collage}</div>}

      {asset.outcome && <p className="asset-outcome">Outcome: {asset.outcome}</p>}
    </div>
  );
}
