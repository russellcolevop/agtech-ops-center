"use client";

import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TrendBadge from "@/components/TrendBadge";
import { regionData, regions } from "@/data/content";
import { useRegion } from "@/contexts/RegionContext";

type BadgeColor = "green" | "blue" | "amber" | "teal" | "purple" | "orange" | "cyan" | "red";

const categoryColors: Record<string, BadgeColor> = {
  "Government Programs": "blue",
  "Key Organizations": "green",
  "Accelerators": "purple",
  "Funding": "amber",
};

export default function ResourcesPage() {
  const region = useRegion();
  const data = regionData[region];
  const regionInfo = regions.find((r) => r.code === region)!;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title={`${regionInfo.flag} ${regionInfo.name} — Resources & Support`}
        description={`Government programs, key organizations, funding sources, and support networks for AgTech founders in ${regionInfo.name}.`}
        icon="🆘"
      />

      {data.resources.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-2xl mb-3">🌱</p>
          <p className="text-white font-semibold mb-2">Data coming soon</p>
          <p className="text-sm text-gray-400">Resource data for this region is being compiled.</p>
        </div>
      ) : (
        data.resources.map((section) => (
          <section key={section.category}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-base font-semibold text-white">{section.category}</h2>
              <TrendBadge label={`${section.items.length} resources`} color={categoryColors[section.category] || "green"} />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {section.items.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/8 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                </a>
              ))}
            </div>
          </section>
        ))
      )}

      {/* Suggest resource */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold mb-1">Know a resource we should add?</p>
          <p className="text-sm text-gray-400">Help us build the most comprehensive AgTech resource directory in Canada.</p>
        </div>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfhY5p0D4PQRlke2rH_9Rbe-4dCObvufSfNoMaQTjdbc3vnzQ/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Suggest Resource →
        </a>
      </div>
    </div>
  );
}
