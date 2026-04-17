"use client";

import { useState, useMemo } from "react";
import { ExternalLink, Search, Filter, ChevronDown, ChevronUp, X, Building2, Users, MapPin, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCELERATORS, PARTNER_ECOSYSTEMS, REGION_NAMES, COUNTRY_FLAGS, type Accelerator, type PartnerEcosystem } from "@/data/accelerators";

type Tab = "partners" | "browse" | "profile" | "tracker";

const TABS: { id: Tab; label: string }[] = [
  { id: "partners", label: "Partner Ecosystems" },
  { id: "browse", label: "Browse Programs" },
  { id: "profile", label: "My Application Profile" },
  { id: "tracker", label: "Application Tracker" },
];

const ARTIFACT_LABELS: Record<string, string> = {
  "business-plan": "Business Plan",
  "pitch-deck": "Pitch Deck",
  "video-pitch": "Video Pitch",
  "mvp-demo": "MVP Demo",
  "team-bios": "Team Bios",
  "financial-projections": "Financial Projections",
  "customer-traction": "Customer Traction Data",
  "prototype-mvp": "Working Prototype",
  "letter-of-intent": "Letters of Intent",
  "pitch-video": "Pitch Video",
  "prototype": "Prototype",
  "product-demo": "Product Demo",
  "working-prototype": "Working Prototype",
  "farmer-validation": "Farmer Validation",
  "climate-impact-measurement": "Climate Impact Measurement",
  "traction-evidence": "Traction Evidence",
  "validated-business-model": "Validated Business Model",
  "customer-validation": "Customer Validation",
  "climate-impact": "Climate Impact Plan",
  "early-stage-technology": "Early-Stage Technology",
  "technology-details": "Technology Details",
  "business-model": "Business Model",
};

function getFlag(country: string) {
  return COUNTRY_FLAGS[country] || "🌍";
}

// ─── Partner Ecosystems Tab ───────────────────────────────────────────────────

function EcosystemCard({ eco }: { eco: PartnerEcosystem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-2" style={{ backgroundColor: eco.color }} />
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{eco.shortName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{eco.type}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {eco.claimed && (
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">Demo</span>
            )}
            <span className="text-xs text-gray-500">{getFlag(eco.country)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
          <MapPin className="w-3 h-3" />
          <span>{eco.location}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {eco.focus.slice(0, 3).map(f => (
            <span key={f} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${eco.accentColor}20`, color: eco.color }}>
              {f}
            </span>
          ))}
          {eco.focus.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">+{eco.focus.length - 3} more</span>
          )}
        </div>

        <p className={cn("text-sm text-gray-600 leading-relaxed", !expanded && "line-clamp-3")}>{eco.description}</p>

        {eco.description.length > 120 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-brand-600 hover:text-brand-700 font-semibold mt-1 flex items-center gap-0.5">
            {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Read more</>}
          </button>
        )}

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-600">Manager: <strong>{eco.manager}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-600">{eco.startupCount} startups · Founded {eco.founded}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {eco.highlights.map(h => (
                <span key={h} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{h}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {eco.website && (
            <a href={eco.website} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              <ExternalLink className="w-3 h-3" /> Visit Site
            </a>
          )}
          {!eco.claimed && eco.inviteCode && (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-gray-50 border border-dashed border-gray-300 text-gray-400 cursor-not-allowed">
              Claim Workspace
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PartnersTab() {
  const us = PARTNER_ECOSYSTEMS.filter(e => e.country === "US");
  const ca = PARTNER_ECOSYSTEMS.filter(e => e.country === "CA");
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          🇺🇸 US Partner Ecosystems
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{us.length} programs</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {us.map(e => <EcosystemCard key={e.id} eco={e} />)}
        </div>
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          🇨🇦 Canadian Partner Ecosystems
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{ca.length} programs</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ca.map(e => <EcosystemCard key={e.id} eco={e} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Browse Programs Tab ──────────────────────────────────────────────────────

function ProgramCard({ program, expanded, onToggle }: { program: Accelerator; expanded: boolean; onToggle: () => void }) {
  const colors = ["#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4","#6366f1","#14b8a6"];
  let hash = 0;
  for (let i = 0; i < program.name.length; i++) hash = program.name.charCodeAt(i) + ((hash << 5) - hash);
  const color = colors[Math.abs(hash) % colors.length];
  const isRolling = program.deadline.toLowerCase().includes("rolling");

  return (
    <div className={cn("bg-white border rounded-xl overflow-hidden shadow-sm transition-all", expanded ? "border-brand-300" : "border-gray-200 hover:border-gray-300")}>
      <div className="p-5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: color }}>
            {program.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{program.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{program.org}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs">{getFlag(program.country)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-gray-600">
              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-green-600" />{program.investment}</span>
              {program.equity !== "Not specified" && <span className="text-gray-400">· {program.equity} equity</span>}
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-500" />
                <span className={isRolling ? "text-green-600 font-semibold" : ""}>{isRolling ? "Rolling" : program.deadline}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {program.focus.slice(0, 3).map(f => (
                <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
              ))}
              {program.focus.length > 3 && <span className="text-xs text-gray-400">+{program.focus.length - 3}</span>}
            </div>
          </div>
        </div>

        <button onClick={onToggle} className="mt-3 w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors">
          <span>{expanded ? "Hide details" : "View details"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">{program.description}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="font-semibold text-gray-600 text-xs uppercase tracking-wide">Location</span><p className="mt-1 text-gray-800">{program.location}</p></div>
            <div><span className="font-semibold text-gray-600 text-xs uppercase tracking-wide">Duration</span><p className="mt-1 text-gray-800">{program.duration}</p></div>
          </div>
          {program.requirements.length > 0 && (
            <div>
              <span className="font-semibold text-gray-600 text-xs uppercase tracking-wide">Requirements</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {program.requirements.map(r => (
                  <span key={r} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded">
                    {ARTIFACT_LABELS[r] || r}
                  </span>
                ))}
              </div>
            </div>
          )}
          {program.alumni.length > 0 && (
            <div>
              <span className="font-semibold text-gray-600 text-xs uppercase tracking-wide">Alumni</span>
              <ul className="mt-1 space-y-0.5">
                {program.alumni.map(a => <li key={a} className="text-sm text-gray-700">· {a}</li>)}
              </ul>
            </div>
          )}
          <a href={program.website} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors">
            <ExternalLink className="w-3 h-3" /> Visit Program Website
          </a>
        </div>
      )}
    </div>
  );
}

function BrowseTab() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const regions = useMemo(() => Array.from(new Set(ACCELERATORS.map(a => a.region))).sort(), []);

  const filtered = useMemo(() => {
    let list = ACCELERATORS;
    if (regionFilter !== "all") list = list.filter(a => a.region === regionFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.org.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.focus.some(f => f.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, regionFilter]);

  const stats = useMemo(() => {
    const rolling = ACCELERATORS.filter(a => a.deadline.toLowerCase().includes("rolling")).length;
    const regionCount = new Set(ACCELERATORS.map(a => a.region)).size;
    return { total: ACCELERATORS.length, regions: regionCount, rolling };
  }, []);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Programs", value: stats.total },
          { label: "Regions Covered", value: stats.regions },
          { label: "Rolling Deadlines", value: stats.rolling },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-brand-600">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Search programs..." value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <select
            className="pl-8 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white appearance-none"
            value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
          >
            <option value="all">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{REGION_NAMES[r] || r}</option>)}
          </select>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">{filtered.length} program{filtered.length !== 1 ? "s" : ""} found</p>

      <div className="space-y-3">
        {filtered.map(program => (
          <ProgramCard
            key={program.id}
            program={program}
            expanded={expandedId === program.id}
            onToggle={() => setExpandedId(expandedId === program.id ? null : program.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No programs match your search</p>
            <button onClick={() => { setSearch(""); setRegionFilter("all"); }} className="text-xs text-brand-600 hover:underline mt-1">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── My Application Profile Tab ───────────────────────────────────────────────

const PROFILE_ARTIFACTS = [
  { key: "business-plan", label: "Business Plan", emoji: "📄" },
  { key: "pitch-deck", label: "Pitch Deck", emoji: "📊" },
  { key: "video-pitch", label: "Video Pitch", emoji: "🎥" },
  { key: "mvp-demo", label: "MVP Demo", emoji: "💻" },
  { key: "team-bios", label: "Team Bios", emoji: "👥" },
  { key: "financial-projections", label: "Financial Projections", emoji: "📈" },
  { key: "customer-traction", label: "Customer Traction Data", emoji: "📋" },
  { key: "prototype-mvp", label: "Working Prototype", emoji: "🔧" },
  { key: "letter-of-intent", label: "Letters of Intent", emoji: "📝" },
];

type ArtifactStatus = "done" | "in-progress" | "not-started";

function ProfileTab() {
  const [profile, setProfile] = useState<Record<string, ArtifactStatus>>({});

  const doneCount = Object.values(profile).filter(v => v === "done").length;

  function cycle(key: string) {
    const current = profile[key] || "not-started";
    const next: ArtifactStatus = current === "not-started" ? "in-progress" : current === "in-progress" ? "done" : "not-started";
    setProfile(prev => ({ ...prev, [key]: next }));
  }

  const STATUS_CONFIG: Record<ArtifactStatus, { label: string; cls: string }> = {
    "done": { label: "✅ Done", cls: "bg-green-100 text-green-700" },
    "in-progress": { label: "🔄 In Progress", cls: "bg-yellow-100 text-yellow-700" },
    "not-started": { label: "⬜ Not Started", cls: "bg-gray-100 text-gray-500" },
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Application Readiness Profile</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track which application materials you have ready</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-600">{doneCount}/{PROFILE_ARTIFACTS.length}</p>
          <p className="text-xs text-gray-500">materials ready</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${(doneCount / PROFILE_ARTIFACTS.length) * 100}%` }} />
      </div>

      <div className="space-y-3">
        {PROFILE_ARTIFACTS.map(a => {
          const status = profile[a.key] || "not-started";
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={a.key} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-xl">{a.emoji}</span>
                <span className="text-sm font-semibold text-gray-800">{a.label}</span>
              </div>
              <button onClick={() => cycle(a.key)} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer", cfg.cls)}>
                {cfg.label}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4">Click any status to cycle through: Not Started → In Progress → Done</p>
    </div>
  );
}

// ─── Application Tracker Tab ──────────────────────────────────────────────────

interface TrackedApp {
  id: number;
  programName: string;
  org: string;
  status: "researching" | "preparing" | "submitted" | "interview" | "accepted" | "declined";
  notes: string;
  addedAt: string;
}

const STATUS_LABELS: Record<TrackedApp["status"], string> = {
  researching: "Researching",
  preparing: "Preparing",
  submitted: "Submitted",
  interview: "Interview",
  accepted: "Accepted",
  declined: "Declined",
};

const STATUS_COLORS: Record<TrackedApp["status"], string> = {
  researching: "bg-gray-100 text-gray-600",
  preparing: "bg-blue-100 text-blue-700",
  submitted: "bg-yellow-100 text-yellow-700",
  interview: "bg-purple-100 text-purple-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
};

function TrackerTab() {
  const [apps, setApps] = useState<TrackedApp[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newProgram, setNewProgram] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newNotes, setNewNotes] = useState("");

  function addApp() {
    if (!newProgram.trim()) return;
    setApps(prev => [...prev, {
      id: Date.now(),
      programName: newProgram.trim(),
      org: newOrg.trim() || "—",
      status: "researching",
      notes: newNotes.trim(),
      addedAt: new Date().toLocaleDateString(),
    }]);
    setNewProgram(""); setNewOrg(""); setNewNotes("");
    setShowAdd(false);
  }

  function updateStatus(id: number, status: TrackedApp["status"]) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  function remove(id: number) {
    setApps(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Application Tracker</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track your accelerator applications in one place</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors">
          + Add Application
        </button>
      </div>

      {showAdd && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Add New Application</h3>
          <div className="space-y-3">
            <input type="text" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Program name *" value={newProgram} onChange={e => setNewProgram(e.target.value)} />
            <input type="text" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Organization" value={newOrg} onChange={e => setNewOrg(e.target.value)} />
            <textarea className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              rows={2} placeholder="Notes (optional)" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={addApp} className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors">Add</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {apps.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-semibold text-gray-600">No applications tracked yet</p>
          <p className="text-sm text-gray-400 mt-1">Add programs you are researching or applying to</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm">{app.programName}</h3>
                <p className="text-xs text-gray-500">{app.org} · Added {app.addedAt}</p>
                {app.notes && <p className="text-xs text-gray-600 mt-1 italic">{app.notes}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={app.status}
                  onChange={e => updateStatus(app.id, e.target.value as TrackedApp["status"])}
                  className={cn("text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500", STATUS_COLORS[app.status])}
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={() => remove(app.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AcceleratorsPage() {
  const [tab, setTab] = useState<Tab>("partners");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Accelerator Hub</h1>
        <p className="text-gray-500 mt-1">Discover accelerator programs, explore partner ecosystems, and track your applications.</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "partners" && <PartnersTab />}
      {tab === "browse" && <BrowseTab />}
      {tab === "profile" && <ProfileTab />}
      {tab === "tracker" && <TrackerTab />}
    </div>
  );
}
