import { FileText, Download, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TrendBadge from "@/components/TrendBadge";

type BadgeColor = "green" | "blue" | "amber" | "teal" | "purple" | "orange" | "cyan" | "red";

const documentCategories = [
  {
    category: "Pitch & Fundraising",
    icon: "💰",
    color: "blue" as BadgeColor,
    documents: [
      { title: "AgTech Investor Pitch Deck Template", description: "A proven pitch deck structure tailored for AgTech startups raising Seed to Series A.", type: "PPTX", tag: "Template" },
      { title: "AgTech VC One-Pager Template", description: "One-page executive summary format preferred by leading AgTech VCs.", type: "DOCX", tag: "Template" },
      { title: "Financial Model Template for AgTech SaaS", description: "5-year financial model with AgTech-specific assumptions and metrics.", type: "XLSX", tag: "Template" },
      { title: "Data Room Checklist", description: "Everything investors expect to see in a Series A data room.", type: "PDF", tag: "Guide" },
    ],
  },
  {
    category: "Go-to-Market",
    icon: "🚀",
    color: "green" as BadgeColor,
    documents: [
      { title: "AgTech GTM Playbook", description: "Step-by-step guide to acquiring your first 100 farm customers.", type: "PDF", tag: "Playbook" },
      { title: "Farmer Interview Script", description: "Proven customer discovery interview questions for agtech founders.", type: "DOCX", tag: "Template" },
      { title: "Letter of Intent (LOI) Template", description: "Non-binding LOI template to validate demand before building.", type: "DOCX", tag: "Template" },
      { title: "AgTech Pricing Strategy Guide", description: "How to price your product for farmers, co-ops, and enterprise buyers.", type: "PDF", tag: "Guide" },
    ],
  },
  {
    category: "Legal & Compliance",
    icon: "⚖️",
    color: "amber" as BadgeColor,
    documents: [
      { title: "Farm Data Privacy Agreement Template", description: "Transparent data ownership agreement that builds farmer trust.", type: "DOCX", tag: "Template" },
      { title: "Pilot Agreement Template", description: "Risk-free pilot agreement structure for field trials.", type: "DOCX", tag: "Template" },
      { title: "AgTech Regulatory Overview (Canada)", description: "Key regulations affecting AgTech products sold in Canada.", type: "PDF", tag: "Reference" },
      { title: "IP Protection for AgTech Innovations", description: "Guide to patents, trade secrets, and IP strategy for ag startups.", type: "PDF", tag: "Guide" },
    ],
  },
  {
    category: "Market Research",
    icon: "📊",
    color: "purple" as BadgeColor,
    documents: [
      { title: "Global AgTech Market Landscape Map", description: "Visual landscape of AgTech categories, players, and investment trends.", type: "PDF", tag: "Research" },
      { title: "Canadian AgTech Ecosystem Report", description: "Comprehensive overview of Canada's AgTech startups, investors, and programs.", type: "PDF", tag: "Research" },
      { title: "Farmer Technology Adoption Benchmark", description: "Survey data on how and why farmers adopt new technology.", type: "PDF", tag: "Research" },
      { title: "AgTech Competitive Analysis Framework", description: "Template for mapping competitors and positioning your solution.", type: "XLSX", tag: "Template" },
    ],
  },
];

const tagColorMap: Record<string, BadgeColor> = {
  Template: "blue",
  Guide: "green",
  Playbook: "teal",
  Reference: "amber",
  Research: "purple",
};

const typeColors: Record<string, string> = {
  PDF: "text-red-400 bg-red-500/10",
  DOCX: "text-blue-400 bg-blue-500/10",
  PPTX: "text-orange-400 bg-orange-500/10",
  XLSX: "text-green-400 bg-green-500/10",
};

export default function DocumentsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Documents & Templates"
        description="Curated templates, guides, and research documents for AgTech founders. Download and customize for your startup."
        icon="📄"
      />

      {/* Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <span className="text-blue-400 text-lg flex-shrink-0">ℹ️</span>
        <div>
          <p className="text-sm font-medium text-blue-300">Document library is being built</p>
          <p className="text-xs text-blue-300/60 mt-0.5">
            Documents listed below are coming soon. Sign in to get notified when new resources are added. Want to contribute a template or guide?{" "}
            <a href="/book-a-call" className="underline hover:text-blue-200">Book a call with Russell</a>.
          </p>
        </div>
      </div>

      {documentCategories.map((cat) => (
        <section key={cat.category}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">{cat.icon}</span>
            <h2 className="text-base font-semibold text-white">{cat.category}</h2>
            <TrendBadge label={`${cat.documents.length} resources`} color={cat.color} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {cat.documents.map((doc) => (
              <div
                key={doc.title}
                className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/8 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-white leading-tight">{doc.title}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${typeColors[doc.type] || "text-gray-400 bg-white/5"}`}>
                          {doc.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{doc.description}</p>
                    <div className="flex items-center justify-between">
                      <TrendBadge label={doc.tag} color={tagColorMap[doc.tag] || "green"} />
                      <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">Coming soon</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
