import React, { useState } from 'react';
import {
  X,
  Lightbulb,
  Users,
  Layers,
  Flame,
  Compass,
  Calendar,
  Plus,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { NOTEPAD_TEMPLATES } from '../../lib/notepadData';
import { NoteTemplate } from '../../types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: NoteTemplate) => void;
  onCreateBlank: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onUseTemplate,
  onCreateBlank
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate>(NOTEPAD_TEMPLATES[0]);

  if (!isOpen) return null;

  const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Lightbulb,
    Users,
    Layers,
    Flame,
    Compass,
    Calendar
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Startup Note Templates</h2>
              <p className="text-xs text-slate-500">
                Battle-tested frameworks for ideation, customer validation, experiments, and reviews
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Template List */}
          <div className="md:col-span-5 border-r border-slate-100 p-4 overflow-y-auto space-y-2 bg-slate-50/40">
            {/* Blank Option */}
            <button
              onClick={() => {
                onCreateBlank();
                onClose();
              }}
              className="w-full p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30 text-left transition flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                <Plus size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                  Blank Note
                </div>
                <p className="text-[11px] text-slate-500">Start from a clean slate</p>
              </div>
            </button>

            <div className="pt-2 text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 px-1">
              Startup Frameworks
            </div>

            {NOTEPAD_TEMPLATES.map(tpl => {
              const Icon = iconMap[tpl.icon] || FileText;
              const isSelected = selectedTemplate.id === tpl.id;

              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? 'text-blue-900' : 'text-slate-900'
                        }`}
                      >
                        {tpl.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-semibold">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{tpl.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Template Preview */}
          <div className="md:col-span-7 p-6 overflow-y-auto flex flex-col justify-between bg-white">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                    {selectedTemplate.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-500">
                    Collection: {selectedTemplate.defaultCollection}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">
                  {selectedTemplate.name}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">{selectedTemplate.description}</p>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5">
                {selectedTemplate.defaultTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Live Preview of Blocks */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5 max-h-[380px] overflow-y-auto">
                <div className="text-[10px] font-mono font-semibold uppercase text-slate-400">
                  Pre-configured Document Blocks ({selectedTemplate.blocks.length})
                </div>
                {selectedTemplate.blocks.map((block, i) => (
                  <div key={i} className="text-xs text-slate-700">
                    {block.type === 'heading2' && (
                      <div className="font-bold text-xs text-slate-900 pt-2 border-t border-slate-200/60">
                        {block.content}
                      </div>
                    )}
                    {block.type === 'paragraph' && (
                      <p className="text-slate-600 leading-relaxed">{block.content}</p>
                    )}
                    {block.type === 'callout' && (
                      <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-950 font-medium text-[11px]">
                        {block.content}
                      </div>
                    )}
                    {block.type === 'checklist' && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white" />
                        <span>{block.content}</span>
                      </div>
                    )}
                    {block.type === 'bulletList' && (
                      <div className="flex items-start gap-2 text-slate-600 pl-1">
                        <span className="text-blue-500">•</span>
                        <span>{block.content}</span>
                      </div>
                    )}
                    {block.type === 'quote' && (
                      <blockquote className="border-l-2 border-blue-500 pl-2.5 italic text-slate-500">
                        {block.content}
                      </blockquote>
                    )}
                    {block.type === 'code' && (
                      <div className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-[10px]">
                        {block.content}
                      </div>
                    )}
                    {block.type === 'table' && (
                      <div className="p-2 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
                        [Structured Table with {block.tableData?.headers.length || 4} Columns]
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUseTemplate(selectedTemplate);
                  onClose();
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Use This Template</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
