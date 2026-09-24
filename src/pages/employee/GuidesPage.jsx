import React, { useState, useEffect } from 'react';
import { getGuides } from '../../api/guideApi';
import { BookOpen, Search, ChevronDown, ChevronUp, Wrench, ArrowRight } from 'lucide-react';

export default function GuidesPage({ onStartSupportWithGuide }) {
  const [guides, setGuides] = useState([]);
  const [search, setSearch] = useState('');
  const [expandedGuideId, setExpandedGuideId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGuides = async () => {
      setLoading(true);
      try {
        const res = await getGuides({ search });
        if (res.success) {
          setGuides(res.data);
        }
      } catch (err) {
        console.error('Failed to load guides:', err);
      } finally {
        setLoading(false);
      }
    };
    loadGuides();
  }, [search]);

  const toggleExpand = (id) => {
    setExpandedGuideId(expandedGuideId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <div>
        <h1 className="font-display font-medium text-2xl text-[#0a0a0a]">Troubleshooting Guides</h1>
        <p className="text-[13px] text-[#737373]">
          Step-by-step diagnostic procedures for common company hardware and software issues
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guides (Wi-Fi, VPN, Password, Printer, Outlook)..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#ffffff] border border-[#e5e5e5] rounded-[8px] text-[14px] text-[#171717] focus:outline-none focus:border-[#0a0a0a]"
        />
      </div>

      {/* Guides Accordion List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-[13px] text-[#737373]">
            Loading knowledge guides...
          </div>
        ) : guides.length === 0 ? (
          <div className="p-12 bg-white border border-[#e5e5e5] rounded-[16px] text-center">
            <BookOpen className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
            <h3 className="font-medium text-[14px] text-[#0a0a0a] mb-1">No guides found</h3>
            <p className="text-[13px] text-[#737373]">Try searching with a different keyword.</p>
          </div>
        ) : (
          guides.map((g) => {
            const isExpanded = expandedGuideId === g._id;
            return (
              <div
                key={g._id}
                className="bg-[#ffffff] border border-[#e5e5e5] rounded-[12px] overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleExpand(g._id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#fafafa] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[6px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-4 h-4 text-[#0a0a0a]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[15px] text-[#0a0a0a]">{g.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-[#737373] bg-[#f5f5f5] px-1.5 py-0.2 rounded">
                          {g.category?.name || 'Network'}
                        </span>
                        <span className="text-[12px] text-[#737373]">
                          {g.steps?.length || 0} diagnostic steps
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartSupportWithGuide(g.title);
                      }}
                      className="px-3 py-1 bg-[#0a0a0a] hover:bg-[#262626] text-white text-[12px] font-medium rounded-[6px] transition-all hidden sm:flex items-center gap-1"
                    >
                      <span>Interactive Fix</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#737373]" /> : <ChevronDown className="w-4 h-4 text-[#737373]" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#f5f5f5] bg-[#fafafa]">
                    <div className="space-y-3 pt-2">
                      {g.steps?.map((s, sIdx) => (
                        <div key={sIdx} className="p-3 bg-white border border-[#e5e5e5] rounded-[8px] flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] flex-shrink-0 flex items-center justify-center font-mono text-xs font-semibold text-[#0a0a0a]">
                            {s.stepNumber || sIdx + 1}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium text-[#0a0a0a]">{s.instruction}</div>
                            {s.details && (
                              <p className="text-[12px] text-[#525252] mt-0.5 leading-relaxed">{s.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
                      <span className="text-[12px] text-[#737373]">Still having issues?</span>
                      <button
                        onClick={() => onStartSupportWithGuide(g.title)}
                        className="text-[12px] font-medium text-[#2563eb] hover:underline flex items-center gap-1"
                      >
                        <span>Start Support Session</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
