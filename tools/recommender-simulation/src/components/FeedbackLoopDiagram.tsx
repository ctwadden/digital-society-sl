import React from 'react';

export type FeedbackNodeId =
  | 'user_data'
  | 'signals'
  | 'scoring'
  | 'ranked_feed'
  | 'user_action'
  | 'updated_data';

interface FeedbackLoopDiagramProps {
  activeNode?: FeedbackNodeId;
  compact?: boolean;
}

const NODES: { id: FeedbackNodeId; label: string; stepNum: string; desc: string }[] = [
  { id: 'user_data', label: 'USER DATA', stepNum: '1', desc: 'Profile, history, demographic data' },
  { id: 'signals', label: 'SIGNALS', stepNum: '2', desc: 'Clicks, watch time, shares, recency' },
  { id: 'scoring', label: 'SCORING', stepNum: '3', desc: 'Mathematical weights applied' },
  { id: 'ranked_feed', label: 'RANKED FEED', stepNum: '4', desc: 'Content ordered on screen' },
  { id: 'user_action', label: 'USER ACTION', stepNum: '5', desc: 'Watch, like, skip, dwell' },
  { id: 'updated_data', label: 'UPDATED DATA', stepNum: '6', desc: 'Feedback updates user profile' },
];

export const FeedbackLoopDiagram: React.FC<FeedbackLoopDiagramProps> = ({
  activeNode = 'signals',
  compact = false,
}) => {
  return (
    <div
      className={`w-full rounded-xl border border-slate-800 bg-slate-900/80 p-4 ${
        compact ? 'py-3' : 'py-4'
      }`}
      role="region"
      aria-label="Recommender System Algorithmic Feedback Loop"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
          Algorithmic Feedback Loop Architecture
        </span>
        <span className="text-xs text-slate-400">
          Continuous closed-loop optimization
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 items-center">
        {NODES.map((node, index) => {
          const isActive = node.id === activeNode;
          const isNext =
            index > 0 &&
            NODES[index - 1].id === activeNode;

          return (
            <div
              key={node.id}
              className={`relative flex flex-col p-2.5 rounded-lg border transition-all text-left ${
                isActive
                  ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/40'
                  : 'border-slate-800 bg-slate-900/40 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  STEP {node.stepNum}
                </span>
                {isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                  </span>
                )}
              </div>

              <div
                className={`text-xs font-bold tracking-tight ${
                  isActive ? 'text-cyan-200' : 'text-slate-200'
                }`}
              >
                {node.label}
              </div>

              {!compact && (
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                  {node.desc}
                </div>
              )}

              {/* Loop connector arrow indicator */}
              {index < NODES.length - 1 && (
                <div
                  className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600 text-xs font-bold"
                  aria-hidden="true"
                >
                  →
                </div>
              )}
              {index === NODES.length - 1 && (
                <div
                  className="hidden md:block absolute -right-1 top-1/2 -translate-y-1/2 z-10 text-cyan-400/60 text-xs font-bold"
                  title="Loops back to step 1"
                  aria-hidden="true"
                >
                  ↺
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
