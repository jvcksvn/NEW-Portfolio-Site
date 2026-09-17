/*
  Ported from App.tsx `EcrProgramRiskTracker` (619) and `CheckCell` (762).

  Every number, part id, date and label is exactly the original's. No figure was
  reconciled: 700 monitored parts, the five part rows and their ETAs all port as
  they are.

  Two status changes, both required by 08 rather than chosen:

  - `CheckCell` rendered a bare "-" for an incomplete gate. That is a rendered
    dash, which the site bans outright, and it is also the weaker half of a pair
    where the other half is a check glyph. It now renders a cross. The aria-label
    it already carried, Complete or Open, is unchanged.
  - The risk tint on a row is now accompanied everywhere by the text badge that
    was already there, and the readout states the word as well as the color.
*/

import { useState } from 'react';

type EcrRisk = 'clear' | 'watch' | 'risk';

const RISK_LABEL: Record<EcrRisk, string> = {
  clear: 'Clear',
  watch: 'Watch',
  risk: 'Risk',
};

function CheckCell({ checked }: { checked: boolean }) {
  return (
    <span
      role="cell"
      className={`check-cell${checked ? ' is-checked' : ''}`}
      aria-label={checked ? 'Complete' : 'Open'}
    >
      {checked ? '✓' : '✕'}
    </span>
  );
}

const parts = [
  { id: 'BIW-47219', program: 'Running Change', eta: 'Aug 18', bomTiming: 'Aug 25', saSetup: true, ppap: true, coordination: true, risk: 'clear' as EcrRisk },
  { id: 'GA-58304', program: 'PV1', eta: 'Aug 21', bomTiming: 'Aug 28', saSetup: true, ppap: false, coordination: true, risk: 'watch' as EcrRisk },
  { id: 'PWR-74062', program: 'PV2', eta: 'Aug 28', bomTiming: 'Sep 04', saSetup: false, ppap: false, coordination: true, risk: 'risk' as EcrRisk },
  { id: 'INT-19638', program: 'SOP', eta: 'Sep 02', bomTiming: 'Sep 09', saSetup: true, ppap: true, coordination: false, risk: 'watch' as EcrRisk },
  { id: 'CHS-82047', program: 'MY27', eta: 'Aug 19', bomTiming: 'Aug 26', saSetup: true, ppap: true, coordination: true, risk: 'clear' as EcrRisk },
];

export default function EcrProgramRiskTracker() {
  const [programFilter, setProgramFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState<'all' | EcrRisk>('all');
  const [ppapFilter, setPpapFilter] = useState('all');
  const [activePart, setActivePart] = useState('BIW-47219');

  const filteredParts = parts.filter((part) => {
    const programMatch = programFilter === 'all' || part.program === programFilter;
    const riskMatch = riskFilter === 'all' || part.risk === riskFilter;
    const ppapMatch =
      ppapFilter === 'all' || (ppapFilter === 'complete' ? part.ppap : !part.ppap);
    return programMatch && riskMatch && ppapMatch;
  });

  const selected = parts.find((part) => part.id === activePart) ?? parts[0];
  const visibleParts = filteredParts.length > 0 ? filteredParts : parts;

  return (
    <div
      className="asset-visual ecr-visual"
      role="group"
      aria-label="Engineering change risk tracker across part effectivity, supplier coordination, scheduling agreement setup and PPAP"
    >
      <div className="visual-heading">
        <span className="t-label">ECR and program risk tracker</span>
        <strong className="t-data">700 monitored parts</strong>
      </div>

      <div className="ecr-filters">
        <label>
          <span className="t-label">Program</span>
          <select
            value={programFilter}
            onChange={(event) => setProgramFilter((event.target as HTMLSelectElement).value)}
          >
            <option value="all">All</option>
            <option value="Running Change">Running Change</option>
            <option value="PV1">PV1</option>
            <option value="PV2">PV2</option>
            <option value="SOP">SOP</option>
            <option value="MY27">MY27</option>
          </select>
        </label>
        <label>
          <span className="t-label">Risk status</span>
          <select
            value={riskFilter}
            onChange={(event) =>
              setRiskFilter((event.target as HTMLSelectElement).value as 'all' | EcrRisk)
            }
          >
            <option value="all">All</option>
            <option value="clear">Clear</option>
            <option value="watch">Watch</option>
            <option value="risk">Risk</option>
          </select>
        </label>
        <label>
          <span className="t-label">PPAP status</span>
          <select
            value={ppapFilter}
            onChange={(event) => setPpapFilter((event.target as HTMLSelectElement).value)}
          >
            <option value="all">All</option>
            <option value="complete">Complete</option>
            <option value="open">Open</option>
          </select>
        </label>
      </div>

      {/* tabindex so a keyboard user can scroll the overflow region. */}
      <div className="ecr-table-scroll" tabIndex={0} role="region" aria-label="ECR risk table, scrolls horizontally">
        <div className="ecr-table" role="table" aria-label="ECR program risk table">
          <div className="ecr-header" role="row">
            <span role="columnheader">Part</span>
            <span role="columnheader">Program</span>
            <span role="columnheader">New shipment ETA</span>
            <span role="columnheader">BOM effectivity timing</span>
            <span role="columnheader">Coordination</span>
            <span role="columnheader">Scheduling agreement</span>
            <span role="columnheader">PPAP</span>
            <span role="columnheader">Risk status</span>
          </div>

          {visibleParts.map((part) => (
            <div
              key={part.id}
              className={`ecr-row risk-${part.risk}${part.id === activePart ? ' is-active' : ''}`}
              /*
                A div, not a button. role="row" is the original's and the table
                needs it, but a button cannot carry that role: axe flags the
                pair as invalid. The div keeps the row semantics and takes the
                keyboard activation a button gave for free.
              */
              role="row"
              tabIndex={0}
              aria-selected={part.id === activePart}
              onClick={() => setActivePart(part.id)}
              onPointerEnter={() => setActivePart(part.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActivePart(part.id);
                }
              }}
            >
              <span role="cell">{part.id}</span>
              <span role="cell">{part.program}</span>
              <span role="cell">{part.eta}</span>
              <span role="cell">{part.bomTiming}</span>
              <CheckCell checked={part.coordination} />
              <CheckCell checked={part.saSetup} />
              <CheckCell checked={part.ppap} />
              <strong role="cell" className={`risk-badge risk-${part.risk}`}>{RISK_LABEL[part.risk]}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className={`visual-readout ecr-readout risk-${selected.risk}`}>
        <span className="t-label">{RISK_LABEL[selected.risk]}</span>
        <p>
          {selected.id} links ECR timing, supplier status, PPAP readiness, and shipment ETA into one
          launch risk view.
        </p>
      </div>
    </div>
  );
}
