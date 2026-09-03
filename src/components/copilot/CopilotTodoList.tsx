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
      className="my-3 p-3.5 rounded-xl border border-white/10 bg-[#0a0a0c] shadow-md space-y-2.5 font-sans text-[#EDEDEF]"
    >
      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5 font-mono font-semibold text-[#EDEDEF]">
          <ListTodo size={14} className="text-[#5E6AD2]" />
          <span>{title}</span>
        </div>
        <div className="text-[11px] font-mono text-[#8A8F98]">
          {completedCount}/{items.length} complete
        </div>
      </div>

      <div className="space-y-1.5 font-sans">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`flex items-start gap-2 text-xs transition-colors ${
              item.completed
                ? 'text-[#8A8F98]'
                : item.inProgress
                ? 'text-indigo-300 font-semibold'
                : 'text-[#8A8F98]'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {item.completed ? (
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                </div>
              ) : item.inProgress ? (
                <div className="w-4 h-4 flex items-center justify-center text-[#5E6AD2]">
                  <Loader2 size={13} className="animate-spin" />
                </div>
              ) : (
                <div className="w-4 h-4 flex items-center justify-center text-[#8A8F98]">
                  <Circle size={12} />
                </div>
              )}
            </div>

            <span className={`text-xs ${item.completed ? 'line-through text-[#8A8F98]' : 'text-[#EDEDEF]'}`}>
              {item.title}
            </span>
          </div>
        ))}
      </div>

      {isAllComplete && (
        <div className="pt-1 text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
          <span>✓ {title} complete</span>
        </div>
      )}
    </div>
  );
};
