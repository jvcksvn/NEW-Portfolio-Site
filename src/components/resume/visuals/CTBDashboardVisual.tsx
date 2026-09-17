/*
  Ported from App.tsx `CTBDashboardVisual` (570), unchanged.

  Both responsibility and outcome strings are the originals, including their
  figures: "200+ CTB parts", "zero line-down situations", "100+ cutovers". No
  metric inside a visual is reconciled; that pass is separate.

  Two dash fixes, mechanical and of the same class as the one already authorized:
  "Clear-to-build" is written open as the rest of the site writes it, and
  "line-down" becomes "line down". Both are rendered strings and the dash check
  fails the build on either. Reported.
*/

import JobGraphSection from './JobGraphSection';
import ClearToBuildRunoutTracker from './ClearToBuildRunoutTracker';
import EcrProgramRiskTracker from './EcrProgramRiskTracker';

/*
  The two halves are exported separately so each can sit inside its own
  disclosure: 04 attaches the tracker to group three and the dashboard to group
  one. The strings and the component boundaries are the original's.
*/
export function CtbGraph() {
  return (
    <JobGraphSection
      responsibility="Clear to build visibility across launch parts, supplier commits, inventory, and build requirements."
      outcome="200+ CTB parts tracked with zero line down situations and minimal expedited recovery."
    >
      <ClearToBuildRunoutTracker />
    </JobGraphSection>
  );
}

export function EcrGraph() {
  return (
    <JobGraphSection
      className="ecr-graph-section"
      responsibility="Tracked ECR readiness across part effectivity, new shipments, supplier coordination, PPAP, and scheduling agreement setup."
      outcome="100+ cutovers executed with minimal scrap exposure by aligning supplier readiness, PPAP, BOM timing, and production requirements."
    >
      <EcrProgramRiskTracker />
    </JobGraphSection>
  );
}
