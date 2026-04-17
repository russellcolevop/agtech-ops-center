"use client";

import PageHeader from "@/components/PageHeader";
import { regionData, regions } from "@/data/content";
import { useRegion } from "@/contexts/RegionContext";

export default function CropsPage() {
  const region = useRegion();
  const data = regionData[region];
  const regionInfo = regions.find((r) => r.code === region)!;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title={`${regionInfo.flag} ${regionInfo.name} — Crops`}
        description={`Key crop categories, production data, and AgTech opportunity mapping for ${regionInfo.name}.`}
        icon="🌾"
      />

      {data.crops.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-2xl mb-3">🌱</p>
          <p className="text-white font-semibold mb-2">Data coming soon</p>
          <p className="text-sm text-gray-400">Crop data for this region is being compiled.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.crops.map((crop) => (
              <div key={crop.name} className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">{crop.name}</h3>
                  <span className="text-lg">🌾</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Production Area</span>
                    <span className="text-xs text-gray-300 font-medium">{crop.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Market Value</span>
                    <span className="text-xs text-green-400 font-semibold">{crop.value}</span>
                  </div>
                </div>
                <div className="bg-brand-900/30 border border-brand-700/20 rounded-lg p-2">
                  <p className="text-xs text-brand-300">
                    <span className="font-medium">AgTech Opp: </span>
                    {crop.techOpportunity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Full table */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Crop</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Area</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Value</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Key Technology Opportunities</th>
                </tr>
              </thead>
              <tbody>
                {data.crops.map((crop, i) => (
                  <tr key={crop.name} className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? "" : "bg-white/2"}`}>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-white">{crop.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-300">{crop.area}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-green-400 font-semibold">{crop.value}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-400">{crop.techOpportunity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
