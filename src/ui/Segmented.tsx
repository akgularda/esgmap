import { Icon } from "./Icon";

export interface SegOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

export function Segmented<T extends string>({
  options, value, onChange, size = "md",
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div style={{ display: "inline-flex", background: "#0c100e", border: "1px solid var(--border)", borderRadius: 8, padding: 3, gap: 2 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              border: "none", borderRadius: 6, padding: size === "sm" ? "5px 10px" : "7px 13px",
              fontSize: size === "sm" ? 12 : 13, fontWeight: active ? 600 : 500,
              background: active ? "var(--elev)" : "transparent",
              color: active ? "var(--text)" : "var(--text-3)",
              boxShadow: active ? "inset 0 0 0 1px var(--border-2)" : "none",
              display: "flex", alignItems: "center", gap: 6, transition: "color .15s, background .15s",
            }}
          >
            {o.icon && <Icon name={o.icon} size={14} />}{o.label}
          </button>
        );
      })}
    </div>
  );
}
