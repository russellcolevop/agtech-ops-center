"use client";

import { useSession, signIn } from "next-auth/react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const ACTION_ACCELERATORS = [
  { name: "THRIVE Global Impact Challenge", org: "SVG Ventures", type: "Pitch + Accelerator", deadline: "Check site", status: "check", desc: "Up to $1M investment for startups advancing sustainable agriculture.", url: "https://thriveagrifood.com/", agtech: true, icon: "🏆" },
  { name: "World Food Prize — Innovate for Impact", org: "World Food Prize Foundation", type: "Pitch Competition", deadline: "Apr 15, 2026", status: "open", desc: "$50K first prize, pitch at Borlaug Dialogue (1,500+ attendees from 70+ countries).", url: "https://www.worldfoodprize.org/en/nominations/innovate_for_impact_challenge/", agtech: true, icon: "🌾" },
  { name: "EIT Food Accelerator Network", org: "EIT Food (EU)", type: "Accelerator", deadline: "Apr 8, 2026", status: "open", desc: "Six specialized hubs across Europe with up to €50K grants for pre-Series A agrifood startups.", url: "https://www.eitfood.eu/", agtech: true, icon: "🇪🇺" },
  { name: "AgLaunch365", org: "AgLaunch", type: "Accelerator", deadline: "Check site", status: "check", desc: "$100K initial investment plus milestone-based capital for pre-seed AgTech companies.", url: "https://aglaunch.com/", agtech: true, icon: "🚀" },
  { name: "Startupbootcamp Food & AgriTech", org: "Startupbootcamp", type: "3-Month Accelerator", deadline: "Check site", status: "check", desc: "€25K cash + €100K in-kind, 100+ industry mentors. Amsterdam-based, hybrid program.", url: "https://startupbootcamp.org/accelerator/food-agritech", agtech: true, icon: "🇳🇱" },
  { name: "Creative Destruction Lab — AgriFood", org: "CDL (Calgary / Doha)", type: "Accelerator", deadline: "Apr 2026", status: "open", desc: "World-class mentor network of serial entrepreneurs, investors, and researchers.", url: "https://creativedestructionlab.com/streams/ag/", agtech: true, icon: "💡" },
  { name: "The Yield Lab", org: "Yield Lab Institute", type: "Venture Fund + Accelerator", deadline: "Rolling", status: "open", desc: "Global network investing seed to growth stage agrifoodtech. H.A.R.V.E.S.T. AgTech program.", url: "https://theyieldlab.com/", agtech: true, icon: "🌱" },
  { name: "Plug and Play AgTech", org: "Plug and Play", type: "Accelerator", deadline: "Rolling", status: "open", desc: "Corporate partners include Corteva, Nestlé, Bayer, PepsiCo. Digital farming, AI, IoT.", url: "https://www.plugandplayapac.com/food", agtech: true, icon: "🔌" },
  { name: "Techstars Farm to Fork", org: "Techstars + Cargill + Ecolab", type: "3-Month Accelerator", deadline: "Rolling", status: "open", desc: "Full food value chain — AgTech, manufacturing, supply chains, food safety.", url: "https://accelerate.techstars.com/farmtofork", agtech: true, icon: "🍴" },
  { name: "FoodBytes! 2026", org: "Rabobank", type: "Pitch + Mentorship", deadline: "Jun 3, 2026", status: "open", desc: "Multi-continent platform combining accelerator, pitch competition, and mentorship.", url: "https://www.foodbytesworld.com/", agtech: true, icon: "🍏" },
  { name: "Radicle Growth", org: "Radicle (Finistere Ventures)", type: "Accelerator Fund", deadline: "Rolling", status: "open", desc: "AgRogue Growth Partners invests $3–7M in 10–15 AgTech companies. Corn Challenge: $1.75M.", url: "https://www.radicle.vc/", agtech: true, icon: "🌿" },
  { name: "MaRS — Food & AgTech Mission", org: "MaRS Discovery District", type: "Venture Accelerator", deadline: "Rolling", status: "open", desc: "National Canadian program for food & AgTech. Powered by Farm Credit Canada.", url: "https://missionfrommars.ca/food-and-agtech/", agtech: true, icon: "🇨🇦" },
  { name: "Cultivator AgTech Accelerator", org: "Cultivator (Saskatchewan)", type: "3-Month Accelerator", deadline: "Rolling", status: "open", desc: "Helps Canadian AgTech founders reach product-market fit.", url: "https://www.cultivator.ca/programs/agtech-accelerator", agtech: true, icon: "🌾" },
  { name: "Y Combinator", org: "Y Combinator", type: "Accelerator", deadline: "Biannual batches", status: "open", desc: "Top general accelerator — regularly funds AgTech startups.", url: "https://www.ycombinator.com/companies/industry/agriculture", agtech: false, icon: "🟧" },
  { name: "DMZ (Toronto Met)", org: "Toronto Metropolitan University", type: "Tech Incubator", deadline: "Rolling", status: "open", desc: "Ranked #1 globally. Supports founders including AgTech across Canada.", url: "https://dmz.torontomu.ca", agtech: false, icon: "🏙️" },
  { name: "Communitech", org: "Communitech (Kitchener-Waterloo)", type: "Innovation Hub", deadline: "Rolling", status: "open", desc: "25+ years supporting founders. 1,200+ current members in tech ecosystem.", url: "https://www.communitech.ca/", agtech: false, icon: "🤝" },
] as const;

type Persona = "early-stage" | "growth-stage" | "investor";

type PersonaRec = {
  icon: string;
  title: string;
  sub: string;
  action?: string;
  url?: string;
};

const PERSONA_RECS: Record<Persona, PersonaRec[]> = {
  "early-stage": [
    { icon: "🎯", title: "Complete your FounderOps profile", sub: "Unlock tier-gated connections and personalized matches", action: "/profile" },
    { icon: "🏆", title: "Browse Accelerators & Pitch Competitions", sub: "Most have rolling deadlines — don't wait for the right time", action: "#accelerators" },
    { icon: "📰", title: "Subscribe to AgFunderNews + iGrow", sub: "Stay current on deals, trends, and who's raising", url: "https://agfundernews.com/newsletter" },
    { icon: "🤝", title: "Join AgTech Alchemy on Slack", sub: "The most active founder community in AgTech", url: "https://www.linkedin.com/company/agtech-alchemy" },
    { icon: "📅", title: "Attend the next World Agri-Tech event", sub: "Best networking ROI in the industry — put it on your calendar", url: "https://worldagritechusa.com/" },
  ],
  "growth-stage": [
    { icon: "💰", title: "Explore Radicle Growth & Yield Lab", sub: "Growth-stage capital specifically for AgTech companies", url: "https://www.radicle.vc/" },
    { icon: "🤝", title: "Find investors through Smart Connections", sub: "Your match scores improve as you earn more badges", action: "/connections" },
    { icon: "🏛️", title: "Join the AGRI Tech Venture Forum", sub: "Premium networking with ag tech executives and corporate strategics", url: "https://agritechventureforum.com/" },
    { icon: "📊", title: "Subscribe to The Signal newsletter", sub: "High-level AgTech trend analysis for strategic planning", url: "https://www.globalagtechinitiative.com/thesignal/" },
    { icon: "🌍", title: "Explore international expansion events", sub: "World Agri-Tech runs summits in SF, London, and São Paulo", url: "https://worldagritechusa.com/" },
  ],
  "investor": [
    { icon: "📰", title: "Subscribe to AgFunderNews", sub: "The industry standard for agri-food tech deal flow and analysis", url: "https://agfundernews.com/newsletter" },
    { icon: "🔍", title: "Use Smart Connections for deal discovery", sub: "AI-scored matches surface companies aligned with your thesis", action: "/connections" },
    { icon: "🌱", title: "Browse the Ecosystem Overview", sub: "Full map of VCs, accelerators, and government programs", action: "/ecosystem" },
    { icon: "📅", title: "Attend FoodBytes! and World Agri-Tech", sub: "Best events for meeting portfolio-ready AgTech startups", url: "https://www.foodbytesworld.com/" },
    { icon: "🤝", title: "Join Founders Network — AgTech", sub: "Support founders and discover investment opportunities", action: "/hub" },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectPersona(email?: string | null, name?: string | null): Persona {
  if (!email && !name) return "early-stage";
  const combined = `${email ?? ""} ${name ?? ""}`.toLowerCase();
  if (combined.includes("investor") || combined.includes("vc") || combined.includes("ventures") || combined.includes("capital")) return "investor";
  if (combined.includes("growth") || combined.includes("series")) return "growth-stage";
  return "early-stage";
}

const PERSONA_LABELS: Record<Persona, string> = {
  "early-stage": "Early-Stage Founder",
  "growth-stage": "Growth-Stage Founder",
  "investor": "Investor",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Open
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      Check Dates
    </span>
  );
}

function RecCard({ rec }: { rec: PersonaRec }) {
  const href = rec.url ?? rec.action ?? "#";
  const isExternal = !!rec.url;

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group"
    >
      <span className="text-2xl flex-shrink-0 mt-0.5">{rec.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">{rec.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{rec.sub}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-brand-500 flex-shrink-0 mt-0.5 transition-colors" />
    </a>
  );
}

type Accelerator = typeof ACTION_ACCELERATORS[number];

function ProgramCard({ program }: { program: Accelerator }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "bg-white border rounded-xl overflow-hidden transition-all",
      expanded ? "border-brand-300 shadow-sm" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
    )}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{program.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{program.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{program.org}</p>
              </div>
              <StatusBadge status={program.status} />
            </div>

            <div className="flex flex-wrap gap-2 mt-2.5">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{program.type}</span>
              {program.agtech && (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200">AgTech</span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="font-medium text-gray-600">Deadline:</span> {program.deadline}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          <span>{expanded ? "Hide details" : "Show details"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">{program.desc}</p>
          <a
            href={program.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Apply →
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActionPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-5xl">🎯</div>
        <h2 className="text-xl font-bold text-gray-900">Sign in to access the Action Center</h2>
        <p className="text-gray-500 text-sm text-center max-w-sm">
          Get personalized weekly recommendations, program deadlines, and your founder action plan.
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

  const persona = detectPersona(session.user?.email, session.user?.name);

  const sorted = [...ACTION_ACCELERATORS].sort((a, b) => {
    if (a.status === "open" && b.status !== "open") return -1;
    if (a.status !== "open" && b.status === "open") return 1;
    return 0;
  });

  const openCount = ACTION_ACCELERATORS.filter(a => a.status === "open").length;
  const rollingCount = ACTION_ACCELERATORS.filter(a => a.deadline.toLowerCase().includes("rolling")).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🎯 Action Center</h1>
        <p className="text-gray-500 mt-1">What you should be doing this week — personalized for you.</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open Programs", value: openCount, color: "text-green-600" },
          { label: "Rolling Deadlines", value: rollingCount, color: "text-blue-600" },
          { label: "Total Opportunities", value: ACTION_ACCELERATORS.length, color: "text-brand-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Section 1 — Recommended For You */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">⚡ Recommended For You</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {PERSONA_LABELS[persona]}
          </span>
        </div>
        <div className="space-y-3">
          {PERSONA_RECS[persona].map(rec => (
            <RecCard key={rec.title} rec={rec} />
          ))}
        </div>
      </section>

      {/* Section 2 — Accelerators & Pitch Competitions */}
      <section id="accelerators">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-bold text-gray-900">🏆 Pitch Competitions &amp; Accelerators</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {ACTION_ACCELERATORS.length} programs
          </span>
        </div>
        <div className="space-y-3">
          {sorted.map(program => (
            <ProgramCard key={program.name} program={program} />
          ))}
        </div>
      </section>
    </div>
  );
}
