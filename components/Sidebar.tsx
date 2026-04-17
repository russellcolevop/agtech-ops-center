"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Globe,
  Rocket,
  BookOpen,
  FileText,
  Radio,
  Map,
  Layers,
  Leaf,
  LifeBuoy,
  Phone,
  BarChart2,
  Lightbulb,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { regions } from "@/data/content";

const globalNavItems = [
  { href: "/", label: "Global AgTech Overview", icon: Globe },
  { href: "/market-intel", label: "Market Intelligence", icon: BarChart2 },
  { href: "/venture", label: "Venture Studio", icon: Lightbulb },
  { href: "/accelerators", label: "Accelerator Hub", icon: GraduationCap },
  { href: "/founders-journey", label: "Founder's Journey", icon: Rocket },
  { href: "/glossary", label: "AgTech Glossary", icon: BookOpen },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/media", label: "AgTech Media & Influencers", icon: Radio },
];

const regionNavItems = [
  { href: "/ecosystem", label: "Ecosystem Overview", icon: Map },
  { href: "/industry-segments", label: "Industry Segments", icon: Layers },
  { href: "/crops", label: "Crops", icon: Leaf },
  { href: "/resources", label: "Resources & Support", icon: LifeBuoy },
];

interface SidebarProps {
  region: string;
  onRegionChange: (code: string) => void;
}

export default function Sidebar({ region, onRegionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const selectedRegion = regions.find((r) => r.code === region) || regions[0];

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-sidebar-bg border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex-shrink-0 w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">AgTech Ops</p>
            <p className="text-sidebar-text text-xs leading-tight truncate">Founder Dashboard</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[68px] z-10 w-6 h-6 bg-sidebar-active border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-text hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <nav className="flex-1 overflow-y-auto py-4 space-y-6">
        {/* Global Resources */}
        <div>
          {!collapsed && (
            <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-heading">
              Global Resources
            </p>
          )}
          <ul className="space-y-0.5">
            {globalNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-none",
                      active
                        ? "bg-sidebar-active text-white border-l-2 border-brand-500"
                        : "text-sidebar-text hover:bg-sidebar-hover hover:text-white border-l-2 border-transparent"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Region-Specific Data */}
        <div>
          {!collapsed && (
            <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-heading">
              Region-Specific Data
            </p>
          )}

          {/* Region Selector */}
          {!collapsed && (
            <div className="px-4 mb-2 relative">
              <button
                onClick={() => setRegionOpen(!regionOpen)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-sidebar-active rounded-lg text-sm text-white hover:bg-sidebar-hover transition-colors"
              >
                <span className="text-base">{selectedRegion.flag}</span>
                <span className="flex-1 text-left truncate">{selectedRegion.name}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", regionOpen && "rotate-180")} />
              </button>

              {regionOpen && (
                <div className="absolute top-full left-4 right-4 mt-1 bg-sidebar-active border border-sidebar-border rounded-lg shadow-lg z-50 overflow-hidden">
                  {regions.map((r) => (
                    <button
                      key={r.code}
                      onClick={() => {
                        onRegionChange(r.code);
                        setRegionOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left",
                        r.code === region
                          ? "bg-brand-800 text-white"
                          : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                      )}
                    >
                      <span>{r.flag}</span>
                      <span>{r.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {collapsed && (
            <div className="px-4 mb-2">
              <button
                onClick={() => setRegionOpen(!regionOpen)}
                className="w-8 h-8 flex items-center justify-center bg-sidebar-active rounded-lg text-base"
                title="Select region"
              >
                {selectedRegion.flag}
              </button>
            </div>
          )}

          <ul className="space-y-0.5">
            {regionNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-l-2",
                      active
                        ? "bg-sidebar-active text-white border-brand-500"
                        : "text-sidebar-text hover:bg-sidebar-hover hover:text-white border-transparent"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* Book a Call */}
        <Link
          href="/book-a-call"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            "bg-brand-700 text-white hover:bg-brand-600",
            pathname === "/book-a-call" && "bg-brand-600"
          )}
          title={collapsed ? "Book a Call with Russell" : undefined}
        >
          <Phone className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="truncate">Book a Call with Russell</span>}
        </Link>

        {/* User */}
        {session?.user && (
          <div className="flex items-center gap-2 px-3 py-2">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-7 h-7 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-sidebar-active flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-sidebar-text" />
              </div>
            )}
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{session.user.name}</p>
                  <p className="text-sidebar-text text-xs truncate">{session.user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-sidebar-text hover:text-white transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
