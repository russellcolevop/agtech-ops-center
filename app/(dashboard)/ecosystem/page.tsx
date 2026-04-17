"use client";

import PageHeader from "@/components/PageHeader";
import TrendBadge from "@/components/TrendBadge";
import { regionData, regions } from "@/data/content";
import { useRegion } from "@/contexts/RegionContext";

type BadgeColor = "green" | "blue" | "amber" | "teal" | "purple" | "orange" | "cyan" | "red";

const opportunityColors: Record<string, BadgeColor> = {
  "Very High": "green",
  "High": "blue",
  "Explosive": "purple",
  "Medium": "amber",
};

export default function EcosystemPage() {
  const region = useRegion();
  const data = regionData[region];
  const regionInfo = regions.find((r) => r.code === region)!;

  if (!data) return <div className="text-gray-400">Region data not available yet.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title={`${regionInfo.flag} ${regionInfo.name} — Ecosystem Overview`}
        description={data.ecosystem.overview}
        icon="🗺️"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "AgTech Market Size", value: data.ecosystem.marketSize, color: "green" },
          { label: "Active Startups", value: data.ecosystem.startups, color: "blue" },
          { label: "VC Investment (2023)", value: data.ecosystem.investment, color: "amber" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 rounded-xl border border-white/10 p-4 text-center">
            <p className="text-xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Key Players */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <h2 className="text-base font-semibold text-white mb-4">🏢 Key Players</h2>
          <div className="space-y-3">
            {data.ecosystem.keyPlayers.length > 0 ? data.ecosystem.keyPlayers.map((player) => (
              <div key={player.name} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-brand-900/50 border border-brand-700/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-400 text-xs font-bold">{player.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{player.name}</p>
                  <p className="text-xs text-gray-400">{player.focus}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500">Data coming soon.</p>
            )}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <h2 className="text-base font-semibold text-white mb-4">🚀 Accelerators & Incubators</h2>
          <div className="space-y-3">
            {data.ecosystem.accelerators.length > 0 ? data.ecosystem.accelerators.map((acc) => (
              <div key={acc.name} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-purple-900/50 border border-purple-700/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 text-xs font-bold">{acc.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{acc.name}</p>
                  <p className="text-xs text-gray-400">{acc.location} · {acc.focus}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500">Data coming soon.</p>
            )}
          </div>
        </div>
      </div>

      {/* Industry Segments Summary */}
      {data.segments.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-4">📊 Top Opportunity Segments</h2>
          <div className="space-y-3">
            {data.segments.slice(0, 3).map((seg) => (
              <div key={seg.name} className="flex items-center justify-between bg-white/5 rounded-xl border border-white/10 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{seg.name}</p>
                  <p className="text-xs text-gray-400">{seg.description}</p>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <TrendBadge label={seg.opportunity} color={opportunityColors[seg.opportunity] || "green"} />
                </div>
              </div>
            ))}
          </div>
          <a href="/industry-segments" className="inline-block mt-3 text-xs text-brand-400 hover:text-brand-300 transition-colors">
            View all segments →
          </a>
        </div>
      )}
    </div>
  );
}
