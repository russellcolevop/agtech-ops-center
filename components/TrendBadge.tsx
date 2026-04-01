import { cn } from "@/lib/utils";

type BadgeColor = "green" | "blue" | "amber" | "teal" | "purple" | "orange" | "cyan" | "red";

interface TrendBadgeProps {
  label: string;
  color: BadgeColor;
  size?: "sm" | "md";
}

const colorMap: Record<BadgeColor, string> = {
  green: "bg-green-500/15 text-green-400 ring-green-500/20",
  blue: "bg-blue-500/15 text-blue-400 ring-blue-500/20",
  amber: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
  teal: "bg-teal-500/15 text-teal-400 ring-teal-500/20",
  purple: "bg-purple-500/15 text-purple-400 ring-purple-500/20",
  orange: "bg-orange-500/15 text-orange-400 ring-orange-500/20",
  cyan: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/20",
  red: "bg-red-500/15 text-red-400 ring-red-500/20",
};

export default function TrendBadge({ label, color, size = "sm" }: TrendBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full ring-1 font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        colorMap[color]
      )}
    >
      {label}
    </span>
  );
}
