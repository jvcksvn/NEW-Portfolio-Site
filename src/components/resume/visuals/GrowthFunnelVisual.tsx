/*
  Ported from App.tsx `GrowthFunnelVisual` (1103).

  Every figure ports exactly: 1.0M+, 42k, 8.4k, 97%, and the stage widths that
  draw the funnel.

  Dash fixes, mechanical: "Ship-on-demand" and "demand-to-fulfillment" are
  written open. Both are rendered strings the dash check fails on.
*/

import { useState } from 'react';
import JobGraphSection from './JobGraphSection';

const stages = [
  { label: 'Traffic', value: '1.0M+', width: 100, metric: 'Audience scaled into demand signals.' },
  { label: 'Leads', value: '42k', width: 72, metric: 'CRM segments moved into follow up.' },
  { label: 'Orders', value: '8.4k', width: 48, metric: 'Campaign demand became operational volume.' },
  { label: 'Fulfillment', value: '97%', width: 34, metric: 'Ship on demand visibility protected delivery flow.' },
];

export default function GrowthFunnelVisual() {
  const [activeStage, setActiveStage] = useState('Traffic');
  const active = stages.find((stage) => stage.label === activeStage) ?? stages[0];

  return (
    <JobGraphSection
      responsibility="Connected audience growth, CRM signals, supplier workflows, and fulfillment execution into a demand to fulfillment system."
      outcome="Scaled demand signals into measurable order flow and fulfillment execution."
    >
      <div
        className="asset-visual funnel-visual"
        role="group"
        aria-label="Funnel from audience traffic through leads and orders to fulfillment rate"
      >
        <div className="visual-heading">
          <span className="t-label">Growth to fulfillment funnel</span>
          <strong className="t-data">{active.value}</strong>
        </div>

        <div className="funnel-stack">
          {stages.map((stage) => (
            <button
              key={stage.label}
              className={`funnel-stage${stage.label === activeStage ? ' is-active' : ''}`}
              style={{ width: `${stage.width}%` }}
              type="button"
              onClick={() => setActiveStage(stage.label)}
              onPointerEnter={() => setActiveStage(stage.label)}
            >
              <span className="t-label">{stage.label}</span>
              <strong className="t-data">{stage.value}</strong>
            </button>
          ))}
        </div>

        <div className="visual-readout">
          <span className="t-label">{active.label}</span>
          <p>{active.metric}</p>
        </div>
      </div>
    </JobGraphSection>
  );
}
