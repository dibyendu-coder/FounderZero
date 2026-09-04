import * as React from "react";
import { ClaudePrompt, ClaudeMode, ClaudeEffort } from "./claude-prompt";
import { cn } from "../../../lib/utils";

/**
 * ClaudeSlashMenu — Claude Code's slash-command palette.
 *
 * The command list sits above the real ClaudePrompt composer. Typing after
 * `/` in that input filters by command-name prefix; arrow keys move the
 * active option. Active rows are light blue; inactive rows are gray.
 */
export type SlashCommand = { name: string; description: string };

const DEFAULT: SlashCommand[] = [
  { name: "/agents", description: "Manage subagents for specialized tasks" },
  { name: "/analyze", description: "Comprehensive analysis of startup metrics & bottleneck" },
  { name: "/reality", description: "Reality check on spending, pivoting, or growth bet" },
  { name: "/metrics", description: "Deep dive into retention, activation, and MRR signals" },
  { name: "/customers", description: "Analyze customer interviews and feedback patterns" },
  { name: "/mission", description: "Create a structured 7-day actionable founder mission" },
  { name: "/experiment", description: "Design a low-cost growth or product experiment" },
  { name: "/clear", description: "Clear conversation history and free up context" },
  { name: "/compact", description: "Summarize the conversation to save context" },
  { name: "/init", description: "Initialize a CLAUDE.md with codebase docs" },
  { name: "/model", description: "Change the model for this session" },
  { name: "/review", description: "Review a pull request or startup strategy" },
];

const ACTIVE = "#afd7ff";
const INACTIVE = "#949494";
const NAME_COLS = 24;

export function ClaudeSlashMenu({
  commands = DEFAULT,
  value: externalValue,
  onChange: externalOnChange,
  onSelectCommand,
  onSubmit,
  mode = "auto",
  effort = "xhigh",
  className,
}: {
  commands?: SlashCommand[];
  value?: string;
  onChange?: (val: string) => void;
  onSelectCommand?: (command: SlashCommand) => void;
  onSubmit?: (val: string) => void;
  mode?: ClaudeMode;
  effort?: ClaudeEffort | false;
  className?: string;
}) {
  const [internalValue, setInternalValue] = React.useState("/");
  const [active, setActive] = React.useState(0);

  const value = externalValue !== undefined ? externalValue : internalValue;

  const query = value.startsWith("/") ? value.slice(1) : value;
  const list = commands.filter((c) =>
    c.name.slice(1).toLowerCase().startsWith(query.toLowerCase()),
  );
  const clampedActive = list.length ? Math.min(active, list.length - 1) : 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (externalOnChange) {
      externalOnChange(val);
    } else {
      setInternalValue(val);
    }
    setActive(0);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && list.length) {
      e.preventDefault();
      setActive((a) => (a + 1) % list.length);
      return;
    }
    if (e.key === "ArrowUp" && list.length) {
      e.preventDefault();
      setActive((a) => (a - 1 + list.length) % list.length);
      return;
    }
    if ((e.key === "Enter" || e.key === "Tab") && list.length) {
      e.preventDefault();
      const chosen = list[clampedActive];
      if (chosen) {
        onSelectCommand?.(chosen);
        if (!externalValue) setInternalValue(chosen.name + " ");
      }
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit?.(value);
      }
    }
  }

  return (
    <div className={cn("font-mono text-[13px] leading-[1.6]", className)}>
      {value.startsWith("/") && list.length > 0 && (
        <ul
          role="listbox"
          aria-label="Slash commands"
          aria-activedescendant={list.length ? `slash-${clampedActive}` : undefined}
          className="mb-2 space-y-0.5 bg-[#0a0a0c] border border-[#3a3a3e] rounded-md p-1.5 shadow-2xl max-h-48 overflow-y-auto"
        >
          {list.map((c, i) => {
            const activeRow = i === clampedActive;
            return (
              <li
                key={c.name}
                id={`slash-${i}`}
                role="option"
                aria-selected={activeRow}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  onSelectCommand?.(c);
                }}
                className="cursor-pointer truncate px-2 py-1 rounded text-xs"
                style={{
                  color: activeRow ? ACTIVE : INACTIVE,
                  background: activeRow ? "rgba(175, 215, 255, 0.12)" : "transparent",
                }}
              >
                <span
                  className="inline-block font-bold"
                  style={{ width: `${NAME_COLS}ch`, color: activeRow ? "#5E6AD2" : "#cd694a" }}
                >
                  {c.name}
                </span>
                <span className="text-slate-300">{c.description}</span>
              </li>
            );
          })}
        </ul>
      )}

      <ClaudePrompt
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder="Ask anything... (Type / for commands)"
        mode={mode}
        effort={effort}
      />
    </div>
  );
}
