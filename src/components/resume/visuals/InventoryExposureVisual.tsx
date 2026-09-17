/*
  Ported from App.tsx `InventoryExposureVisual` (911) with `formatUnits` (1095)
  and `formatCurrency` (1099).

  Every figure ports exactly as it stands, including the six weekly signal rows,
  the 28k chart ceiling, the 3500 unit gap threshold, the 500 multiplier behind
  the scrap exposure, and the outcome line's "$1.2M+ excess exposure".

  One exception, and it is a ruling rather than a reconciliation. The outcome
  line said "~$50K supplier cost recovery" while 04's web bullet on the same
  panel says $80K. 01 section 8 now forbids two figures for the same fact on one
  page: awaiting reconciliation is not a licence to render a contradiction. The
  resume is the stated metrics authority, so both read $80K. Numbers of Record
  still says $50K and one of the two is wrong; that stays logged for the
  reconciliation pass.

  Status change required by 08: the forecast versus consumption gap row turned
  red past the threshold with no textual counterpart. It now states the word.
*/

import { useState } from 'react';
import JobGraphSection from './JobGraphSection';

const signals = [
  { label: 'W1', date: 'May 12', forecast: 18000, actual: 17600, edi: 18800, scrapRisk: 400, callout: 'Signals aligned inside normal planning tolerance.' },
  { label: 'W2', date: 'May 19', forecast: 19500, actual: 17100, edi: 22400, scrapRisk: 2400, callout: 'EDI signal above actual consumption.' },
  { label: 'W3', date: 'May 26', forecast: 21000, actual: 16600, edi: 25200, scrapRisk: 4400, callout: 'Forecast misalignment detected.' },
  { label: 'W4', date: 'Jun 02', forecast: 22400, actual: 15800, edi: 26800, scrapRisk: 6600, callout: 'Exposure window identified.' },
  { label: 'W5', date: 'Jun 09', forecast: 21600, actual: 17900, edi: 23800, scrapRisk: 3700, callout: 'Demand signal normalizing after review.' },
  { label: 'W6', date: 'Jun 16', forecast: 20200, actual: 19100, edi: 21400, scrapRisk: 1100, callout: 'Consumption and forecast moving back into range.' },
];

const chart = { min: 0, max: 28000, left: 8, right: 92, top: 11, bottom: 76 };
const GAP_THRESHOLD = 3500;
const CALLOUT_INDEXES = [1, 2, 3];

const formatUnits = (value: number) => `${Math.round(value).toLocaleString()} units`;
const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString()}`;

export default function InventoryExposureVisual() {
  const [activeIndex, setActiveIndex] = useState(3);

  const point = (index: number, value: number) => {
    const x = chart.left + (index / (signals.length - 1)) * (chart.right - chart.left);
    const y = chart.bottom - ((value - chart.min) / (chart.max - chart.min)) * (chart.bottom - chart.top);
    return { x, y };
  };

  const pointsFor = (key: 'forecast' | 'actual' | 'edi') =>
    signals.map((item, index) => point(index, item[key]));

  const active = signals[activeIndex];
  const gap = active.forecast - active.actual;
  const scrapExposure = Math.max(gap, 0) * 500;
  const gapIsRisk = gap > GAP_THRESHOLD;

  return (
    <JobGraphSection
      responsibility="Compared forecast, EDI demand signals, actual consumption, and inventory exposure to identify overproduction and supplier recovery opportunities."
      outcome="Identified $1.2M+ excess exposure and supported ~$80K supplier cost recovery through signal alignment."
    >
      <div
        className="asset-visual exposure-visual"
        role="group"
        aria-label="Divergence between forecast, EDI demand signal and actual consumption across six weeks, with the resulting scrap exposure"
      >
        <div className="visual-heading">
          <span className="t-label">Forecast, consumption and EDI divergence</span>
          <strong className="t-data">{active.date}</strong>
        </div>

        <div className="intern-signal-grid">
          <div className="signal-chart-stack">
            <svg
              className="signal-line-chart"
              viewBox="0 0 100 88"
              role="img"
              aria-label="Line chart of forecast, actual consumption and EDI demand signal across six weeks"
            >
              <path className="chart-grid" d="M8 11H92M8 27.25H92M8 43.5H92M8 59.75H92M8 76H92" />
              <path className="chart-axis" d="M8 9V76H94" />
              <text className="axis-label" x="4.5" y="12">28k</text>
              <text className="axis-label" x="4.5" y="45">14k</text>
              <text className="axis-label" x="4.5" y="77">0</text>

              <polyline className="signal-series forecast-series" points={pointsFor('forecast').map((i) => `${i.x},${i.y}`).join(' ')} />
              <polyline className="signal-series actual-series" points={pointsFor('actual').map((i) => `${i.x},${i.y}`).join(' ')} />
              <polyline className="signal-series edi-series" points={pointsFor('edi').map((i) => `${i.x},${i.y}`).join(' ')} />

              {signals.map((item, index) => {
                const forecast = point(index, item.forecast);
                const actual = point(index, item.actual);
                const edi = point(index, item.edi);
                const activeClass = index === activeIndex ? ' is-active' : '';
                return (
                  <g
                    key={item.label}
                    className="signal-week-group"
                    onPointerEnter={() => setActiveIndex(index)}
                  >
                    {index === activeIndex && (
                      <path className="signal-hover-guide" d={`M${forecast.x} 11V76`} />
                    )}
                    <circle className={`signal-dot forecast-series${activeClass}`} cx={forecast.x} cy={forecast.y} r="2.1" />
                    <circle className={`signal-dot actual-series${activeClass}`} cx={actual.x} cy={actual.y} r="2.1" />
                    <circle className={`signal-dot edi-series${activeClass}`} cx={edi.x} cy={edi.y} r="2.1" />
                    <circle className="signal-hit-circle" cx={forecast.x} cy={43.5} r="6.8" />
                    <text x={forecast.x} y="84">{item.label}</text>
                  </g>
                );
              })}
            </svg>

            <div className="signal-chart-footer">
              <div className="signal-legend t-data">
                <span className="forecast-series">Forecast</span>
                <span className="actual-series">Actual consumption</span>
                <span className="edi-series">EDI signal</span>
              </div>

              <div className="signal-callout-row">
                {CALLOUT_INDEXES.map((index) => (
                  <button
                    key={signals[index].callout}
                    className={index === activeIndex ? 'is-active' : ''}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    onPointerEnter={() => setActiveIndex(index)}
                  >
                    {signals[index].callout}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="signal-detail-panel">
            <span className="t-label">Selected signal</span>
            <strong className="t-data">
              {active.label}, {active.date}
            </strong>

            <dl>
              <div>
                <dt className="t-label">Forecast</dt>
                <dd className="t-data">{formatUnits(active.forecast)}</dd>
              </div>
              <div>
                <dt className="t-label">EDI signal</dt>
                <dd className="t-data">{formatUnits(active.edi)}</dd>
              </div>
              <div>
                <dt className="t-label">Actual consumption</dt>
                <dd className="t-data">{formatUnits(active.actual)}</dd>
              </div>
              <div className={gapIsRisk ? 'is-risk' : ''}>
                <dt className="t-label">
                  Forecast vs consumption gap
                  {/* Added by the port: the threshold breach was color only. */}
                  {gapIsRisk && <span className="gap-status"> over threshold</span>}
                </dt>
                <dd className="t-data">{formatUnits(gap)}</dd>
              </div>
            </dl>

            <p>{active.callout}</p>

            <div className="scrap-exposure-callout">
              <span className="t-label">Scrap exposure</span>
              <strong className="t-data">{formatCurrency(scrapExposure)}</strong>
            </div>
          </aside>
        </div>
      </div>
    </JobGraphSection>
  );
}
