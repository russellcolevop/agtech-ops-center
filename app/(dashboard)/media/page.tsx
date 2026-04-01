import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TrendBadge from "@/components/TrendBadge";
import { agTechMedia } from "@/data/content";

type BadgeColor = "green" | "blue" | "amber" | "teal" | "purple" | "orange" | "cyan" | "red";

const categoryColors: Record<string, BadgeColor> = {
  Podcasts: "purple",
  Newsletters: "blue",
  "Key Influencers": "green",
  "Reports & Research": "amber",
};

export default function MediaPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="AgTech Media & Influencers"
        description="The essential podcasts, newsletters, thought leaders, and research sources every AgTech founder should follow."
        icon="📡"
      />

      {agTechMedia.map((section) => (
        <section key={section.category}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">{section.icon}</span>
            <h2 className="text-base font-semibold text-white">{section.category}</h2>
            <TrendBadge label={`${section.items.length} sources`} color={categoryColors[section.category] || "green"} />
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
                <p className="text-xs text-brand-400 mb-2">{item.host}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </a>
            ))}
          </div>
        </section>
      ))}

      {/* Suggest addition */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">Know a great resource we're missing?</p>
        <p className="text-sm text-gray-400 mb-4">We're always looking to expand this list with high-quality AgTech media.</p>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfhY5p0D4PQRlke2rH_9Rbe-4dCObvufSfNoMaQTjdbc3vnzQ/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Suggest a Resource →
        </a>
      </div>
    </div>
  );
}
