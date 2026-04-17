"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Static Data ──────────────────────────────────────────────────────────────

const INVESTOR_DEALS = [
  { co: "Halter", amt: "$165M", amtNum: 165, round: "Series D", date: "Jun 2025", lead: "Bessemer Venture Partners", sector: "Livestock Tech", desc: "Virtual fencing and GPS livestock management platform from New Zealand. Valued at $1.65B.", geo: "🇳🇿 NZ", region: "au" },
  { co: "80 Acres Farms", amt: "$115M", amtNum: 115, round: "Growth", date: "Feb 2025", lead: "General Atlantic", sector: "Indoor Farming", desc: "Fully automated vertical farm operations. Post-money valuation ~$1.2B.", geo: "🇺🇸 US", region: "us" },
  { co: "Monarch Tractor", amt: "$133M", amtNum: 133, round: "Series C", date: "Jul 2024", lead: "Hedosophia", sector: "Robotics", desc: "Electric, autonomous tractors — largest ag robotics round ever.", geo: "🇺🇸 US", region: "us" },
  { co: "Oishii", amt: "$150M", amtNum: 150, round: "Series B", date: "Feb 2024", lead: "Undisclosed", sector: "Indoor Farming", desc: "Premium vertical-farmed berries. Japan expansion.", geo: "🇺🇸 US", region: "us" },
  { co: "Inari Agriculture", amt: "$103M", amtNum: 103, round: "Late Stage", date: "Jan 2024", lead: "Flagship Pioneering", sector: "Biotech", desc: "AI-powered crop science using gene editing. Total raised: $720M.", geo: "🇺🇸 US", region: "us" },
  { co: "Carbon Robotics", amt: "$70M", amtNum: 70, round: "Series D", date: "2024", lead: "Undisclosed", sector: "Robotics", desc: "Autonomous laser weeding robots for row crops. Total raised: $157M.", geo: "🇺🇸 US", region: "us" },
  { co: "Nofence", amt: "$35M", amtNum: 35, round: "Series B", date: "Jul 2025", lead: "Undisclosed", sector: "Livestock Tech", desc: "Virtual fencing platform — Europe's largest AgTech round of 2025.", geo: "🇳🇴 Norway", region: "eu" },
  { co: "Pairwise", amt: "$40M", amtNum: 40, round: "Series C", date: "2024", lead: "Undisclosed", sector: "Biotech", desc: "Gene editing platform (Fulcrum™) for specialty crop improvement.", geo: "🇺🇸 US", region: "us" },
  { co: "Indigo Agriculture", amt: "$250M", amtNum: 250, round: "Late Stage", date: "2023", lead: "Various", sector: "Sustainability", desc: "Microbial crop treatments, grain marketplace, and carbon credit platform. Total: $1.4B.", geo: "🇺🇸 US", region: "us" },
  { co: "Farm-ng", amt: "$10M", amtNum: 10, round: "Series A", date: "Jan 2024", lead: "Undisclosed", sector: "Robotics", desc: "Modular autonomous farm robots. Acquired by Bonsai Robotics Jul 2025.", geo: "🇺🇸 US", region: "us" },
  { co: "Ginkgo Bioworks", amt: "$796M", amtNum: 796, round: "Multiple", date: "2023–2024", lead: "Various", sector: "Biotech", desc: "Synthetic biology platform for agricultural and industrial applications.", geo: "🇺🇸 US", region: "us" },
  { co: "Semios", amt: "$100M", amtNum: 100, round: "Series C", date: "2023", lead: "Morningside Group", sector: "Precision Ag", desc: "Crop intelligence platform using IoT sensors for pest & disease management.", geo: "🇨🇦 CA", region: "ca" },
  { co: "Terramera", amt: "$45M", amtNum: 45, round: "Series B", date: "2023", lead: "Ospraie Ag Science", sector: "Biotech", desc: "AI-powered clean chemistry — reducing pesticide use by up to 80%.", geo: "🇨🇦 CA", region: "ca" },
  { co: "Precision AI", amt: "$20M", amtNum: 20, round: "Series A", date: "2024", lead: "Undisclosed", sector: "Precision Ag", desc: "Drone-based precision spraying — 90% reduction in herbicides.", geo: "🇨🇦 CA", region: "ca" },
  { co: "Phytoform Labs", amt: "$12M", amtNum: 12, round: "Series A", date: "2024", lead: "Undisclosed", sector: "Biotech", desc: "Gene editing for climate-resilient crops. Partnered with major seed companies.", geo: "🇬🇧 UK", region: "eu" },
  { co: "Tevel Aerobotics", amt: "$20M", amtNum: 20, round: "Series B", date: "2024", lead: "Undisclosed", sector: "Robotics", desc: "Autonomous fruit-picking drones — addressing global harvest labor shortage.", geo: "🇮🇱 IL", region: "il" },
  { co: "Taranis", amt: "$40M", amtNum: 40, round: "Series D", date: "2023", lead: "Viola Ventures", sector: "Precision Ag", desc: "AI-powered crop intelligence with sub-millimeter aerial imaging.", geo: "🇮🇱 IL", region: "il" },
  { co: "Solinftec", amt: "$60M", amtNum: 60, round: "Series D", date: "2024", lead: "TPG Rise", sector: "Precision Ag", desc: "Farm operations platform managing 30M+ acres across the Americas.", geo: "🇧🇷 BR", region: "br" },
  { co: "Enko Chem", amt: "$45M", amtNum: 45, round: "Series C", date: "2024", lead: "Undisclosed", sector: "Biotech", desc: "AI-driven crop protection chemistry — faster discovery pipeline.", geo: "🇺🇸 US", region: "us" },
  { co: "SwarmFarm Robotics", amt: "$15M", amtNum: 15, round: "Series A", date: "2024", lead: "Undisclosed", sector: "Robotics", desc: "Autonomous broadacre farm robots. Largest ag robotics deployment in Australia.", geo: "🇦🇺 AU", region: "au" },
  { co: "DiMuto", amt: "$11M", amtNum: 11, round: "Series A", date: "2024", lead: "SGInnovate", sector: "Supply Chain", desc: "AI trade platform for fresh produce traceability across Southeast Asia.", geo: "🇸🇬 SG", region: "sg" },
  { co: "Connecterra", amt: "$15M", amtNum: 15, round: "Series B", date: "2023", lead: "Breed Reply", sector: "Livestock Tech", desc: "AI-powered dairy monitoring platform — 'Fitbit for cows' across 25+ countries.", geo: "🇳🇱 NL", region: "nl" },
  { co: "Manna Irrigation", amt: "$18M", amtNum: 18, round: "Series B", date: "2024", lead: "Undisclosed", sector: "Precision Ag", desc: "Precision drip irrigation analytics — reducing water use 30%+ in arid regions.", geo: "🇮🇱 IL", region: "il" },
  { co: "BrightFarms", amt: "Undisclosed", amtNum: 0, round: "Expansion", date: "2024", lead: "Cox Enterprises", sector: "Indoor Farming", desc: "Now largest US greenhouse operator at 700+ acres under glass.", geo: "🇺🇸 US", region: "us" },
] as const;

type Region = "all" | "us" | "il" | "nl" | "eu" | "ca" | "au" | "sg" | "br";

const REGION_LABELS: Record<Region, string> = {
  all: "All Regions",
  us: "🇺🇸 United States",
  il: "🇮🇱 Israel",
  nl: "🇳🇱 Netherlands",
  eu: "🇪🇺 Europe",
  ca: "🇨🇦 Canada",
  au: "🇦🇺 Australia",
  sg: "🇸🇬 Singapore",
  br: "🇧🇷 Brazil",
};

const ECOSYSTEM_MATURITY = [
  { region: "us", label: "United States", flag: "🇺🇸", score: 92, funding: 95, startups: 94, research: 90, policy: 88, talent: 93 },
  { region: "il", label: "Israel", flag: "🇮🇱", score: 88, funding: 85, startups: 90, research: 88, policy: 84, talent: 92 },
  { region: "nl", label: "Netherlands", flag: "🇳🇱", score: 82, funding: 80, startups: 82, research: 85, policy: 88, talent: 78 },
  { region: "eu", label: "Europe (Broader)", flag: "🇪🇺", score: 76, funding: 74, startups: 78, research: 80, policy: 82, talent: 72 },
  { region: "ca", label: "Canada", flag: "🇨🇦", score: 74, funding: 72, startups: 75, research: 76, policy: 78, talent: 70 },
  { region: "au", label: "Australia", flag: "🇦🇺", score: 70, funding: 68, startups: 70, research: 72, policy: 70, talent: 68 },
  { region: "sg", label: "Singapore", flag: "🇸🇬", score: 68, funding: 66, startups: 68, research: 65, policy: 78, talent: 66 },
  { region: "br", label: "Brazil", flag: "🇧🇷", score: 65, funding: 62, startups: 66, research: 60, policy: 58, talent: 64 },
] as const;

const INVESTOR_TRENDS = {
  years: [
    { year: 2022, total: "$51B", note: "Peak year — historic high" },
    { year: 2023, total: "$15.6B", note: "−49% correction" },
    { year: 2024, total: "$16B", note: "Stabilized; 736 startups funded; $3.8B VC" },
    { year: 2025, total: "~$16.2B", note: "Flat through Q3; deal count down 12%" },
  ],
  hotSectors: [
    { name: "Precision Ag (AI, IoT, Satellites)", share: "~40%", trend: "🔥 Hot", amt: "~$6.4B" },
    { name: "Agricultural Biotech & Gene Editing", share: "~12%", trend: "🔥 Hot", amt: "~$2B" },
    { name: "Farm Robotics & Autonomy", share: "~8%", trend: "📈 Growing", amt: "+$135M YoY" },
    { name: "Crops & Genetics", share: "~7%", trend: "📈 Growing", amt: "+$280M YoY" },
    { name: "Supply Chain & Traceability", share: "~6%", trend: "➡️ Stable", amt: "" },
    { name: "Indoor Farming (CEA)", share: "~5%", trend: "📉 Cooling", amt: "$328M (−25% YoY)" },
    { name: "Alternative Protein", share: "~4%", trend: "📉 Cooling", amt: "Significant decline" },
  ],
  signals: [
    "13 of top 20 US deals in 2024 involved AI or autonomous solutions",
    "AI in agriculture market projected 25%+ annual growth through 2030",
    "Downstream consumer-facing agtech rose +38% YoY in 2024",
    "Upstream farm-level agtech declined −22% YoY",
    "Debt and late-stage instruments hit 18.2% — decade high",
    "IPO filings surged 32% in early 2025",
  ],
} as const;

const TOP_VCS = [
  { name: "Flagship Pioneering", location: "Boston, MA", stage: "Growth", portfolio: "Indigo Ag / Inari / Ginkgo", thesis: "Deep science biotech", url: "https://flagshippioneering.com" },
  { name: "DCVC Bio", location: "San Francisco, CA", stage: "Early", portfolio: "Deep tech ag", thesis: "Deep tech ag bio", url: "https://dcvc.com" },
  { name: "S2G Ventures", location: "Chicago, IL", stage: "A–C", portfolio: "Sustainable ag", thesis: "Sustainable ag full stack", url: "https://s2gventures.com" },
  { name: "AgFunder", location: "San Francisco, CA", stage: "Seed–C", portfolio: "Full-stack agri-food", thesis: "Full-stack agri-food tech", url: "https://agfunder.com" },
  { name: "Yamaha Motor Ventures", location: "Palo Alto, CA", stage: "Early–Growth", portfolio: "Farm robotics", thesis: "Farm robotics & autonomy", url: "https://yamahamotorventures.com" },
  { name: "Omnivore", location: "India", stage: "Seed/A", portfolio: "India-focused", thesis: "India-focused agrifood", url: "https://omnivore.vc" },
  { name: "Astanor Ventures", location: "London, UK", stage: "Early–Growth", portfolio: "European sustainable ag", thesis: "European sustainable ag", url: "https://astanor.com" },
  { name: "Anterra Capital", location: "Amsterdam, NL", stage: "Early–Growth", portfolio: "Deep tech bio-innovation", thesis: "Deep tech bio-innovation", url: "https://anterra.eu" },
  { name: "The Yield Lab", location: "St. Louis, MO", stage: "Seed", portfolio: "H.A.R.V.E.S.T. program", thesis: "Global seed-stage agrifoodtech", url: "https://theyieldlab.com" },
  { name: "Better Food Ventures", location: "San Francisco, CA", stage: "Early", portfolio: "Climate-smart food", thesis: "Climate-smart food systems", url: "https://betterfoodventures.com" },
  { name: "Plug and Play AgTech", location: "Sunnyvale, CA", stage: "Early", portfolio: "Corporate-backed ag", thesis: "Corporate-backed innovation", url: "https://plugandplaytechcenter.com" },
  { name: "Fall Line Capital", location: "San Francisco, CA", stage: "Growth", portfolio: "Farmland + tech", thesis: "Farmland + technology", url: "https://falllinecap.com" },
] as const;

const RECENT_EXITS = [
  { co: "Farm-ng", type: "M&A", date: "Jul 2025", acquirer: "Bonsai Robotics", note: "Modular ag robot platform acquired." },
  { co: "Bowery Farming", type: "Shutdown", date: "Nov 2024", acquirer: "—", note: "Raised $700M+. Closed after failing to reach profitability." },
  { co: "Oishii", type: "M&A", date: "2024", acquirer: "Acquired Tortuga", note: "Vertical farm leader acquires harvest robotics startup." },
  { co: "Revol Greens", type: "Downsizing", date: "2024", acquirer: "—", note: "Greenhouse operator significantly downsized amid CEA headwinds." },
  { co: "BrightFarms / Cox Farms", type: "Expansion", date: "2024", acquirer: "Cox Enterprises", note: "Became largest US greenhouse operator at 700+ acres." },
] as const;

const INTELLIGENCE_SOURCES = [
  { name: "AgFunderNews", desc: "Industry standard for agri-food tech deal flow and analysis.", url: "https://agfundernews.com/newsletter", icon: "📰" },
  { name: "AgTech Navigator", desc: "Curated weekly briefing on startups, VC moves, and M&A.", url: "https://agtechnavigator.com", icon: "🧭" },
  { name: "iGrow News", desc: "Controlled environment agriculture news and indoor farming.", url: "https://igrow.news", icon: "🌱" },
  { name: "The Signal", desc: "High-level AgTech trend analysis for strategic planning.", url: "https://www.globalagtechinitiative.com/thesignal/", icon: "📊" },
  { name: "PitchBook AgTech", desc: "Deep deal data, cap tables, and investor analytics.", url: "https://pitchbook.com", icon: "📈" },
  { name: "AgFunder Research", desc: "Annual AgriFood Tech Investing Report — free download.", url: "https://agfunder.com/research", icon: "🔬" },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  open,
  onToggle,
  count,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all text-left"
    >
      <div className="flex items-center gap-3">
        <span className="text-base font-bold text-gray-900">{title}</span>
        {count !== undefined && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  );
}

function SectorTrendBadge({ trend }: { trend: string }) {
  if (trend.includes("Hot")) return <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{trend}</span>;
  if (trend.includes("Growing")) return <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>;
  if (trend.includes("Stable")) return <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{trend}</span>;
  return <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{trend}</span>;
}

function ScoreBar({ score, color = "bg-brand-500" }: { score: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={cn("h-1.5 rounded-full transition-all", color)} style={{ width: `${score}%` }} />
    </div>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function DealsSection({ regionFilter }: { regionFilter: Region }) {
  const filtered = regionFilter === "all"
    ? INVESTOR_DEALS
    : INVESTOR_DEALS.filter(d => d.region === regionFilter);

  const SECTOR_COLORS: Record<string, string> = {
    "Precision Ag": "bg-blue-100 text-blue-700",
    "Biotech": "bg-purple-100 text-purple-700",
    "Robotics": "bg-orange-100 text-orange-700",
    "Indoor Farming": "bg-teal-100 text-teal-700",
    "Livestock Tech": "bg-amber-100 text-amber-700",
    "Sustainability": "bg-green-100 text-green-700",
    "Supply Chain": "bg-rose-100 text-rose-700",
  };

  if (filtered.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="font-medium">No deals found for this region yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filtered.map(deal => (
        <div key={deal.co} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{deal.co}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{deal.geo} · {deal.date}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={cn(
                "text-sm font-bold",
                deal.amtNum >= 100 ? "text-green-600" : deal.amtNum >= 50 ? "text-brand-600" : "text-gray-700"
              )}>
                {deal.amt}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">{deal.round}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", SECTOR_COLORS[deal.sector] ?? "bg-gray-100 text-gray-600")}>
              {deal.sector}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
              Lead: {deal.lead}
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{deal.desc}</p>
        </div>
      ))}
    </div>
  );
}

function TrendsSection() {
  return (
    <div className="space-y-6">
      {/* Year-over-Year Timeline */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Global AgTech Investment by Year</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INVESTOR_TRENDS.years.map(y => (
            <div key={y.year} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-medium">{y.year}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{y.total}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">{y.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Sectors */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Sector Breakdown (2024)</h3>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sector</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Share</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trend</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody>
              {INVESTOR_TRENDS.hotSectors.map((s, i) => (
                <tr key={s.name} className={cn("border-b border-gray-100 last:border-0", i % 2 === 0 ? "bg-white" : "bg-gray-50/40")}>
                  <td className="px-4 py-3 text-xs font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-semibold">{s.share}</td>
                  <td className="px-4 py-3"><SectorTrendBadge trend={s.trend} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.amt || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Signals */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Key Market Signals</h3>
        <div className="space-y-2">
          {INVESTOR_TRENDS.signals.map((signal, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
              <span className="text-brand-500 font-bold text-sm flex-shrink-0 mt-0.5">→</span>
              <p className="text-sm text-gray-700">{signal}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EcosystemSection() {
  const DIMENSION_LABELS = [
    { key: "funding", label: "Funding" },
    { key: "startups", label: "Startups" },
    { key: "research", label: "Research" },
    { key: "policy", label: "Policy" },
    { key: "talent", label: "Talent" },
  ] as const;

  return (
    <div className="space-y-3">
      {ECOSYSTEM_MATURITY.map((eco, rank) => (
        <div key={eco.region} className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-bold text-gray-400 w-5 text-center">#{rank + 1}</span>
            <span className="text-2xl">{eco.flag}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-bold text-gray-900">{eco.label}</p>
                <span className={cn(
                  "text-sm font-bold",
                  eco.score >= 88 ? "text-green-600" : eco.score >= 75 ? "text-brand-600" : "text-gray-600"
                )}>
                  {eco.score}/100
                </span>
              </div>
              <ScoreBar
                score={eco.score}
                color={eco.score >= 88 ? "bg-green-500" : eco.score >= 75 ? "bg-brand-500" : "bg-gray-400"}
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 pl-9">
            {DIMENSION_LABELS.map(d => (
              <div key={d.key} className="text-center">
                <p className="text-xs text-gray-400 mb-1">{d.label}</p>
                <p className="text-xs font-semibold text-gray-700">{eco[d.key]}</p>
                <ScoreBar score={eco[d.key]} color="bg-blue-400" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function VCSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {TOP_VCS.map(vc => (
        <a
          key={vc.name}
          href={vc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-sm transition-all group block"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-700 transition-colors leading-tight">{vc.name}</h3>
            <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-500 flex-shrink-0 mt-0.5 transition-colors" />
          </div>
          <p className="text-xs text-gray-500 mb-2">{vc.location}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">{vc.stage}</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{vc.thesis}</p>
          <p className="text-xs text-gray-400 mt-2 italic">{vc.portfolio}</p>
        </a>
      ))}
    </div>
  );
}

function ExitsSection() {
  const TYPE_STYLES: Record<string, string> = {
    "M&A": "bg-blue-100 text-blue-700",
    "Shutdown": "bg-red-100 text-red-700",
    "Expansion": "bg-green-100 text-green-700",
    "Downsizing": "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-3">
      {RECENT_EXITS.map(exit => (
        <div key={exit.co} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start gap-4">
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0", TYPE_STYLES[exit.type] ?? "bg-gray-100 text-gray-600")}>
            {exit.type}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-900">{exit.co}</p>
              <p className="text-xs text-gray-400">{exit.date}</p>
              {exit.acquirer !== "—" && (
                <p className="text-xs text-gray-500">→ {exit.acquirer}</p>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">{exit.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function IntelligenceSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {INTELLIGENCE_SOURCES.map(src => (
        <a
          key={src.name}
          href={src.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-sm transition-all group flex items-start gap-4"
        >
          <span className="text-2xl flex-shrink-0">{src.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{src.name}</p>
              <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-brand-500 transition-colors" />
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{src.desc}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvestorPage() {
  const { data: session } = useSession();
  const [regionFilter, setRegionFilter] = useState<Region>("all");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    deals: true,
    trends: false,
    ecosystem: false,
    vcs: false,
    exits: false,
    intel: false,
  });

  function toggleSection(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-5xl">🏦</div>
        <h2 className="text-xl font-bold text-gray-900">Sign in to view the Investor Dashboard</h2>
        <p className="text-gray-500 text-sm text-center max-w-sm">
          Access global deal flow, ecosystem maturity scores, sector trends, and leading VC profiles.
        </p>
        <button
          onClick={() => signIn()}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const filteredDeals = regionFilter === "all"
    ? INVESTOR_DEALS
    : INVESTOR_DEALS.filter(d => d.region === regionFilter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🏦 Investor Dashboard</h1>
        <p className="text-gray-500 mt-1">Global AgTech deal flow, ecosystem intelligence, and market trends.</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Global Investment (2024)", value: "$16B", sub: "Stabilized after 2022 peak", color: "text-green-600" },
          { label: "Startups Funded (2024)", value: "736", sub: "Across all agrifood tech", color: "text-brand-600" },
          { label: "Precision Ag Share", value: "~40%", sub: "Largest sector by investment", color: "text-blue-600" },
          { label: "AI Ag Market Growth", value: "25%+", sub: "Projected annual through 2030", color: "text-purple-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-1">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Region Filter */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(REGION_LABELS) as Region[]).map(r => (
          <button
            key={r}
            onClick={() => setRegionFilter(r)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
              regionFilter === r
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-700"
            )}
          >
            {REGION_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Section 1 — Recent Deals */}
      <div className="space-y-3">
        <SectionHeader
          title="📈 Recent Deals"
          open={openSections.deals}
          onToggle={() => toggleSection("deals")}
          count={filteredDeals.length}
        />
        {openSections.deals && (
          <div className="pt-1">
            <DealsSection regionFilter={regionFilter} />
          </div>
        )}
      </div>

      {/* Section 2 — Investment Trends */}
      <div className="space-y-3">
        <SectionHeader
          title="🔥 Investment Trends"
          open={openSections.trends}
          onToggle={() => toggleSection("trends")}
        />
        {openSections.trends && (
          <div className="pt-1">
            <TrendsSection />
          </div>
        )}
      </div>

      {/* Section 3 — Ecosystem Maturity Index */}
      <div className="space-y-3">
        <SectionHeader
          title="🌍 Ecosystem Maturity Index"
          open={openSections.ecosystem}
          onToggle={() => toggleSection("ecosystem")}
          count={ECOSYSTEM_MATURITY.length}
        />
        {openSections.ecosystem && (
          <div className="pt-1">
            <EcosystemSection />
          </div>
        )}
      </div>

      {/* Section 4 — Leading AgTech VCs */}
      <div className="space-y-3">
        <SectionHeader
          title="🏦 Leading AgTech VCs"
          open={openSections.vcs}
          onToggle={() => toggleSection("vcs")}
          count={TOP_VCS.length}
        />
        {openSections.vcs && (
          <div className="pt-1">
            <VCSection />
          </div>
        )}
      </div>

      {/* Section 5 — Recent Exits & M&A */}
      <div className="space-y-3">
        <SectionHeader
          title="🚪 Recent Exits &amp; M&A"
          open={openSections.exits}
          onToggle={() => toggleSection("exits")}
          count={RECENT_EXITS.length}
        />
        {openSections.exits && (
          <div className="pt-1">
            <ExitsSection />
          </div>
        )}
      </div>

      {/* Section 6 — Intelligence Sources */}
      <div className="space-y-3">
        <SectionHeader
          title="📰 Intelligence Sources"
          open={openSections.intel}
          onToggle={() => toggleSection("intel")}
          count={INTELLIGENCE_SOURCES.length}
        />
        {openSections.intel && (
          <div className="pt-1">
            <IntelligenceSection />
          </div>
        )}
      </div>
    </div>
  );
}
