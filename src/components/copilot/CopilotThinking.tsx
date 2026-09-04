import React from 'react';
import { CopilotThinkingStep } from '../../types';
import { ClaudeThinking } from '../brainless/claude/claude-thinking';

interface CopilotThinkingProps {
  steps?: CopilotThinkingStep[];
  isThinking?: boolean;
  activeStepLabel?: string;
  duration?: string;
}

export const CopilotThinking: React.FC<CopilotThinkingProps> = ({
  steps = [],
  isThinking = false,
  activeStepLabel,
  duration
}) => {
  return (
    <div className="my-2.5">
      <ClaudeThinking
        running={isThinking}
        verbs={[
          "Analyzing startup context",
          "Synthesizing metrics",
          "Herding customer signals",
          "Levitating strategic priorities",
          "Percolating recommendations",
          "Conjuring roadmap"
        ]}
        showTokens={true}
      />
    </div>
  );
};

