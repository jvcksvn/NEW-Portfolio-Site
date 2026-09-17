/*
  04, "Visual disclosures". The responsibility, chart and outcome blocks are
  closed on page load and open from a control on the bullet group they belong
  to, rather than stacked beneath the panel.

  Native <details> with a styled <summary>, per 04's mechanics note: keyboard
  operation and screen reader state come free and no script is needed to run
  it. The one thing script is needed for is telling the panel to remeasure,
  because the panel's height is animated from a measured value and an opening
  disclosure would otherwise be clipped.

  The label names what is behind the control rather than reading "Visual
  Example" four times over.
*/

import type { ReactNode } from 'react';

export default function VisualDisclosure({
  label,
  children,
  onToggle,
}: {
  label: string;
  children: ReactNode;
  /** Tells the panel to remeasure. Called after the browser has laid out. */
  onToggle?: () => void;
}) {
  return (
    <details
      className="visual-disclosure"
      onToggle={() => {
        /* Two passes: one now, one after paint, because the disclosure's own
           content lays out between them. */
        onToggle?.();
        window.requestAnimationFrame(() => onToggle?.());
      }}
    >
      <summary className="disclosure-summary t-label">
        <span className="disclosure-chevron" aria-hidden="true" />
        {label}
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}
