import type { ReactNode } from "react";

import { FlowIcon } from "./FlowIcon";

export function renderGameIcon(
  icon: "flow" | undefined,
  size: number,
): ReactNode {
  return icon === "flow" ? <FlowIcon size={size} /> : undefined;
}
