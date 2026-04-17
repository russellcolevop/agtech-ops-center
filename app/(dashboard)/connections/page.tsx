"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, XCircle, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Persona =
  | "founder"
  | "investor"
  | "advisor"
  | "farmer"
  | "researcher"
  | "service_provider"
  | "ecosystem_manager";

type IntroStatus =
  | "pending"
  | "mutual_accept"
  | "introduced"
  | "connected"
  | "declined"
  | "outcome_reported";

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  persona: Persona | null;
  company_name: string | null;
  organization: string | null;
  job_title: string | null;
  location: string | null;
  avatar_url: string | null;
  onboarding_complete: boolean | null;
}

interface Introduction {
  id: string;
  person_a: string;
  person_b: string;
  status: IntroStatus;
  match_score: number | null;
  match_reasons: string[] | null;
  created_at: string | null;
  introduced_at: string | null;
  outcome_a: string | null;
  outcome_b: string | null;
}

interface EnrichedIntro extends Introduction {
  otherProfile: ProfileRow;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PERSONA_COLORS: Record<Persona, string> = {
  founder: "bg-green-100 text-green-700",
  investor: "bg-indigo-100 text-indigo-700",
  advisor: "bg-purple-100 text-purple-700",
  farmer: "bg-amber-100 text-amber-700",
  researcher: "bg-blue-100 text-blue-700",
  ecosystem_manager: "bg-teal-100 text-teal-700",
  service_provider: "bg-gray-100 text-gray-700",
};

const PERSONA_AVATAR_BG: Record<Persona, string> = {
  founder: "bg-green-500",
  investor: "bg-indigo-500",
  advisor: "bg-purple-500",
  farmer: "bg-amber-500",
  researcher: "bg-blue-500",
  ecosystem_manager: "bg-teal-500",
  service_provider: "bg-gray-500",
};

const PERSONA_LABELS: Record<Persona, string> = {
  founder: "Founder",
  investor: "Investor",
  advisor: "Advisor",
  farmer: "Farmer",
  researcher: "Researcher",
  ecosystem_manager: "Ecosystem Manager",
  service_provider: "Service Provider",
};

// ─── Helper components ────────────────────────────────────────────────────────

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-xl p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

function PersonaTag({ persona }: { persona: Persona | null }) {
  if (!persona) return null;
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-semibold",
        PERSONA_COLORS[persona]
      )}
    >
      {PERSONA_LABELS[persona]}
    </span>
  );
}

function MiniAvatar({
  profile,
  size = "md",
}: {
  profile: ProfileRow;
  size?: "sm" | "md";
}) {
  const persona = profile.persona;
  const bg =
    persona && PERSONA_AVATAR_BG[persona] ? PERSONA_AVATAR_BG[persona] : "bg-gray-400";
  const dim = size === "sm" ? "w-9 h-9 text-sm" : "w-12 h-12 text-base";
  const initials = profile.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : profile.email
    ? profile.email.charAt(0).toUpperCase()
    : "?";

  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt={profile.full_name ?? "User"}
        className={cn("rounded-full object-cover flex-shrink-0", dim)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-bold flex-shrink-0",
        dim,
        bg
      )}
    >
      {initials}
    </div>
  );
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return null;
  const color =
    score >= 80
      ? "bg-green-100 text-green-700"
      : score >= 60
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-600";
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", color)}>
      {score}% match
    </span>
  );
}

// ─── Intro Card ───────────────────────────────────────────────────────────────

function IntroCard({
  intro,
  variant,
}: {
  intro: EnrichedIntro;
  variant: "active" | "history";
}) {
  const { otherProfile, status, match_score, match_reasons } = intro;

  const statusLabel =
    status === "mutual_accept"
      ? "Introduction Pending"
      : status === "introduced"
      ? "Introduction Made"
      : status === "connected"
      ? "Connected"
      : status === "declined"
      ? "Declined"
      : status === "outcome_reported"
      ? "Outcome Reported"
      : status;

  const StatusIcon =
    status === "connected" || status === "outcome_reported"
      ? CheckCircle
      : status === "declined"
      ? XCircle
      : null;

  const statusColor =
    status === "connected" || status === "outcome_reported"
      ? "text-green-600"
      : status === "declined"
      ? "text-red-500"
      : status === "introduced"
      ? "text-blue-600"
      : "text-amber-600";

  const displayName = otherProfile.full_name ?? otherProfile.email ?? "Unknown";
  const subtitle =
    otherProfile.job_title && (otherProfile.company_name ?? otherProfile.organization)
      ? `${otherProfile.job_title} · ${otherProfile.company_name ?? otherProfile.organization}`
      : otherProfile.job_title ??
        otherProfile.company_name ??
        otherProfile.organization ??
        null;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <MiniAvatar profile={otherProfile} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-semibold text-gray-900">{displayName}</span>
          <PersonaTag persona={otherProfile.persona} />
          {variant === "active" && <ScorePill score={match_score ?? null} />}
        </div>

        {subtitle && (
          <p className="text-xs text-gray-500 mb-1 truncate">{subtitle}</p>
        )}

        {otherProfile.location && (
          <p className="text-xs text-gray-400 mb-1">{otherProfile.location}</p>
        )}

        {/* Status row */}
        <div className={cn("flex items-center gap-1 mt-1", statusColor)}>
          {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
          {!StatusIcon && (
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          )}
          <span className="text-xs font-medium">{statusLabel}</span>
        </div>

        {/* Match reasons — active only */}
        {variant === "active" &&
          match_reasons &&
          match_reasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {match_reasons.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

type Tab = "discover" | "active" | "history";

const TABS: { id: Tab; label: string }[] = [
  { id: "discover", label: "Discover" },
  { id: "active", label: "Active" },
  { id: "history", label: "History" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConnectionsPage() {
  const { data: session, status: authStatus } = useSession();

  const [myProfile, setMyProfile] = useState<ProfileRow | null>(null);
  const [intros, setIntros] = useState<EnrichedIntro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("discover");

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      // 1. Load my profile
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select(
          "id, email, full_name, persona, company_name, organization, job_title, location, avatar_url, onboarding_complete"
        )
        .eq("email", session.user.email)
        .single();

      if (profileErr && profileErr.code !== "PGRST116") {
        setError("Failed to load your profile.");
        setLoading(false);
        return;
      }

      if (!profileData) {
        setMyProfile(null);
        setLoading(false);
        return;
      }

      setMyProfile(profileData);

      // 2. Load introductions where I am person_a or person_b
      const { data: introData, error: introErr } = await supabase
        .from("introductions")
        .select("*")
        .or(`person_a.eq.${profileData.id},person_b.eq.${profileData.id}`)
        .order("created_at", { ascending: false });

      if (introErr) {
        setError("Failed to load introductions.");
        setLoading(false);
        return;
      }

      if (!introData || introData.length === 0) {
        setIntros([]);
        setLoading(false);
        return;
      }

      // 3. Collect the other-person IDs (deduped)
      const otherIds = Array.from(
        new Set(
          introData.map((row: Introduction) =>
            row.person_a === profileData.id ? row.person_b : row.person_a
          )
        )
      ) as string[];

      const { data: otherProfiles, error: otherErr } = await supabase
        .from("profiles")
        .select(
          "id, email, full_name, persona, company_name, organization, job_title, location, avatar_url, onboarding_complete"
        )
        .in("id", otherIds);

      if (otherErr) {
        setError("Failed to load connection profiles.");
        setLoading(false);
        return;
      }

      const profileMap = Object.fromEntries(
        (otherProfiles ?? []).map((p: ProfileRow) => [p.id, p])
      );

      const enriched: EnrichedIntro[] = introData
        .map((row: Introduction) => {
          const otherId =
            row.person_a === profileData.id ? row.person_b : row.person_a;
          const otherProfile = profileMap[otherId];
          if (!otherProfile) return null;
          return { ...row, otherProfile };
        })
        .filter(Boolean) as EnrichedIntro[];

      setIntros(enriched);
      setLoading(false);
    };

    load();
  }, [session, authStatus]);

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (authStatus === "unauthenticated") {
    return (
      <div className="max-w-lg mx-auto mt-20">
        <Card className="text-center py-12">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Sign in to view your connections
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Your connections are only visible when you&apos;re signed in.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign In →
          </Link>
        </Card>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading || authStatus === "loading") {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
            <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card className="text-center py-10">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-gray-700 font-medium">{error}</p>
        </Card>
      </div>
    );
  }

  // ── No profile / not onboarded ─────────────────────────────────────────────
  if (!myProfile || myProfile.onboarding_complete === false) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card className="text-center py-12">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Complete your profile to get matched
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-sm mx-auto">
            Your profile needs to be set up before Russell can match you with
            other members. Book a call to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Profile →
            </Link>
            <Link
              href="/book-a-call"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Book a Call with Russell →
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ── Filtered intro lists ───────────────────────────────────────────────────
  const activeIntros = intros.filter((i) =>
    (["mutual_accept", "introduced"] as IntroStatus[]).includes(i.status)
  );
  const historyIntros = intros.filter((i) =>
    (["connected", "declined", "outcome_reported"] as IntroStatus[]).includes(i.status)
  );

  // ── Full page ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Page title */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">My Connections</h1>
        <p className="text-sm text-gray-400 mt-1">
          Smart introductions and matches curated by Russell.
        </p>
      </div>

      {/* Tabs */}
      <Card className="p-0 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => {
            const count =
              tab.id === "active"
                ? activeIntros.length
                : tab.id === "history"
                ? historyIntros.length
                : null;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 py-3.5 px-4 text-sm font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-gray-900 bg-white"
                    : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
                )}
              >
                {tab.label}
                {count !== null && count > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-xs font-bold">
                    {count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Discover tab ────────────────────────────────────────────────── */}
        {activeTab === "discover" && (
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  How Smart Connections Works
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Russell personally reviews your profile, goals, and activity to
                  identify high-value matches across the FounderOps Center
                  network. Every introduction is intentional — no algorithm spam.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  step: "1",
                  title: "Complete your profile",
                  desc: "The more Russell knows about you, the better your matches will be.",
                },
                {
                  step: "2",
                  title: "Earn badges",
                  desc: "Verified members and active participants get prioritized in the matching queue.",
                },
                {
                  step: "3",
                  title: "Russell makes the intro",
                  desc: "When the timing is right, Russell personally introduces you to your match.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mb-3">
                    {item.step}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <p className="text-sm font-semibold text-indigo-900 mb-1">
                Ready to get matched?
              </p>
              <p className="text-xs text-indigo-700 leading-relaxed mb-4">
                Members with complete profiles, active badges, and a recent
                check-in get the best matches. Start by making sure your profile
                is up to date.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 transition-colors"
                >
                  Complete your profile →
                </Link>
                <Link
                  href="/book-a-call"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
                >
                  Book a call →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Active tab ──────────────────────────────────────────────────── */}
        {activeTab === "active" && (
          <div className="p-6">
            {activeIntros.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  No active introductions yet
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Russell will reach out when he has a great match for you.
                </p>
                <Link
                  href="/book-a-call"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
                >
                  Book a call →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-4">
                  {activeIntros.length} active introduction
                  {activeIntros.length !== 1 ? "s" : ""}
                </p>
                {activeIntros.map((intro) => (
                  <IntroCard key={intro.id} intro={intro} variant="active" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── History tab ─────────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div className="p-6">
            {historyIntros.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  No connection history yet
                </p>
                <p className="text-xs text-gray-500">
                  Completed and declined introductions will appear here.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-4">
                  {historyIntros.length} past introduction
                  {historyIntros.length !== 1 ? "s" : ""}
                </p>
                {historyIntros.map((intro) => (
                  <IntroCard key={intro.id} intro={intro} variant="history" />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Bottom action */}
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Want better matches?
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            A complete profile and a recent check-in unlock the best
            introductions.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            My Profile →
          </Link>
          <Link
            href="/book-a-call"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
          >
            Book a Call →
          </Link>
        </div>
      </Card>
    </div>
  );
}
