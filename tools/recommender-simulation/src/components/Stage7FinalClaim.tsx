import React, { useEffect } from 'react';
import { FinalClaimData, StanceType } from '../types';
import { Scale, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { FeedbackLoopDiagram } from './FeedbackLoopDiagram';

interface Stage7FinalClaimProps {
  claimData: FinalClaimData;
  onChangeClaim: (data: Partial<FinalClaimData>) => void;
  onProceed: () => void;
  onBack: () => void;
}

const EVIDENCE_PIECES = [
  'changing the platform goal changed the feed',
  'changing signal weights changed the ranking',
  'user interactions changed later recommendations',
  'safety controls demoted risky content',
  'diversity controls introduced unfamiliar content',
  'explicit negative feedback reduced similar content',
];

export const Stage7FinalClaim: React.FC<Stage7FinalClaimProps> = ({
  claimData,
  onChangeClaim,
  onProceed,
  onBack,
}) => {
  const STANCES: { id: StanceType; label: string; desc: string }[] = [
    {
      id: 'agree',
      label: 'Agree',
      desc: 'Users dictate what appears through their clicks, watches, and choices.',
    },
    {
      id: 'mostly_agree',
      label: 'Mostly Agree',
      desc: 'Users have primary leverage, though platforms set boundary parameters.',
    },
    {
      id: 'unsure',
      label: 'Unsure',
      desc: 'Power is dynamically shared or too interdependent to isolate.',
    },
    {
      id: 'mostly_disagree',
      label: 'Mostly Disagree',
      desc: 'Platforms structure the options, goals, and weights that shape feeds.',
    },
    {
      id: 'disagree',
      label: 'Disagree',
      desc: 'Platforms hold ultimate structural control; user actions only feed their objectives.',
    },
  ];

  const handleSelectStance = (stance: StanceType) => {
    let autoClaim = '';
    if (stance === 'agree') {
      autoClaim = 'Personalized recommendation algorithms give users more control than platforms by prioritizing individual user actions and engagement.';
    } else if (stance === 'mostly_agree') {
      autoClaim = 'Users maintain greater day-to-day control over their feeds than platforms, though platforms establish the initial candidate pool.';
    } else if (stance === 'unsure') {
      autoClaim = 'Control is divided dynamically between user telemetry and platform scoring algorithms without either party holding absolute dominance.';
    } else if (stance === 'mostly_disagree') {
      autoClaim = 'Platforms hold greater control than users because platform-defined weights and goals predetermine which content can surface.';
    } else {
      autoClaim = 'Platforms hold decisive structural control over recommendation algorithms; user interactions merely feed an architecture built for corporate objectives.';
    }

    onChangeClaim({
      stance,
      claim: autoClaim,
    });
  };

  const hasStance = Boolean(claimData.stance);
  const hasEvidence = Boolean(claimData.selectedEvidence);

  // Can proceed once position and evidence are selected; completing reasoning sentence is prompted
  const canProceed = hasStance && hasEvidence;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          <span>Stage 7 of 7</span>
          <span aria-hidden="true">·</span>
          <span>Synthesis & Argumentation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Stage 7: Formulate Your Final Claim
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Ground your evaluative stance in empirical simulation evidence. Select your position, choose supporting evidence from your experiment, and provide one sentence of reasoning.
        </p>
      </div>

      {/* Visual Feedback Loop */}
      <FeedbackLoopDiagram activeNode="user_action" />

      {/* The Central Provocation Statement */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 border-2 border-cyan-500/70 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400 mb-2">
          <Scale className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Central Inquiry Statement
          </span>
        </div>
        <blockquote className="text-xl sm:text-2xl font-black text-white leading-snug">
          &ldquo;Personalized recommendation algorithms give users more control than platforms.&rdquo;
        </blockquote>
      </div>

      {/* Step 1: Stance Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
          Step 1: Select Your Position
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STANCES.map((s) => {
            const isSelected = claimData.stance === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectStance(s.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/40 text-white'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 text-slate-300'
                }`}
              >
                <div className="font-bold text-sm mb-1 text-cyan-200">
                  {s.label}
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  {s.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Auto-Populated Claim & Evidence Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-1">
            Step 2: Construct Your Argument
          </h2>
          <p className="text-xs text-slate-400">
            Select empirical evidence from your simulation run and explain your reasoning in one short statement.
          </p>
        </div>

        {/* CLAIM (Auto-populated from stance) */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Claim (Auto-Populated from Selected Stance):
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              SIMULATION-GENERATED
            </span>
          </div>
          <div className="text-xs text-slate-200 font-medium bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
            {claimData.claim || '(Select your position above to generate your claim statement)'}
          </div>
        </div>

        {/* EVIDENCE: Select one piece */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
            Evidence: Select One Observation from the Simulation:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {EVIDENCE_PIECES.map((evItem) => {
              const isSelected = claimData.selectedEvidence === evItem;
              return (
                <button
                  key={evItem}
                  type="button"
                  onClick={() => onChangeClaim({ selectedEvidence: evItem })}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 font-bold ring-1 ring-cyan-400/40'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  {isSelected && <span className="mr-1.5">✓</span>}
                  {evItem}
                </button>
              );
            })}
          </div>
        </div>

        {/* REASONING: One short response */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <label
            htmlFor="finalReasoningField"
            className="text-xs font-bold uppercase tracking-wider text-cyan-300 block"
          >
            Reasoning: Complete this statement (One sentence):
          </label>
          <p className="text-xs text-slate-400">
            &ldquo;This evidence shows that ______ has more control because ______.&rdquo;
          </p>
          <textarea
            id="finalReasoningField"
            rows={2}
            value={claimData.reasoning || ''}
            onChange={(e) => onChangeClaim({ reasoning: e.target.value })}
            placeholder="e.g., This evidence shows that platforms have more control because their weights and goal definitions determine what can surface regardless of user preference."
            className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
          />
        </div>

        {/* OPTIONAL: Question or Uncertainty */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5">
          <label
            htmlFor="optionalFinalQuestion"
            className="text-xs font-semibold text-slate-300 block"
          >
            Optional: Question or uncertainty.
          </label>
          <input
            id="optionalFinalQuestion"
            type="text"
            value={claimData.questionOrUncertainty || ''}
            onChange={(e) =>
              onChangeClaim({ questionOrUncertainty: e.target.value })
            }
            placeholder="e.g., How can external audits verify multi-objective rankers without seeing proprietary weights?"
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
          />
        </div>

        {/* Navigation Row */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            {canProceed ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Final claim and reasoning complete!
              </span>
            ) : (
              <span className="text-slate-400">
                Select your stance, choose 1 piece of evidence, and complete the reasoning sentence.
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Evidence Snapshot</span>
            </button>

            <button
              type="button"
              onClick={onProceed}
              disabled={!canProceed}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-cyan-500/20 cursor-pointer"
            >
              <span>View Investigation Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
