import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  source: string;
  color: "green" | "blue" | "amber" | "teal" | "purple";
  expandContent?: React.ReactNode;
}

const colorMap = {
  green: "from-green-500/10 to-green-600/5 border-green-500/20 text-green-400",
  blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400",
  amber: "from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400",
  teal: "from-teal-500/10 to-teal-600/5 border-teal-500/20 text-teal-400",
  purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400",
};

const valuColorMap = {
  green: "text-green-300",
  blue: "text-blue-300",
  amber: "text-amber-300",
  teal: "text-teal-300",
  purple: "text-purple-300",
};

export default function StatCard({ value, label, source, color }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-gradient-to-br p-5 backdrop-blur-sm",
        colorMap[color]
      )}
    >
      <div className={cn("text-2xl font-bold mb-1", valuColorMap[color])}>{value}</div>
      <div className="text-sm font-medium text-white/90">{label}</div>
      <div className="text-xs text-white/50 mt-1">{source}</div>
    </div>
  );
}
