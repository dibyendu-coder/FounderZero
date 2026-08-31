import React from 'react';
import { CheckCircle2, Circle, Loader2, ListTodo } from 'lucide-react';
import { CopilotTodoItem } from '../../types';

interface CopilotTodoListProps {
  items: CopilotTodoItem[];
  title?: string;
}

export const CopilotTodoList: React.FC<CopilotTodoListProps> = ({
  items = [],
  title = 'Task Progress'
}) => {
  if (items.length === 0) return null;

  const completedCount = items.filter(i => i.completed).length;
  const isAllComplete = completedCount === items.length;

  return (
    <div
      id="copilot-todo-list"
      className="my-3 p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 shadow-2xs space-y-2.5 font-sans"
    >
      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60">
        <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
          <ListTodo size={14} className="text-blue-600" />
          <span>{title}</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          {completedCount}/{items.length} complete
        </div>
      </div>

      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`flex items-start gap-2 text-xs transition-colors ${
              item.completed
                ? 'text-slate-600'
                : item.inProgress
                ? 'text-blue-900 font-semibold'
                : 'text-slate-500'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {item.completed ? (
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                </div>
              ) : item.inProgress ? (
                <div className="w-4 h-4 flex items-center justify-center text-blue-600">
                  <Loader2 size={13} className="animate-spin" />
                </div>
              ) : (
                <div className="w-4 h-4 flex items-center justify-center text-slate-300">
                  <Circle size={12} />
                </div>
              )}
            </div>

            <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : ''}`}>
              {item.title}
            </span>
          </div>
        ))}
      </div>

      {isAllComplete && (
        <div className="pt-1 text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
          <span>✓ {title} complete</span>
        </div>
      )}
    </div>
  );
};
