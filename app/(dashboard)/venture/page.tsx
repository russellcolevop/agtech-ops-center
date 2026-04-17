"use client";

import { useState } from "react";
import { CheckCircle, ChevronRight, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

const AG_SECTORS = [
  "Precision Agriculture","Crop Protection","Animal Health","Food Safety",
  "Supply Chain","Water Management","Biological Inputs","Robotics & Automation",
  "Data & Analytics","Marketplace/Platform","Climate & Sustainability","Other",
];
const MARKET_SIZES = ["<$100M","$100M-$500M","$500M-$1B","$1B-$5B","$5B+","Not sure"];
const STAGE_OPTIONS = ["Just an idea","Doing research","Building MVP","Have MVP","Have paying customers","Scaling"];
const NEEDS_OPTIONS = ["Technical co-founder","Funding/investment","Mentorship","Market validation","First customers/pilots","Regulatory guidance","Go-to-market strategy","Other"];
const GEO_OPTIONS = ["North America","Europe","Asia-Pacific","Latin America","Middle East/Africa","Global"];
const TIMELINE_OPTIONS = ["Already launched","0-3 months","3-6 months","6-12 months","12+ months"];

interface VentureForm {
  name: string;
  pitch: string;
  description: string;
  sector: string;
  problem: string;
  customers: string;
  marketSize: string;
  competitors: string;
  founderName: string;
  founderEmail: string;
  background: string;
  hasCoFounders: boolean;
  coFounders: string;
  linkedinUrl: string;
  stage: string;
  needs: string[];
  geos: string[];
  accelerator: string;
  timeline: string;
  notes: string;
}

const EMPTY_FORM: VentureForm = {
  name:"", pitch:"", description:"", sector:"",
  problem:"", customers:"", marketSize:"", competitors:"",
  founderName:"", founderEmail:"", background:"",
  hasCoFounders:false, coFounders:"", linkedinUrl:"",
  stage:"", needs:[], geos:[], accelerator:"", timeline:"", notes:"",
};

const STEP_LABELS = ["Your Idea","Market & Problem","You & Your Team","Goals & Needs","Review & Submit"];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {STEP_LABELS.map((label, i) => {
        const isComplete = i < step;
        const isActive = i === step;
        return (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className="relative flex items-center w-full">
              {i > 0 && (
                <div className={cn("flex-1 h-0.5 -ml-2", i <= step ? "bg-brand-600" : "bg-gray-200")} />
              )}
              <div className={cn(
                "w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold z-10 flex-shrink-0",
                isComplete ? "bg-brand-100 border-brand-600 text-brand-700"
                : isActive ? "bg-brand-100 border-brand-600 text-brand-700"
                : "bg-gray-50 border-gray-300 text-gray-400"
              )}>
                {isComplete ? <CheckCircle className="w-4 h-4 text-brand-600" /> : i + 1}
              </div>
              {i < 4 && (
                <div className={cn("flex-1 h-0.5 -mr-2", i < step ? "bg-brand-600" : "bg-gray-200")} />
              )}
            </div>
            <span className={cn("text-xs mt-2 text-center font-medium", isActive || isComplete ? "text-brand-700" : "text-gray-400")}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InputField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const textareaCls = `${inputCls} resize-y`;
const selectCls = `${inputCls}`;

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
        selected ? "bg-brand-600 text-white border-brand-600" : "bg-gray-50 text-gray-700 border-gray-300 hover:border-brand-400"
      )}
    >
      {label}
    </button>
  );
}

function NavButtons({ step, onBack, onNext, nextLabel = "Next →" }: { step: number; onBack?: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="flex gap-3 mt-8">
      {step > 0 && (
        <button type="button" onClick={onBack} className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg font-semibold text-sm transition-colors">
          ← Back
        </button>
      )}
      <button type="button" onClick={onNext} className="flex-1 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-sm transition-colors">
        {nextLabel}
      </button>
    </div>
  );
}

export default function VenturePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<VentureForm>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");

  function update<K extends keyof VentureForm>(key: K, value: VentureForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleArray(key: "needs" | "geos", value: string) {
    setForm(prev => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] };
    });
  }

  function validateStep1() {
    return form.name.trim() && form.pitch.trim() && form.description.trim() && form.sector;
  }

  function validateStep2() {
    return form.problem.trim() && form.customers.trim();
  }

  function validateStep3() {
    if (!form.founderName.trim() || !form.founderEmail.trim()) return false;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.founderEmail);
    if (!emailOk) { setEmailError("Please enter a valid email address"); return false; }
    setEmailError("");
    return true;
  }

  function handleNext() {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    if (step === 2 && !validateStep3()) return;
    setStep(s => s + 1);
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
        <p className="text-gray-600 mb-2">
          Thanks, <strong>{form.founderName}</strong>. We've received your idea for <strong>{form.name}</strong>.
        </p>
        <p className="text-gray-500 text-sm mb-8">Our team will review your submission and reach out to <strong>{form.founderEmail}</strong> within 5 business days.</p>
        <button
          onClick={() => { setSubmitted(false); setStep(0); setForm(EMPTY_FORM); }}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          Submit Another Idea
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Venture Studio</h1>
        <p className="text-gray-500 mt-1">Submit your idea and get matched with mentors, investors, and resources to accelerate your AgTech startup.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-3xl">
        <ProgressBar step={step} />

        {/* Step 1: Your Idea */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Your Idea</h2>
            <InputField label="Startup / Project Name" required>
              <input type="text" className={inputCls} value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g., GreenHarvest AI" />
            </InputField>
            <InputField label="One-Line Pitch (Elevator Pitch)" required>
              <textarea className={textareaCls} rows={2} value={form.pitch} onChange={e => update("pitch", e.target.value)} placeholder="What does your startup do in one sentence?" />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.pitch.length}/140</p>
            </InputField>
            <InputField label="Detailed Description" required>
              <textarea className={textareaCls} rows={4} value={form.description} onChange={e => update("description", e.target.value)} placeholder="Tell us more about your idea..." />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
            </InputField>
            <InputField label="Which AgTech Sector?" required>
              <select className={selectCls} value={form.sector} onChange={e => update("sector", e.target.value)}>
                <option value="">Select a sector...</option>
                {AG_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </InputField>
            <NavButtons step={step} onNext={handleNext} />
          </div>
        )}

        {/* Step 2: Market & Problem */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Market &amp; Problem</h2>
            <InputField label="What problem are you solving?" required>
              <textarea className={textareaCls} rows={3} value={form.problem} onChange={e => update("problem", e.target.value)} placeholder="Describe the problem..." />
            </InputField>
            <InputField label="Who are your target customers?" required>
              <textarea className={textareaCls} rows={3} value={form.customers} onChange={e => update("customers", e.target.value)} placeholder="Describe your ideal customer..." />
            </InputField>
            <InputField label="How big is the market opportunity?">
              <select className={selectCls} value={form.marketSize} onChange={e => update("marketSize", e.target.value)}>
                <option value="">Select market size...</option>
                {MARKET_SIZES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </InputField>
            <InputField label="Do you have any competitors? List them">
              <textarea className={textareaCls} rows={3} value={form.competitors} onChange={e => update("competitors", e.target.value)} placeholder="List your competitors..." />
            </InputField>
            <NavButtons step={step} onBack={() => setStep(0)} onNext={handleNext} />
          </div>
        )}

        {/* Step 3: You & Your Team */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">You &amp; Your Team</h2>
            <InputField label="Your Name" required>
              <input type="text" className={inputCls} value={form.founderName} onChange={e => update("founderName", e.target.value)} placeholder="Your full name" />
            </InputField>
            <InputField label="Your Email" required>
              <input type="email" className={inputCls} value={form.founderEmail} onChange={e => update("founderEmail", e.target.value)} placeholder="Your email" />
              {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
            </InputField>
            <InputField label="Your Background / Experience">
              <textarea className={textareaCls} rows={3} value={form.background} onChange={e => update("background", e.target.value)} placeholder="Tell us about your background..." />
            </InputField>
            <InputField label="Do you have co-founders?">
              <div className="flex gap-3">
                {["Yes","No"].map(opt => (
                  <button key={opt} type="button"
                    onClick={() => update("hasCoFounders", opt === "Yes")}
                    className={cn("flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors",
                      (opt === "Yes") === form.hasCoFounders
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:border-brand-400"
                    )}
                  >{opt}</button>
                ))}
              </div>
            </InputField>
            {form.hasCoFounders && (
              <InputField label="Co-founder Names & Roles">
                <textarea className={textareaCls} rows={2} value={form.coFounders} onChange={e => update("coFounders", e.target.value)} placeholder="e.g., John Smith (CTO), Jane Doe (Head of Sales)" />
              </InputField>
            )}
            <InputField label="Your LinkedIn URL">
              <input type="url" className={inputCls} value={form.linkedinUrl} onChange={e => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
            </InputField>
            <NavButtons step={step} onBack={() => setStep(1)} onNext={handleNext} />
          </div>
        )}

        {/* Step 4: Goals & Needs */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Goals &amp; Needs</h2>
            <InputField label="What stage is your idea?">
              <select className={selectCls} value={form.stage} onChange={e => update("stage", e.target.value)}>
                <option value="">Select a stage...</option>
                {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </InputField>
            <InputField label="What do you need most right now?">
              <div className="flex flex-wrap gap-2 mt-1">
                {NEEDS_OPTIONS.map(n => (
                  <ToggleChip key={n} label={n} selected={form.needs.includes(n)} onClick={() => toggleArray("needs", n)} />
                ))}
              </div>
            </InputField>
            <InputField label="Target Geography">
              <div className="flex flex-wrap gap-2 mt-1">
                {GEO_OPTIONS.map(g => (
                  <ToggleChip key={g} label={g} selected={form.geos.includes(g)} onClick={() => toggleArray("geos", g)} />
                ))}
              </div>
            </InputField>
            <InputField label="Interested in applying to accelerators?">
              <div className="flex gap-3">
                {["Yes","Maybe","No"].map(opt => (
                  <button key={opt} type="button"
                    onClick={() => update("accelerator", opt)}
                    className={cn("flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors",
                      form.accelerator === opt
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:border-brand-400"
                    )}
                  >{opt}</button>
                ))}
              </div>
            </InputField>
            <InputField label="Timeline — when do you want to launch?">
              <select className={selectCls} value={form.timeline} onChange={e => update("timeline", e.target.value)}>
                <option value="">Select timeline...</option>
                {TIMELINE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </InputField>
            <InputField label="Anything else you want us to know?">
              <textarea className={textareaCls} rows={3} value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Additional notes..." />
            </InputField>
            <NavButtons step={step} onBack={() => setStep(2)} onNext={() => setStep(4)} />
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Review &amp; Submit</h2>
            <div className="space-y-4">
              {[
                { title: "Your Idea", goTo: 0, rows: [["Name", form.name], ["Pitch", form.pitch], ["Sector", form.sector]] },
                { title: "Market & Problem", goTo: 1, rows: [["Problem", form.problem], ["Target Customers", form.customers], ["Market Size", form.marketSize]] },
                { title: "You & Your Team", goTo: 2, rows: [["Name", form.founderName], ["Email", form.founderEmail], ["Background", form.background]] },
                { title: "Goals & Needs", goTo: 3, rows: [["Stage", form.stage], ["Timeline", form.timeline], ["Accelerator Interest", form.accelerator], ["Top Needs", form.needs.join(", ")]] },
              ].map(section => (
                <div key={section.title} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
                    <button type="button" onClick={() => setStep(section.goTo)} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-sm text-gray-700">
                    {section.rows.map(([k, v]) => v && (
                      <div key={k}><span className="font-semibold">{k}:</span> {v}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setStep(3)} className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg font-semibold text-sm transition-colors">
                ← Back
              </button>
              <button type="button" onClick={handleSubmit} className="flex-1 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-sm transition-colors">
                Submit to Venture Studio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
