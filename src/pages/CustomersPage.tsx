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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <SectionBadge label="Qualitative Evidence & Customer Discovery" variant="blue" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Insights Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Record customer interviews, survey notes, and support feedback. FounderZero parses qualitative notes to verify founder assumptions against real customer language.
          </p>
        </div>

        <Button
          variant="gradient"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Customer Evidence Note</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / User Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Sarah K."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Feedback Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
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
                <label className="block font-semibold text-slate-700 mb-1">Exact Customer Quote *</label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What did the customer explicitly say about their workflow or problem?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Pain Point</label>
                <input
                  type="text"
                  value={painPoint}
                  onChange={e => setPainPoint(e.target.value)}
                  placeholder="e.g. Existing tools take too long to configure"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (Comma-Separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="e.g. Retention, Pricing, Onboarding"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0052FF] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="default" className="p-5 space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#0052FF] uppercase">
            <Sparkles size={14} />
            <span>Customer Consensus</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed italic">
            "{customerFeedback[0]?.content || 'Existing solutions are bloated and overly complex for small teams.'}"
          </p>
        </Card>

        <Card variant="default" className="p-5 space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-slate-700 uppercase">
            <MessageSquare size={14} className="text-[#0052FF]" />
            <span>Interview Velocity</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong className="font-mono text-sm text-slate-900">{totalInterviews} interviews</strong> logged. Target 10+ interviews for high-confidence validation.
          </p>
        </Card>
      </div>

      {/* Feedback Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Recorded Evidence & Quotes</h3>
          <span className="text-xs font-mono text-slate-400">{customerFeedback.length} Notes</span>
        </div>

        {customerFeedback.length === 0 ? (
          <Card variant="flat" className="p-12 text-center text-slate-400 font-mono text-xs">
            No customer feedback saved yet. Log your first user interview note above.
          </Card>
        ) : (
          customerFeedback.map(item => (
            <Card
              key={item.id}
              variant="default"
              className="p-6 space-y-3 hover:border-blue-200 transition"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{item.customerName}</span>
                  <Badge variant="blue" size="sm">
                    {item.type}
                  </Badge>
                </div>
                <span className="text-xs font-mono text-slate-400">{item.createdAt}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-800 leading-relaxed italic">
                "{item.content}"
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                <div className="text-slate-600">
                  <strong className="text-slate-900">Pain Point:</strong> {item.keyPainPoint}
                </div>

                <div className="flex items-center gap-1.5">
                  {item.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
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
