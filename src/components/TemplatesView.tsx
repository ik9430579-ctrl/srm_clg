import React, { useState } from 'react';
import { AITemplate, CanvasNode, TaskItem } from '../types';
import { AI_TEMPLATES } from '../data/mockData';
import { Sparkles, Video, Dna, Megaphone, CheckCircle2, ArrowRight } from 'lucide-react';

interface TemplatesViewProps {
  onApplyTemplate: (template: AITemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onApplyTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);

  const filteredTemplates = AI_TEMPLATES.filter((tpl) => {
    if (selectedCategory === 'all') return true;
    return tpl.category === selectedCategory;
  });

  const handleApply = (tpl: AITemplate) => {
    onApplyTemplate(tpl);
    setAppliedTemplateId(tpl.id);
    setTimeout(() => setAppliedTemplateId(null), 3000);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Ready-to-Use AI Template Library</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
              Production Workflows
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pre-assembled multi-modal pipelines. 1-click loading pushes nodes to the collaborative canvas and tasks to the scheduler.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-white/10 text-xs">
          {['all', 'video', 'bioscience', 'marketing', 'creative'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((tpl) => {
          const isApplied = appliedTemplateId === tpl.id;

          return (
            <div
              key={tpl.id}
              className="p-5 rounded-xl bg-[#090d16]/90 border border-white/10 hover:border-cyan-500/40 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tpl.category === 'video' && <Video className="w-5 h-5 text-purple-400" />}
                    {tpl.category === 'bioscience' && <Dna className="w-5 h-5 text-cyan-300" />}
                    {tpl.category === 'marketing' && <Megaphone className="w-5 h-5 text-amber-400" />}
                    {tpl.category === 'creative' && <Sparkles className="w-5 h-5 text-emerald-400" />}
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {tpl.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">
                    {tpl.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{tpl.description}</p>

                {/* Pre-packaged components */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-xs">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Includes:</span>
                    <span className="text-cyan-400 font-semibold">
                      {tpl.nodesPreset.length} Canvas Nodes · {tpl.tasksPreset.length} Scheduled Tasks
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tpl.nodesPreset.map((n, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-300">
                        {n.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 capitalize">Category: {tpl.category}</span>
                <button
                  onClick={() => handleApply(tpl)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isApplied
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 hover:text-white'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Loaded into Studio!</span>
                    </>
                  ) : (
                    <>
                      <span>Load into Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
