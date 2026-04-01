import PageHeader from "@/components/PageHeader";
import TrendBadge from "@/components/TrendBadge";
import { foundersJourneyStages } from "@/data/content";

const stageColors: Record<string, string> = {
  green: "border-green-500/30 bg-green-500/5",
  blue: "border-blue-500/30 bg-blue-500/5",
  amber: "border-amber-500/30 bg-amber-500/5",
  purple: "border-purple-500/30 bg-purple-500/5",
  teal: "border-teal-500/30 bg-teal-500/5",
  red: "border-red-500/30 bg-red-500/5",
};

const stageNumberColors: Record<string, string> = {
  green: "text-green-400 bg-green-500/10 border-green-500/30",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  teal: "text-teal-400 bg-teal-500/10 border-teal-500/30",
  red: "text-red-400 bg-red-500/10 border-red-500/30",
};

type BadgeColor = "green" | "blue" | "amber" | "teal" | "purple" | "orange" | "cyan" | "red";

export default function FoundersJourneyPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Founder's Journey"
        description="A stage-by-stage roadmap for AgTech founders — from identifying a problem to raising growth capital. Each stage includes key actions, resources, and milestones."
        icon="🚀"
      />

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-green-500/50 via-purple-500/30 to-red-500/50 hidden md:block" />

        <div className="space-y-6">
          {foundersJourneyStages.map((stage) => (
            <div key={stage.stage} className="relative flex gap-6 md:gap-8">
              {/* Stage number bubble */}
              <div className="flex-shrink-0 relative z-10">
                <div
                  className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center ${stageNumberColors[stage.color]}`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">Stage</span>
                  <span className="text-xl font-black leading-none">{stage.stage}</span>
                </div>
              </div>

              {/* Content card */}
              <div className={`flex-1 rounded-xl border p-5 ${stageColors[stage.color]}`}>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{stage.title}</h3>
                    <p className="text-xs text-gray-400">{stage.subtitle}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg px-3 py-1 border border-white/10">
                    <p className="text-xs text-gray-300">🏁 {stage.milestone}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-4 leading-relaxed">{stage.description}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Key Actions */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Actions</p>
                    <ul className="space-y-1.5">
                      {stage.actions.map((action) => (
                        <li key={action} className="flex items-start gap-2 text-xs text-gray-300">
                          <span className="text-brand-500 mt-0.5 flex-shrink-0">✓</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resources */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Resources</p>
                    <ul className="space-y-1.5">
                      {stage.resources.map((resource) => (
                        <li key={resource} className="flex items-start gap-2 text-xs text-gray-300">
                          <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand-900/30 border border-brand-700/30 rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">Not sure where you are in the journey?</p>
        <p className="text-sm text-gray-400 mb-4">Book a call with Russell to get a personalized assessment of your stage and what to focus on next.</p>
        <a
          href="/book-a-call"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          📞 Book a Call with Russell →
        </a>
      </div>
    </div>
  );
}
