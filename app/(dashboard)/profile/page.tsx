"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

type Persona =
  | "founder"
  | "investor"
  | "advisor"
  | "farmer"
  | "researcher"
  | "service_provider"
  | "ecosystem_manager";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  persona: Persona | null;
  company_name: string | null;
  what_building: string | null;
  organization: string | null;
  job_title: string | null;
  location: string | null;
  linkedin_url: string | null;
  company_stage: string | null;
  funding_status: string | null;
  team_size: string | null;
  biggest_needs: string[] | null;
  agtech_focus: string[] | null;
  expertise_areas: string[] | null;
  investment_stages: string[] | null;
  goals_platform: string | null;
  goals_general: string | null;
  how_heard: string | null;
  onboarding_complete: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  last_checkin: string | null;
  profile_completeness: number | null;
  badges: string[] | null;
  admin_tags: string[] | null;
  avatar_url: string | null;
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

const BADGE_DEFINITIONS: Record<string, string> = {
  verified_profile: "✅ Verified Profile",
  founding_member: "⭐ Founding Member",
  first_connection: "🤝 First Connection",
  first_booking: "📅 Booked a Call",
  community_active: "🌐 Community Active",
  pitch_ready: "🎯 Pitch Ready",
  deal_maker: "💰 Deal Maker",
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
      {children}
    </h2>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      {label}
    </span>
  );
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function HeaderCard({ profile }: { profile: Profile }) {
  const persona = profile.persona;
  const avatarBg =
    persona && PERSONA_AVATAR_BG[persona] ? PERSONA_AVATAR_BG[persona] : "bg-gray-400";
  const personaColor =
    persona && PERSONA_COLORS[persona] ? PERSONA_COLORS[persona] : "bg-gray-100 text-gray-700";
  const personaLabel =
    persona && PERSONA_LABELS[persona] ? PERSONA_LABELS[persona] : persona ?? "Unknown";

  const initials = profile.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : profile.email
    ? profile.email.charAt(0).toUpperCase()
    : "?";

  return (
    <Card>
      <div className="flex items-start gap-5">
        {/* Avatar */}
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.full_name ?? "Avatar"}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0",
              avatarBg
            )}
          >
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl font-bold text-gray-900">
              {profile.full_name ?? "Your Name"}
            </h1>
            {persona && (
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                  personaColor
                )}
              >
                {personaLabel}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-1">{profile.email}</p>

          {(profile.organization || profile.company_name) && profile.job_title && (
            <p className="text-sm text-gray-600">
              {profile.job_title} &middot;{" "}
              {profile.organization ?? profile.company_name}
            </p>
          )}

          {(profile.organization || profile.company_name) && !profile.job_title && (
            <p className="text-sm text-gray-600">
              {profile.organization ?? profile.company_name}
            </p>
          )}

          {profile.job_title && !profile.organization && !profile.company_name && (
            <p className="text-sm text-gray-600">{profile.job_title}</p>
          )}

          {profile.location && (
            <p className="text-xs text-gray-400 mt-1">{profile.location}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function CompletenessCard({ profile }: { profile: Profile }) {
  const pct = profile.profile_completeness ?? 0;
  const persona = profile.persona;

  const missingFields: string[] = [];
  if (!profile.full_name) missingFields.push("Full Name");
  if (persona === "founder" && !profile.company_name) missingFields.push("Company Name");
  if (persona !== "founder" && !profile.organization) missingFields.push("Organization");
  if (!profile.job_title) missingFields.push("Job Title");
  if (!profile.location) missingFields.push("Location");
  if (!profile.linkedin_url) missingFields.push("LinkedIn URL");
  if (!profile.goals_platform) missingFields.push("Platform Goals");
  if (!profile.agtech_focus || profile.agtech_focus.length === 0)
    missingFields.push("AgTech Focus Areas");

  const barColor =
    pct >= 100
      ? "bg-green-500"
      : pct >= 70
      ? "bg-blue-500"
      : pct >= 40
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <Card>
      <SectionTitle>Profile Completeness</SectionTitle>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={cn("h-3 rounded-full transition-all", barColor)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-700 w-10 text-right">
          {pct}%
        </span>
      </div>

      {pct >= 100 ? (
        <div className="flex items-center gap-2 text-green-600 mt-3">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Profile is complete!</span>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Missing information:
          </p>
          <div className="flex flex-wrap gap-2">
            {missingFields.map((f) => (
              <span
                key={f}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100"
              >
                {f}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Book a call with Russell to update your profile and improve your
            completeness score.
          </p>
        </div>
      )}
    </Card>
  );
}

function BadgesCard({ profile }: { profile: Profile }) {
  const badges = profile.badges ?? [];

  return (
    <Card>
      <SectionTitle>Badges</SectionTitle>

      {badges.length === 0 ? (
        <p className="text-sm text-gray-500">
          No badges earned yet — complete your profile to start earning.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {badges.map((key) => {
            const label = BADGE_DEFINITIONS[key] ?? key;
            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100"
              >
                {label}
              </span>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function DetailsCard({ profile }: { profile: Profile }) {
  const persona = profile.persona;

  const renderFounder = () => (
    <div className="space-y-4">
      {profile.company_name && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Company
          </p>
          <p className="text-sm text-gray-800">{profile.company_name}</p>
        </div>
      )}
      {profile.company_stage && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Stage
          </p>
          <p className="text-sm text-gray-800">{profile.company_stage}</p>
        </div>
      )}
      {profile.what_building && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            What They're Building
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {profile.what_building}
          </p>
        </div>
      )}
      {profile.funding_status && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Funding Status
          </p>
          <p className="text-sm text-gray-800">{profile.funding_status}</p>
        </div>
      )}
      {profile.team_size && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Team Size
          </p>
          <p className="text-sm text-gray-800">{profile.team_size}</p>
        </div>
      )}
      {profile.biggest_needs && profile.biggest_needs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Biggest Needs
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.biggest_needs.map((n) => (
              <Chip key={n} label={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInvestor = () => (
    <div className="space-y-4">
      {profile.investment_stages && profile.investment_stages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Investment Stages
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.investment_stages.map((s) => (
              <Chip key={s} label={s} />
            ))}
          </div>
        </div>
      )}
      {profile.agtech_focus && profile.agtech_focus.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            AgTech Focus
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.agtech_focus.map((f) => (
              <Chip key={f} label={f} />
            ))}
          </div>
        </div>
      )}
      {profile.goals_general && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Goals
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {profile.goals_general}
          </p>
        </div>
      )}
    </div>
  );

  const renderAdvisor = () => (
    <div className="space-y-4">
      {profile.expertise_areas && profile.expertise_areas.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Expertise Areas
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.expertise_areas.map((e) => (
              <Chip key={e} label={e} />
            ))}
          </div>
        </div>
      )}
      {profile.goals_general && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Advisor Focus
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {profile.goals_general}
          </p>
        </div>
      )}
    </div>
  );

  const renderOther = () => (
    <div className="space-y-4">
      {profile.organization && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Organization
          </p>
          <p className="text-sm text-gray-800">{profile.organization}</p>
        </div>
      )}
      {profile.agtech_focus && profile.agtech_focus.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            AgTech Focus
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.agtech_focus.map((f) => (
              <Chip key={f} label={f} />
            ))}
          </div>
        </div>
      )}
      {profile.goals_general && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Goals
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {profile.goals_general}
          </p>
        </div>
      )}
    </div>
  );

  let content: React.ReactNode;
  if (persona === "founder" || persona === "farmer") {
    content = renderFounder();
  } else if (persona === "investor") {
    content = renderInvestor();
  } else if (persona === "advisor") {
    content = renderAdvisor();
  } else {
    content = renderOther();
  }

  return (
    <Card>
      <SectionTitle>
        {persona ? `${PERSONA_LABELS[persona]} Details` : "Profile Details"}
      </SectionTitle>
      {content}

      {/* AgTech Focus — show for founders too if present */}
      {(persona === "founder" || persona === "farmer") &&
        profile.agtech_focus &&
        profile.agtech_focus.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              AgTech Focus
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.agtech_focus.map((f) => (
                <Chip key={f} label={f} />
              ))}
            </div>
          </div>
        )}

      {/* LinkedIn */}
      {profile.linkedin_url && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            LinkedIn Profile
          </a>
        </div>
      )}
    </Card>
  );
}

function CheckInCard({ profile }: { profile: Profile }) {
  const lastCheckin = profile.last_checkin ? new Date(profile.last_checkin) : null;
  const now = new Date();

  let daysSince: number | null = null;
  let isOverdue = false;

  if (lastCheckin) {
    daysSince = Math.floor(
      (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24)
    );
    isOverdue = daysSince > 30;
  } else {
    isOverdue = true;
  }

  return (
    <Card
      className={cn(
        isOverdue && "border-red-300 bg-red-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            isOverdue ? "bg-red-100" : "bg-green-100"
          )}
        >
          {isOverdue ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <Clock className="w-5 h-5 text-green-600" />
          )}
        </div>

        <div className="flex-1">
          <SectionTitle>Monthly Check-In</SectionTitle>

          {lastCheckin ? (
            <p className="text-sm text-gray-700 mb-1">
              Last check-in:{" "}
              <span className="font-medium">
                {lastCheckin.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {daysSince !== null && (
                <span
                  className={cn(
                    "ml-2 text-xs font-semibold",
                    isOverdue ? "text-red-600" : "text-gray-500"
                  )}
                >
                  ({daysSince} days ago)
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm text-red-700 mb-1 font-medium">
              You haven&apos;t checked in yet.
            </p>
          )}

          {isOverdue && (
            <p className="text-xs text-red-600 mb-3">
              {lastCheckin
                ? "It's been more than 30 days since your last check-in. Stay connected!"
                : "Regular check-ins help Russell match you with the right opportunities."}
            </p>
          )}

          <Link
            href="/book-a-call"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
          >
            Contact Russell to Check In →
          </Link>
        </div>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (sbError && sbError.code !== "PGRST116") {
        // PGRST116 = no rows found, which we handle below
        setError("Failed to load profile. Please try again.");
      } else {
        setProfile(data ?? null);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [session, status]);

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (status === "unauthenticated") {
    return (
      <div className="max-w-lg mx-auto mt-20">
        <Card className="text-center py-12">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Sign in to view your profile
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Your profile is only visible when you&apos;re signed in.
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
  if (loading || status === "loading") {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-4" />
            <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
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
  if (!profile || profile.onboarding_complete === false) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card className="text-center py-12">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Complete your profile
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-sm mx-auto">
            Your profile isn&apos;t set up yet. Book a call with Russell or
            re-sign in to get started. Once your profile is complete, you&apos;ll
            unlock connections, badges, and personalized resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book-a-call"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Book a Call with Russell →
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Re-sign In
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ── Full profile ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Page title */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-sm text-gray-400 mt-1">
          Your member profile in the FounderOps Center network.
        </p>
      </div>

      <HeaderCard profile={profile} />
      <CompletenessCard profile={profile} />
      <BadgesCard profile={profile} />
      <DetailsCard profile={profile} />
      <CheckInCard profile={profile} />

      {/* Bottom action */}
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Edit Profile</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Book a call with Russell to update your profile information.
          </p>
        </div>
        <Link
          href="/book-a-call"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          Book a Call with Russell →
        </Link>
      </Card>
    </div>
  );
}
