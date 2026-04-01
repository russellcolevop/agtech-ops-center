"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { glossaryTerms } from "@/data/content";

export default function GlossaryPage() {
  const [search, setSearch] = useState("");

  const filtered = glossaryTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase())
  );

  // Group alphabetically
  const grouped = filtered.reduce<Record<string, typeof glossaryTerms>>((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="AgTech Glossary"
        description="Essential terminology for agricultural technology founders — from technical ag concepts to startup and investment vocabulary."
        icon="📖"
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50 focus:bg-white/8 transition-colors"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{filtered.length} terms</span>
        {search && <span>· Filtered by "{search}"</span>}
      </div>

      {/* Grouped terms */}
      {letters.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No terms found matching "{search}"</div>
      ) : (
        <div className="space-y-8">
          {letters.map((letter) => (
            <div key={letter}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-900/50 border border-brand-700/30 flex items-center justify-center">
                  <span className="text-brand-400 text-sm font-bold">{letter}</span>
                </div>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="space-y-3">
                {grouped[letter].map((item) => (
                  <div
                    key={item.term}
                    className="bg-white/5 rounded-xl border border-white/10 px-5 py-4 hover:bg-white/8 transition-colors"
                  >
                    <p className="text-sm font-semibold text-white mb-1">{item.term}</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
