/*
  Ported from App.tsx `ClearToBuildRunoutTracker` (770).

  Every number ports exactly: the five month part states, the 1000 unit safety
  stock threshold, the 0 to 5000 chart scale, the note dates and their copy. The
  chart geometry constants and the point() projection are the original's.

  Status change required by 08: the five timeline notes carried a tone of good,
  watch or risk that rendered as color with no textual counterpart. Each note now
  states its status in text alongside the color. Nothing else changed.
*/

import { useState } from 'react';

type Tone = 'good' | 'watch' | 'risk';

const TONE_LABEL: Record<Tone, string> = {
  good: 'On plan',
  watch: 'Watch',
  risk: 'Risk',
};

const partStates = [
  { month: 'Jan', inHouse: 2500, crossdock: 1500, asn: 300, demand: 1530 },
  { month: 'Feb', inHouse: 1790, crossdock: 880, asn: 100, demand: 1195 },
  { month: 'Mar', inHouse: 1230, crossdock: 345, asn: 0, demand: 540 },
  { month: 'Apr', inHouse: 815, crossdock: 220, asn: 0, demand: 585 },
  { month: 'May', inHouse: 450, crossdock: 0, asn: 0, demand: 500 },
];

const notes: Array<{
  date: string;
  label: string;
  detail?: string;
  index: number;
  tone: Tone;
}> = [
  { date: '01/15', label: 'Supplier raw material purchase', index: 0, tone: 'good' },
  { date: '02/10', label: 'Material quality test', detail: 'Coordinated with new software, requires reflash', index: 1, tone: 'good' },
  { date: '03/01', label: 'Material ready at supplier', detail: 'Sea ETA 04/30, air ETA 03/22', index: 2, tone: 'watch' },
  { date: '04/12', label: 'Inventory below safety stock threshold', index: 3, tone: 'risk' },
  { date: '05/12', label: 'Line down risk', detail: 'Affects PWT inverter line 2V', index: 4, tone: 'risk' },
];

const THRESHOLD = 1000;
const chart = { minValue: 0, maxValue: 5000, left: 8, right: 92, top: 14, bottom: 72 };

export default function ClearToBuildRunoutTracker() {
  const [activeIndex, setActiveIndex] = useState(2);

  const data = partStates.map((state) => ({
    label: state.month,
    demand: state.demand,
    inventory: state.inHouse + state.crossdock + state.asn,
  }));

  const point = (index: number, value: number) => {
    const x = chart.left + (index / (data.length - 1)) * (chart.right - chart.left);
    const y =
      chart.bottom -
      ((value - chart.minValue) / (chart.maxValue - chart.minValue)) * (chart.bottom - chart.top);
    return { x, y };
  };

  const demandPoints = data.map((item, index) => point(index, item.demand));
  const inventoryPoints = data.map((item, index) => point(index, item.inventory));
  const thresholdY = point(0, THRESHOLD).y;
  const yTicks = [5000, 4000, 3000, 2000, 1000, 0];
  const selected = data[activeIndex];
  const selectedState = partStates[activeIndex];

  return (
    <div
      className="asset-visual runout-visual"
      role="group"
      aria-label="Clear to build runout tracker comparing projected demand against available inventory over five months, with a safety stock threshold"
    >
      <div className="visual-heading">
        <span className="t-label">Clear to build runout tracker</span>
        <strong className="t-data">{selected.label} view</strong>
      </div>

      <div className="runout-dashboard">
        <div className="runout-chart-column">
          <svg
            className="production-runout-chart"
            viewBox="0 0 100 94"
            role="img"
            aria-label="Line chart of projected demand and available inventory across five months against a safety stock threshold of 1000 units"
          >
            <path className="chart-grid" d={yTicks.map((value) => `M8 ${point(0, value).y}H92`).join('')} />
            <path className="chart-axis" d="M8 12V72H94" />
            {yTicks.map((value) => (
              <text key={value} className="axis-label" x="4.5" y={point(0, value).y + 1}>
                {value === 0 ? '0' : `${value / 1000}k`}
              </text>
            ))}
            <polyline
              className="runout-line demand-line"
              points={demandPoints.map((item) => `${item.x},${item.y}`).join(' ')}
            />
            <polyline
              className="runout-line inventory-line"
              points={inventoryPoints.map((item) => `${item.x},${item.y}`).join(' ')}
            />
            <path className="threshold-line" d={`M8 ${thresholdY}H92`} />
            {inventoryPoints.map((item, index) => {
              const atRisk = data[index].inventory <= THRESHOLD;
              return (
                <g
                  key={data[index].label}
                  className={`runout-point${index === activeIndex ? ' is-active' : ''}${atRisk ? ' is-risk' : ''}`}
                  onClick={() => setActiveIndex(index)}
                  onPointerEnter={() => setActiveIndex(index)}
                >
                  <circle cx={item.x} cy={item.y} r={atRisk ? 3.1 : 2.4} />
                  {/* The triangle marks a breach in shape as well as color. */}
                  {atRisk && (
                    <path d={`M${item.x - 4} ${item.y - 7}L${item.x + 4} ${item.y - 7}L${item.x} ${item.y - 14}Z`} />
                  )}
                  <text x={item.x} y="90">
                    {data[index].label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="runout-legend t-data">
            <span className="legend-demand">Projected demand</span>
            <span className="legend-inventory">Available inventory</span>
            <span className="legend-threshold">Safety stock threshold</span>
          </div>
        </div>

        <div className="runout-notes">
          <div className="part-state-card">
            <strong className="t-label">Part PWR-74062</strong>
            <span className="part-state-date t-data">{selectedState.month}</span>
            <div className="part-state-summary">
              <div>
                <span className="t-label">In house</span>
                <strong className="t-data">{selectedState.inHouse.toLocaleString()}</strong>
              </div>
              <div>
                <span className="t-label">Crossdock</span>
                <strong className="t-data">{selectedState.crossdock.toLocaleString()}</strong>
              </div>
              <div>
                <span className="t-label">ASNs</span>
                <strong className="t-data">{selectedState.asn.toLocaleString()}</strong>
              </div>
              <div>
                <span className="t-label">Demand</span>
                <strong className="t-data">{selectedState.demand.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="runout-note-list">
            {notes.map((note) => {
              const item = data[note.index];
              return (
                <button
                  key={note.label}
                  className={`timeline-note tone-${note.tone}${note.index === activeIndex ? ' is-active' : ''}${item.inventory <= THRESHOLD ? ' is-risk' : ''}`}
                  type="button"
                  onClick={() => setActiveIndex(note.index)}
                  onPointerEnter={() => setActiveIndex(note.index)}
                >
                  <span className="timeline-date t-data">{note.date}</span>
                  <span className="timeline-copy">
                    <strong>{note.label}</strong>
                    {note.detail && <em>{note.detail}</em>}
                    {/* Added by the port: the tone was color only. */}
                    <span className="timeline-status t-label">{TONE_LABEL[note.tone]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
