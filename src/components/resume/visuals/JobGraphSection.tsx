/*
  Ported from App.tsx `JobGraphSection` (590) and `JobCallout` (610), unchanged.

  Wraps a visual in a responsibility callout above and an outcome callout below.
  Component boundaries and props are exactly the original's.
*/

import type { ReactNode } from 'react';

function JobCallout({
  tone,
  label,
  text,
}: {
  tone: 'responsibility' | 'outcome';
  label: string;
  text: string;
}) {
  return (
    <div className={`job-callout job-callout-${tone}`}>
      <span className="t-label">{label}</span>
      <p>{text}</p>
    </div>
  );
}

export default function JobGraphSection({
  responsibility,
  outcome,
  children,
  className = '',
}: {
  responsibility: string;
  outcome: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`job-graph-section ${className}`}>
      <JobCallout tone="responsibility" label="Responsibility" text={responsibility} />
      {children}
      <JobCallout tone="outcome" label="Outcome" text={outcome} />
    </section>
  );
}
