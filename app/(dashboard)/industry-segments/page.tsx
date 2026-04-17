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

const maturityColors: Record<string, BadgeColor> = {
  "Mainstream": "green",
  "Early Majority": "blue",
  "Growing Fast": "teal",
  "Growing": "teal",
  "Emerging": "purple",
};

export default function IndustrySegmentsPage() {
  const region = useRegion();
  const data = regionData[region];
  const regionInfo = regions.find((r) => r.code === region)!;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title={`${regionInfo.flag} ${regionInfo.name} — Industry Segments`}
        description={`Detailed breakdown of AgTech opportunity segments within ${regionInfo.name} — market maturity, opportunity size, and founder relevance.`}
        icon="🏭"
      />

      {data.segments.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-2xl mb-3">🌱</p>
          <p className="text-white font-semibold mb-2">Data coming soon</p>
          <p className="text-sm text-gray-400">Industry segment data for this region is being compiled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.segments.map((seg, i) => (
            <div key={seg.name} className="bg-white/5 rounded-xl border border-white/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-400">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{seg.name}</h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <TrendBadge label={`Opportunity: ${seg.opportunity}`} color={opportunityColors[seg.opportunity] || "green"} />
                  <TrendBadge label={seg.maturity} color={maturityColors[seg.maturity] || "blue"} />
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed ml-11">{seg.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold mb-1">Which segment is right for you?</p>
          <p className="text-sm text-gray-400">Get a personalized segment analysis and market sizing for your specific idea.</p>
        </div>
        <a
          href="/book-a-call"
          className="flex-shrink-0 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Book a Call →
        </a>
      </div>
    </div>
  );
}
