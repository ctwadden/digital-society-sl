import React from 'react';
import { HelpCircle, BookOpen, RotateCcw } from 'lucide-react';

interface HeaderProps {
  currentStage: number;
  onNavigateStage: (stage: number) => void;
  maxReachedStage: number;
  onOpenHelp: () => void;
  onOpenTeacherGuide: () => void;
  onOpenReset: () => void;
}

const STAGES = [
  { num: 1, label: '1. User Profile' },
  { num: 2, label: '2. Algorithm Weights' },
  { num: 3, label: '3. Initial Feed' },
  { num: 4, label: '4. Feedback Loop' },
  { num: 5, label: '5. Compare Goals' },
  { num: 6, label: '6. Capture Evidence' },
  { num: 7, label: '7. Final Claim' },
  { num: 8, label: '8. Investigation Report' },
];

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  onNavigateStage,
  maxReachedStage,
  onOpenHelp,
  onOpenTeacherGuide,
  onOpenReset,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Single element brand title */}
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-black tracking-tight text-white whitespace-nowrap">
            WHO SHAPES YOUR FEED?
          </span>
          <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase hidden sm:block">
            A Recommender-System Simulation · IB Digital Society
          </span>
        </div>

        {/* Zone 2: Stage navigation links / progress bar */}
        <nav
          aria-label="Simulation Stages"
          className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 text-xs"
        >
          {STAGES.map((s) => {
            const isActive = currentStage === s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => onNavigateStage(s.num)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title={`Jump to Stage ${s.num}: ${s.label}`}
              >
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Functional actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            title="Guidance for current stage"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span className="hidden sm:inline">Help</span>
          </button>

          <button
            type="button"
            onClick={onOpenTeacherGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-950/40 border border-purple-800/60 rounded-lg hover:bg-purple-900/50 hover:text-white transition-colors"
            title="Teacher Guide & Curriculum Targets"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
            <span className="hidden sm:inline">Teacher Guide</span>
          </button>

          <button
            type="button"
            onClick={onOpenReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/30 border border-rose-800/50 rounded-lg hover:bg-rose-900/40 hover:text-white transition-colors"
            title="Reset simulation data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Mobile stage progress pill bar */}
      <div className="lg:hidden px-4 py-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Stage {currentStage} of 8:{' '}
          <strong className="text-cyan-300 font-semibold">
            {STAGES[currentStage - 1]?.label.split('. ')[1] || 'Overview'}
          </strong>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => currentStage > 1 && onNavigateStage(currentStage - 1)}
            disabled={currentStage <= 1}
            className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => currentStage < 8 && onNavigateStage(currentStage + 1)}
            disabled={currentStage >= 8}
            className="px-2 py-0.5 rounded text-xs bg-cyan-600 text-slate-950 font-bold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </header>
  );
};
