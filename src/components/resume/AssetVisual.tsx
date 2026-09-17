/*
  Visual dispatcher. Ported from App.tsx `AssetVisual` (561).

  08 required the dispatcher pattern be kept and the per role visuals stay
  behind it. It is kept, rekeyed: 04 moves every visual into a disclosure that
  hangs off the bullet group it belongs to, so the key is the disclosure id
  rather than the asset id. The planner's stack splits in two because its two
  visuals attach to different groups.

  `AboutVisual` is gone with the portrait it rendered: 09 version 3 removes the
  portrait block from the About tab and puts the photo carousel there instead.
  Reported as a deletion.
*/

import type { VisualDisclosureId } from '../../data/experienceAssets';
import { CtbGraph, EcrGraph } from './visuals/CTBDashboardVisual';
import InventoryExposureVisual from './visuals/InventoryExposureVisual';
import GrowthFunnelVisual from './visuals/GrowthFunnelVisual';

export function DisclosureVisual({ id }: { id: VisualDisclosureId }) {
  if (id === 'ctb') return <CtbGraph />;
  if (id === 'ecr') return <EcrGraph />;
  if (id === 'intern') return <InventoryExposureVisual />;
  return <GrowthFunnelVisual />;
}

export default DisclosureVisual;
