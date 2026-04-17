"use client";

import { useState } from "react";
import { Download, ExternalLink, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const DOC_BASE = "https://russellcolevop.github.io/agtech-ops-center/docs/";

const TEMPLATES = [
  { title: "FAST Advisor Agreement", desc: "Advisor equity grant with vesting schedule, expectations, and IP assignment. FAST framework.", url: DOC_BASE + "00_FAST_Advisor_Agreement.docx", type: "DOCX" },
  { title: "Confidentiality Agreement (NDA)", desc: "Mutual NDA for conversations with investors, partners, and potential hires.", url: DOC_BASE + "01_Mutual_NDA_Template.docx", type: "DOCX" },
  { title: "Independent Contractor Agreement", desc: "Scope, deliverables, IP ownership, payment terms, and termination clauses.", url: DOC_BASE + "02_Independent_Contractor_Agreement.docx", type: "DOCX" },
  { title: "Pilot Agreement Template", desc: "Farm trial agreement — scope, timeline, success metrics, data ownership, and path to paid contract.", url: DOC_BASE + "03_AgTech_Pilot_Agreement.docx", type: "DOCX" },
  { title: "Customer Discovery Call Script", desc: "15-question interview guide for problem validation before you build.", url: DOC_BASE + "04_Customer_Discovery_Call_Script.docx", type: "DOCX" },
  { title: "Cap Table (Excel)", desc: "Track equity across founders, investors, and option pool. Auto-calculates dilution across rounds.", url: DOC_BASE + "05_Cap_Table_Template.docx", type: "XLSX" },
];

const COMING_SOON = [
  { title: "Pitch Deck Template", desc: "AgTech investor pitch deck with proven structure for Seed–Series A." },
  { title: "SAFE Agreement", desc: "Simple Agreement for Future Equity, startup-friendly format." },
  { title: "Financial Model (Excel)", desc: "5-year projections with AgTech-specific assumptions and metrics." },
  { title: "Data Room Organization Template", desc: "Everything investors expect in a Series A data room." },
  { title: "SaaS Subscription Agreement", desc: "Software subscription terms built for farm customers." },
  { title: "OKR Planning Template", desc: "Quarterly goal framework for agtech startup teams." },
];

interface AiTool {
  name: string;
  url: string;
  icon: string;
  what: string;
  prompt: string;
}

interface AiCategory {
  id: string;
  icon: string;
  title: string;
  sub: string;
  tools: AiTool[];
  warning?: string;
}

const AI_CATEGORIES: AiCategory[] = [
  {
    id: "pitch",
    icon: "🎯",
    title: "Pitch Decks & Presentations",
    sub: "The best tools for visual slide decks",
    tools: [
      { name: "Google Slides + Gemini", url: "https://workspace.google.com/products/slides/", icon: "🟡", what: "Best for: investor pitch decks, demo day presentations, board updates", prompt: `"Create a 12-slide AgTech startup pitch deck for [your product]. Include: problem (farmers struggle with X), solution, market size ($22B+ AgTech market), business model (SaaS + hardware), traction, team, and funding ask of $[amount]. Make it clean and professional."` },
      { name: "Gamma.app", url: "https://gamma.app/", icon: "🟣", what: "Best for: quick beautiful decks from a text outline", prompt: `"Generate a pitch deck for an AgTech startup that does [your product]. Target audience: Series A investors. Emphasize: farm trial results, unit economics, and path to $10M ARR. Modern, minimal design."` },
      { name: "Claude (Artifacts)", url: "https://claude.ai/", icon: "🟠", what: "Best for: deck content strategy, slide-by-slide copywriting", prompt: `"I'm building a pitch deck for my AgTech startup [name]. We [description]. Help me write the narrative arc and content for each slide. Include speaker notes. My audience is [investor type]."` },
    ],
  },
  {
    id: "legal",
    icon: "⚖️",
    title: "Legal & Agreements",
    sub: "Generate customized legal documents",
    tools: [
      { name: "Claude", url: "https://claude.ai/", icon: "🟠", what: "Best for: NDAs, SAFEs, IP agreements, contractor terms, vesting schedules", prompt: `"Draft a mutual NDA between [Company A] and [Company B] for exploring a potential [partnership/investment/pilot]. Include: 2-year term, mutual obligations, carve-outs for publicly available info, and governing law of [state/province]. Format as a professional legal document."` },
      { name: "ChatGPT", url: "https://chatgpt.com/", icon: "🟢", what: "Best for: explaining legal terms, redlining contracts, alternative clause suggestions", prompt: `"Review this [type of agreement] and explain each clause in plain English. Flag any terms that are unusual or unfavorable for an early-stage startup. Suggest alternatives where appropriate."` },
    ],
    warning: "⚠️ AI-generated legal documents are a starting point. Have a lawyer review before signing anything material.",
  },
  {
    id: "finance",
    icon: "📊",
    title: "Financial Models & Spreadsheets",
    sub: "Build projections and cap tables",
    tools: [
      { name: "Claude (Artifacts)", url: "https://claude.ai/", icon: "🟠", what: "Best for: generating complete Excel-ready financial models with formulas", prompt: `"Build a 3-year financial projection for an AgTech SaaS startup. Assumptions: $99/mo per farm, 10% monthly growth starting from 15 customers, 85% gross margin, 2 FTEs year 1 growing to 8 by year 3. Include: revenue, COGS, opex, EBITDA, cash runway. Output as a table I can paste into Excel."` },
      { name: "Google Sheets + Gemini", url: "https://sheets.google.com/", icon: "🟡", what: "Best for: interactive spreadsheets with formulas, scenario modeling", prompt: `"Create a cap table spreadsheet for a startup with 2 co-founders (60/40 split), a 10% option pool, and a $1.5M SAFE at $8M post-money cap. Show dilution after seed round of $2M at $10M pre-money valuation."` },
    ],
  },
  {
    id: "content",
    icon: "✍️",
    title: "Marketing, Copy & Content",
    sub: "Write blog posts, emails, and social content",
    tools: [
      { name: "Claude", url: "https://claude.ai/", icon: "🟠", what: "Best for: long-form content, blog posts, email sequences, grant applications", prompt: `"Write a 1,500-word blog post about [AgTech topic] targeting [audience]. Tone: authoritative but accessible. Include: real data points, practical takeaways, and a CTA to [action]. Optimize for SEO around [keywords]."` },
      { name: "ChatGPT", url: "https://chatgpt.com/", icon: "🟢", what: "Best for: social media posts, ad copy, quick marketing variations", prompt: `"Write 5 LinkedIn posts promoting our AgTech product [description] targeting [audience]. Mix: 2 thought leadership, 2 product-focused, 1 customer story. Keep each under 200 words. Professional but approachable tone."` },
    ],
  },
  {
    id: "design",
    icon: "🎨",
    title: "Images, Logos & Visual Assets",
    sub: "Generate visual content for your brand",
    tools: [
      { name: "Nano Banana", url: "https://nanobanana.com/", icon: "🍌", what: "Best for: product mockups, marketing visuals, social media graphics", prompt: `"Create a professional marketing image for an AgTech startup showing [describe scene: e.g., drone flying over wheat field with data overlay on screen]. Clean, modern, tech-forward aesthetic. 16:9 ratio."` },
      { name: "Canva", url: "https://canva.com/", icon: "🔵", what: "Best for: branded templates, social cards, one-pagers with your logo", prompt: `"Use Canva's AI to generate a one-page product overview for [your AgTech product]. Include: hero image, 3 key features, pricing, and contact info. Use green/earth tones."` },
    ],
  },
  {
    id: "ops",
    icon: "⚡",
    title: "Operations & Strategy",
    sub: "Plan, hire, and run your startup",
    tools: [
      { name: "Claude", url: "https://claude.ai/", icon: "🟠", what: "Best for: OKR planning, hiring scorecards, board meeting prep, strategy docs", prompt: `"Create a quarterly OKR plan for an AgTech startup in [stage]. Our top priorities are: [list 3]. For each objective, give me 3 measurable key results with targets. Format as a table."` },
      { name: "Notion AI", url: "https://notion.so/", icon: "⚫", what: "Best for: team wikis, project management, meeting notes, SOPs", prompt: `"Build a Notion template for an AgTech startup operations hub. Sections: weekly team standup, OKR tracker, customer pipeline, product roadmap, and investor updates. Include suggested properties and views."` },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      title="Copy prompt"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ToolCard({ tool }: { tool: AiTool }) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{tool.icon}</span>
        <a href={tool.url} target="_blank" rel="noopener noreferrer"
          className="font-bold text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
          {tool.name} <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <p className="text-xs font-semibold text-gray-700 mb-2">{tool.what}</p>
      <div className="relative">
        <div className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg p-3 font-mono leading-relaxed pr-8 whitespace-pre-wrap">
          {tool.prompt}
        </div>
        <div className="absolute top-2 right-2">
          <CopyButton text={tool.prompt.replace(/^"|"$/g, "")} />
        </div>
      </div>
    </div>
  );
}

function AICategory({ cat }: { cat: AiCategory }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-xl">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">{cat.title}</p>
          <p className="text-xs text-gray-500">{cat.sub}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 p-5">
          <div className="grid md:grid-cols-2 gap-3">
            {cat.tools.map(t => <ToolCard key={t.name} tool={t} />)}
          </div>
          {cat.warning && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 italic">
              {cat.warning}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const typeColors: Record<string, string> = {
  DOCX: "text-blue-600 bg-blue-50 border-blue-200",
  XLSX: "text-green-600 bg-green-50 border-green-200",
};

export default function DocumentsPage() {
  const { data: session } = useSession();
  const signedIn = !!session?.user;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Founder Toolkit</h1>
        <p className="text-gray-500 mt-1">
          Curated AgTech templates ready to download, plus AI tool recommendations so you can generate anything else in minutes.
          {!signedIn && (
            <> <a href="/login" className="text-brand-600 font-semibold hover:underline">Sign in</a> to download.</>
          )}
        </p>
      </div>

      {/* Ready-to-Use Templates */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-lg text-white flex-shrink-0">📄</div>
          <div>
            <h2 className="font-bold text-gray-900">Ready-to-Use Templates</h2>
            <p className="text-xs text-gray-500">{TEMPLATES.length} AgTech-specific documents — reviewed, formatted, and ready to customize</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          {TEMPLATES.map(doc => (
            <div key={doc.title} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{doc.title}</p>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border font-mono flex-shrink-0", typeColors[doc.type])}>
                    {doc.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{doc.desc}</p>
                {signedIn ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                ) : (
                  <a
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Sign in to download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* AI Tool Guide */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-lg text-white flex-shrink-0">🤖</div>
          <div>
            <h2 className="font-bold text-gray-900">AI Tool Guide for Founders</h2>
            <p className="text-xs text-gray-500">The right AI tool + the right prompt = any document you need in minutes</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-4">
          You don&apos;t need to wait for us to build every template. Here&apos;s which AI tools to use for each type of founder document, with exact prompts you can copy and paste.
        </p>

        <div className="space-y-3">
          {AI_CATEGORIES.map(cat => <AICategory key={cat.id} cat={cat} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-1">Need something else?</h3>
        <p className="text-sm text-gray-500 mb-4">Tell us what you&apos;re trying to build and we&apos;ll point you to the right tool — or build it for you.</p>
        <a
          href="mailto:russellcolevop@gmail.com?subject=Founder Toolkit Request"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> Email Russell
        </a>
      </section>
    </div>
  );
}
