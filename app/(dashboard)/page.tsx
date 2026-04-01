"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import TrendBadge from "@/components/TrendBadge";
import PageHeader from "@/components/PageHeader";
import {
  globalStats,
  innovationHotspots,
  investmentByStage,
  topVCFirms,
  emergingSectors,
  agTechTrends,
  founderOpportunities,
  startupChallenges,
} from "@/data/content";

type BadgeColor = "green" | "blue" | "amber" | "teal" | "purple" | "orange" | "cyan" | "red";

export default function GlobalOverviewPage() {
  const [openChallenge, setOpenChallenge] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <PageHeader
        title="Global Agriculture & AgTech Overview"
        description="Worldwide agricultural technology landscape, innovation hotspots, investment trends, and emerging opportunities for founders."
        icon="🌍"
      />

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {globalStats.map((stat) => (
          <StatCard
            key={stat.label}
            value={stat.value}
            label={stat.label}
            source={stat.source}
            color={stat.color as "green" | "blue" | "amber" | "teal"}
          />
        ))}
      </div>

      {/* Innovation Hotspots */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Global Innovation Hotspots</h2>
        <p className="text-sm text-gray-400 mb-4">Leading regions driving agricultural technology innovation worldwide</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {innovationHotspots.map((spot) => (
            <div
              key={spot.country}
              className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/8 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{spot.flag}</span>
                <TrendBadge label={spot.badge} color={spot.badgeColor as BadgeColor} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">{spot.country}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{spot.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Investment Insights */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <h2 className="text-base font-semibold text-white mb-1">Global Investment Insights</h2>
          <p className="text-xs text-gray-400 mb-5">Venture capital and government funding trends</p>
          <p className="text-xs font-medium text-gray-300 mb-3 uppercase tracking-wider">Investment by Stage (2024)</p>
          <div className="space-y-3">
            {investmentByStage.map((item) => (
              <div key={item.stage}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300">{item.stage}</span>
                  <span className="text-sm font-semibold text-white">{item.amount}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <h2 className="text-base font-semibold text-white mb-1">Top VC Firms</h2>
          <p className="text-xs text-gray-400 mb-5">Leading investors in global AgTech</p>
          <div className="space-y-3">
            {topVCFirms.map((firm) => (
              <div key={firm.name} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-brand-900/50 border border-brand-700/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-400 text-xs font-bold">{firm.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{firm.name}</p>
                  <p className="text-xs text-gray-400">{firm.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emerging Sectors */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Emerging Sectors</h2>
        <p className="text-sm text-gray-400 mb-4">High-growth opportunity areas for founders</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {emergingSectors.map((sector) => (
            <div
              key={sector.title}
              className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/8 transition-colors"
            >
              <span className="text-2xl mb-3 block">{sector.icon}</span>
              <p className="text-sm font-semibold text-white mb-1">{sector.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">{sector.description}</p>
              <TrendBadge label={`Growth: ${sector.growth}`} color="green" />
            </div>
          ))}
        </div>
      </section>

      {/* AgTech Trends */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Global AgTech Trends</h2>
        <p className="text-sm text-gray-400 mb-4">Key technology and market trends shaping the future of agriculture</p>
        <div className="space-y-3">
          {agTechTrends.map((trend) => (
            <div
              key={trend.title}
              className="flex items-center justify-between bg-white/5 rounded-xl border border-white/10 px-5 py-4 hover:bg-white/8 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">{trend.title}</p>
                <p className="text-xs text-gray-400">{trend.description}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <TrendBadge label={trend.status} color={trend.statusColor as BadgeColor} size="md" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Opportunities by Region */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Global Opportunities for Founders</h2>
        <p className="text-sm text-gray-400 mb-4">High-potential market opportunities across different regions</p>
        <div className="grid md:grid-cols-2 gap-4">
          {founderOpportunities.map((region) => (
            <div
              key={region.region}
              className="bg-white/5 rounded-xl border border-white/10 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{region.flag}</span>
                <h3 className="text-sm font-semibold text-white">{region.region}</h3>
              </div>
              <ul className="space-y-2">
                {region.opportunities.map((opp) => (
                  <li key={opp} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="text-brand-500 mt-0.5 flex-shrink-0">→</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Startup Challenges Accordion */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Common AgTech Startup Challenges</h2>
        <p className="text-sm text-gray-400 mb-4">Key challenges faced by agtech startups and proven solutions for overcoming them</p>
        <div className="space-y-3">
          {startupChallenges.map((group, i) => (
            <div key={group.category} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setOpenChallenge(openChallenge === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{group.icon}</span>
                  <div>
                    <span className="text-sm font-semibold text-white">{group.category}</span>
                    <span className="ml-2 text-xs text-gray-500">{group.challenges.length} challenges</span>
                  </div>
                </div>
                {openChallenge === i ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {openChallenge === i && (
                <div className="border-t border-white/10 px-5 py-4 space-y-5">
                  {group.challenges.map((challenge) => (
                    <div key={challenge.title}>
                      <p className="text-sm font-semibold text-white mb-1">{challenge.title}</p>
                      <p className="text-xs text-gray-400 mb-2">{challenge.description}</p>
                      <div className="bg-brand-900/30 border border-brand-700/30 rounded-lg px-3 py-2">
                        <span className="text-xs font-medium text-brand-400">✓ Solution: </span>
                        <span className="text-xs text-gray-300">{challenge.solution}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Feedback Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-300 mb-0.5">🎯 Your Feedback is Critical!</p>
          <p className="text-xs text-amber-200/60">Help us improve this resource for AgTech founders.</p>
        </div>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfhY5p0D4PQRlke2rH_9Rbe-4dCObvufSfNoMaQTjdbc3vnzQ/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-amber-500 text-black text-xs font-semibold rounded-lg hover:bg-amber-400 transition-colors shrink-0 ml-4"
        >
          Share Feedback →
        </a>
      </div>
    </div>
  );
}
