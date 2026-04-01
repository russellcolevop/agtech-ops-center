import { Phone, Clock, Globe, CheckCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const callTypes = [
  {
    title: "Founder Intro Call",
    duration: "30 min",
    description: "Best for founders who are exploring the AgTech space or early in their journey. We'll discuss your idea, assess market fit, and identify your next steps.",
    topics: [
      "Problem validation and market sizing",
      "AgTech landscape overview",
      "Identifying your ideal customer",
      "Resources and next steps",
    ],
    cta: "Book a 30-min Intro",
    highlight: false,
  },
  {
    title: "Strategy Deep Dive",
    duration: "60 min",
    description: "For founders who have a defined product and are working on GTM, fundraising, or scaling strategy. Come prepared with your pitch deck or business overview.",
    topics: [
      "Go-to-market strategy for AgTech",
      "Investor readiness assessment",
      "Competitive positioning",
      "Scaling into new regions or segments",
    ],
    cta: "Book a 60-min Deep Dive",
    highlight: true,
  },
];

const whatToExpect = [
  "No fluff — direct, actionable feedback",
  "AgTech-specific insights backed by real industry data",
  "Connections to relevant investors, accelerators, or advisors",
  "Clear action items you can execute immediately",
];

export default function BookACallPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <PageHeader
        title="Book a Call with Russell"
        description="Get direct, no-BS advice on your AgTech startup. Whether you're exploring an idea or preparing for your Series A, let's figure out your next move together."
        icon="📞"
      />

      {/* Call types */}
      <div className="grid md:grid-cols-2 gap-5">
        {callTypes.map((call) => (
          <div
            key={call.title}
            className={`rounded-xl border p-6 relative ${
              call.highlight
                ? "bg-brand-900/30 border-brand-600/40"
                : "bg-white/5 border-white/10"
            }`}
          >
            {call.highlight && (
              <div className="absolute top-4 right-4">
                <span className="text-xs px-2.5 py-1 bg-brand-600 text-white rounded-full font-medium">Most Popular</span>
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${call.highlight ? "bg-brand-700" : "bg-white/10"}`}>
                <Phone className={`w-5 h-5 ${call.highlight ? "text-brand-300" : "text-gray-400"}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{call.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{call.duration}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-4">{call.description}</p>

            <div className="space-y-2 mb-5">
              {call.topics.map((topic) => (
                <div key={topic} className="flex items-start gap-2 text-xs text-gray-400">
                  <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${call.highlight ? "text-brand-400" : "text-gray-600"}`} />
                  <span>{topic}</span>
                </div>
              ))}
            </div>

            <button
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                call.highlight
                  ? "bg-brand-600 hover:bg-brand-500 text-white"
                  : "bg-white/10 hover:bg-white/15 text-white"
              }`}
            >
              {call.cta} →
            </button>
          </div>
        ))}
      </div>

      {/* What to expect */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h2 className="text-base font-semibold text-white mb-4">What to Expect</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {whatToExpect.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Russell */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-900/50 border border-brand-700/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">👨‍🌾</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white mb-1">About Russell</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Russell is an AgTech founder and operator with experience across the agricultural technology ecosystem globally.
              He built this platform to help founders navigate the complex, opportunity-rich world of AgTech — from first idea to funded startup.
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <Globe className="w-3.5 h-3.5" />
              <span>Available for founders globally</span>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for calendar embed */}
      <div className="bg-slate-900/80 rounded-xl border border-white/10 p-8 text-center">
        <p className="text-lg mb-2">📅</p>
        <p className="text-white font-semibold mb-2">Calendar booking coming soon</p>
        <p className="text-sm text-gray-400 mb-4">
          In the meantime, send a direct message or use the feedback form to request a time.
        </p>
        <a
          href="mailto:russellcolevop@gmail.com?subject=AgTech Ops Center — Call Request"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          📧 Email Russell to Schedule →
        </a>
      </div>
    </div>
  );
}
