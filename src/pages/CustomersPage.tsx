import React, { useState } from 'react';
import { Users, Plus, MessageSquare, Sparkles, X, Tag, Quote } from 'lucide-react';
import { AppState, CustomerFeedback } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionBadge } from '../components/ui/SectionBadge';

interface CustomersPageProps {
  state: AppState;
  onAddFeedback: (feedback: Partial<CustomerFeedback>) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ state, onAddFeedback }) => {
  const { customerFeedback } = state;

  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [type, setType] = useState<CustomerFeedback['type']>('Interview');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [painPoint, setPainPoint] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !content) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onAddFeedback({
      customerName,
      type,
      content,
      tags: tags.length ? tags : ['General Feedback'],
      keyPainPoint: painPoint || 'General usability',
      createdAt: new Date().toISOString().split('T')[0]
    });
    setModalOpen(false);
    setCustomerName('');
    setContent('');
    setTagsInput('');
    setPainPoint('');
  };

  const totalInterviews = customerFeedback.filter(f => f.type === 'Interview').length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-[#EDEDEF]">
      {/* Header */}
      <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <SectionBadge label="Qualitative Evidence & Customer Discovery" variant="blue" />
          <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent tracking-tight">
            Customer Insights Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8F98] max-w-2xl leading-relaxed font-sans">
            Record customer interviews, survey notes, and support feedback. FounderZero parses qualitative notes to verify founder assumptions against real customer language.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} />}
          onClick={() => setModalOpen(true)}
          className="shrink-0"
        >
          Record Customer Feedback
        </Button>
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#050506]/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a0a0c] text-[#EDEDEF] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-white/10 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-semibold text-[#EDEDEF] text-base">Add Customer Evidence Note</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#EDEDEF] mb-1">Customer / User Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Sarah K."
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl outline-none focus:border-[#5E6AD2]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#EDEDEF] mb-1">Feedback Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-white/10 text-[#EDEDEF] rounded-xl outline-none focus:border-[#5E6AD2]"
                  >
                    <option value="Interview">Interview</option>
                    <option value="Survey">Survey</option>
                    <option value="Review">Review</option>
                    <option value="Support">Support</option>
                    <option value="Feedback">Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#EDEDEF] mb-1">Exact Customer Quote *</label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What did the customer explicitly say about their workflow or problem?"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl outline-none focus:border-[#5E6AD2]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#EDEDEF] mb-1">Key Pain Point</label>
                <input
                  type="text"
                  value={painPoint}
                  onChange={e => setPainPoint(e.target.value)}
                  placeholder="e.g. Existing tools take too long to configure"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl outline-none focus:border-[#5E6AD2]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#EDEDEF] mb-1">Tags (Comma-Separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="e.g. Retention, Pricing, Onboarding"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 text-[#EDEDEF] rounded-xl outline-none focus:border-[#5E6AD2]"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Save Evidence
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Synthesis Insight Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
        <Card variant="default" className="p-5 space-y-2 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#5E6AD2] uppercase">
            <Sparkles size={14} />
            <span>Customer Consensus</span>
          </div>
          <p className="text-xs text-[#EDEDEF] leading-relaxed italic font-sans">
            "{customerFeedback[0]?.content || 'Existing solutions are bloated and overly complex for small teams.'}"
          </p>
        </Card>

        <Card variant="default" className="p-5 space-y-2 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#EDEDEF] uppercase">
            <MessageSquare size={14} className="text-[#5E6AD2]" />
            <span>Interview Velocity</span>
          </div>
          <p className="text-xs text-[#8A8F98] leading-relaxed font-sans">
            <strong className="font-mono text-sm text-[#EDEDEF]">{totalInterviews} interviews</strong> logged. Target 10+ interviews for high-confidence validation.
          </p>
        </Card>
      </div>

      {/* Feedback Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#EDEDEF] text-base">Recorded Evidence & Quotes</h3>
          <span className="text-xs font-mono text-[#8A8F98]">{customerFeedback.length} Notes</span>
        </div>

        {customerFeedback.length === 0 ? (
          <Card variant="flat" className="p-12 text-center text-[#8A8F98] font-mono text-xs bg-[#0a0a0c] border border-white/10 rounded-2xl">
            No customer feedback recorded yet. Click 'Record Customer Feedback' to log your first interview note.
          </Card>
        ) : (
          customerFeedback.map(item => (
            <Card
              key={item.id}
              variant="default"
              className="p-6 space-y-3 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:border-[#5E6AD2]/50 transition"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#EDEDEF] text-sm">{item.customerName}</span>
                  <Badge variant="blue" size="sm">
                    {item.type}
                  </Badge>
                </div>
                <span className="text-xs font-mono text-[#8A8F98]">{item.createdAt}</span>
              </div>

              <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] text-xs text-[#EDEDEF] leading-relaxed italic font-sans">
                "{item.content}"
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 font-sans">
                <div className="text-[#8A8F98]">
                  <strong className="text-[#EDEDEF]">Pain Point:</strong> {item.keyPainPoint}
                </div>

                <div className="flex items-center gap-1.5">
                  {item.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[#8A8F98] text-[11px] font-mono font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
