import React from 'react';
import { X, HelpCircle, Check } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage: number;
}

const STAGE_HELP: Record<
  number,
  { title: string; instructions: string[]; tip: string }
> = {
  1: {
    title: 'Stage 1: Meet the User Profile',
    instructions: [
      'Choose one of the 4 fictional student profiles (Maya, Noah, Ava, or Eli).',
      'Select up to 3 prediction chips representing topics you predict will surface near the top.',
      'Select 1 or 2 behavioral evidence cards from the user dossier.',
      'Optional: Add a one-sentence explanation.',
    ],
    tip: 'Notice how the user skipped certain advertisements or replayed certain clips—those are implicit signals algorithms capture.',
  },
  2: {
    title: 'Stage 2: Become the Algorithm',
    instructions: [
      'Pick a Platform Goal preset and adjust the 5 mathematical sliders (0 to 10).',
      'Choose a Content Moderation Safety Level (Low, Balanced, or Strong).',
      'Answer the 3 quick selections: what will rise, what will lose visibility, and who benefits.',
      'Optional: Add a one-sentence prediction explanation.',
    ],
    tip: 'Weights act as multipliers. If watch time is 10 and diversity is 1, long addictive videos will push out varied topics.',
  },
  3: {
    title: 'Stage 3: Rank the Content',
    instructions: [
      'Examine the 12 candidate cards ordered by the mathematical formula.',
      'Click on the content card in the feed that surprised you most.',
      'Select the reason for your surprise from the options provided.',
      'Complete the short statement on the most important signal.',
    ],
    tip: 'Click "Why Recommended?" on cards to see the top 3 mathematical signals in action.',
  },
  4: {
    title: 'Stage 4: Behavioral Feedback Loop',
    instructions: [
      'Perform 6 user actions on the feed cards (Watch, Full Watch, Like, Share, Skip, or Dismiss).',
      'After interaction 2: Select your prediction of what happens next.',
      'After interaction 4: Indicate if the feed is becoming broader or narrower, and select the strongest signal action.',
      'Review the Signal Log to observe how your actions updated user telemetry in real time.',
    ],
    tip: 'Try alternating between positive actions on one topic and dismissals on another to see the feedback loop recalibrate.',
  },
  5: {
    title: 'Stage 5: Change the Platform Goal',
    instructions: [
      'Keep the same user and interaction history, but select a DIFFERENT platform goal.',
      'Compare Feed A and Feed B side by side.',
      'Answer the 3 multiple-choice questions on diversity, engagement, and beneficiaries.',
      'Complete the short two-line observation on the most important change.',
    ],
    tip: 'The user did not change at all—only the platform executive priority changed. Consider who holds the power in this scenario.',
  },
  6: {
    title: 'Stage 6: Capture the Evidence',
    instructions: [
      'Review the automatically compiled Simulation Evidence Snapshot.',
      'Answer prompt 1: What did you change, and what happened to the feed?',
      'Answer prompt 2: What does this reveal about platform goals, signals or feedback?',
    ],
    tip: 'Focus on connecting the platform weight changes to observable ranking movements.',
  },
  7: {
    title: 'Stage 7: Formulate Your Final Claim',
    instructions: [
      'Select your stance on the central claim statement.',
      'Your claim is automatically generated from your stance.',
      'Select 1 piece of supporting evidence from the simulation.',
      'Complete the single-sentence reasoning statement.',
    ],
    tip: 'Ground your reasoning in concrete simulation evidence rather than general impressions.',
  },
  8: {
    title: 'Stage 8: Investigation Report',
    instructions: [
      'Review your comprehensive synthesis portfolio.',
      'Notice the clear distinction between student selections, student writing, and simulation data.',
      'Use "Print / Save as PDF" to save or print a clean report.',
      'Use "Copy Results" to export text for your teacher or school LMS.',
    ],
    tip: 'You can navigate backward to any previous stage using the top navigation bar to adjust your choices anytime.',
  },
};

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  currentStage,
}) => {
  if (!isOpen) return null;

  const help = STAGE_HELP[currentStage] || STAGE_HELP[1];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400">
            <HelpCircle className="w-5 h-5" />
            <h2 id="help-modal-title" className="text-base font-bold text-white">
              {help.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close Help"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider block">
            How to complete this stage:
          </span>
          <ul className="space-y-1.5 text-slate-300">
            {help.instructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">&bull;</span>
                <span className="leading-relaxed">{inst}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs text-cyan-200">
          <strong>Teacher Tip:</strong> {help.tip}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Got it, continue
          </button>
        </div>
      </div>
    </div>
  );
};
