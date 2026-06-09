import type { DisclosureStatus } from "../types";
import { statusStyle } from "./tokens";

export function StatusDot({ status, size = 8 }: { status: DisclosureStatus | null; size?: number }) {
  const s = statusStyle(status);
  return (
    <span
      style={{
        width: size, height: size, borderRadius: 99, background: s.c,
        display: "inline-block", flex: "0 0 auto", boxShadow: `0 0 0 3px ${s.c}22`,
      }}
    />
  );
}
