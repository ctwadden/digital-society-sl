import React from 'react';
import {
  PlatformGoalId,
  SafetyInterventionLevel,
  SignalWeights,
  Stage2Answers,
} from '../types';
import { PLATFORM_GOALS } from '../data/profiles';
import { Sliders, Shield, ArrowRight, ArrowLeft, Target, Eye, CheckCircle2 } from 'lucide-react';
import { FeedbackLoopDiagram } from './FeedbackLoopDiagram';

interface Stage2BecomeAlgorithmProps {
  selectedGoalId: PlatformGoalId;
  onSelectGoal: (id: PlatformGoalId) => void;
  weights: SignalWeights;
  onChangeWeight: (key: keyof SignalWeights, value: number) => void;
  safetyLevel: SafetyInterventionLevel;
  onChangeSafety: (level: SafetyInterventionLevel) => void;
  answers: Stage2Answers;
  onChangeAnswers: (answers: Partial<Stage2Answers>) => void;
  onProceed: () => void;
  onBack: () => void;
}

const CONTENT_RISE_OPTIONS = [
  'strong interest match',
  'high predicted watch time',
  'fresh / recent uploads',
  'popular / previously interacted items',
  'diverse viewpoints',
];

const CONTENT_LOSE_OPTIONS = [
  'older uploads',
  'niche topics',
  'low predicted watch time',
  'diverse or unfamiliar topics',
  'sensitive / flagged content',
];

const BENEFICIARY_OPTIONS = [
  'the user (discovering relevant content)',
  'the platform (maximizing watch time and advertising revenue)',
  'advertisers / sponsors',
  'viral creators',
];

export const Stage2BecomeAlgorithm: React.FC<Stage2BecomeAlgorithmProps> = ({
  selectedGoalId,
  onSelectGoal,
  weights,
  onChangeWeight,
  safetyLevel,
  onChangeSafety,
  answers,
  onChangeAnswers,
  onProceed,
  onBack,
}) => {
  const currentGoal = PLATFORM_GOALS[selectedGoalId];

  const handleGoalSelect = (goalId: PlatformGoalId) => {
    onSelectGoal(goalId);
    // Load sensible default weights & safety from selected goal
    const goal = PLATFORM_GOALS[goalId];
    if (goal) {
      Object.entries(goal.defaultWeights).forEach(([key, val]) => {
        onChangeWeight(key as keyof SignalWeights, val);
      });
      onChangeSafety(goal.defaultSafety);
    }
  };

  const sliderMeta: {
    key: keyof SignalWeights;
    label: string;
    description: string;
    rangeLabel: string;
  }[] = [
    {
      key: 'interestMatch',
      label: 'Interest Match Weight',
      description: 'How strongly to prioritize topics matching explicit/implicit profile interests.',
      rangeLabel: '0 (Ignored) → 10 (Highest Priority)',
    },
    {
      key: 'watchTime',
      label: 'Watch-Time Prediction Weight',
      description: 'How strongly to favor content predicted to sustain long session duration.',
      rangeLabel: '0 (Disregarded) → 10 (Max Retention Driver)',
    },
    {
      key: 'previousInteractions',
      label: 'Previous Interactions Weight',
      description: 'Weight given to items similar to ones previously liked, shared, or completed.',
      rangeLabel: '0 (No History) → 10 (Echo Chamber Risk)',
    },
    {
      key: 'recency',
      label: 'Recency & Velocity Weight',
      description: 'Priority given to newly published breaking items versus evergreen posts.',
      rangeLabel: '0 (Age Irrelevant) → 10 (Breaking Only)',
    },
    {
      key: 'diversity',
      label: 'Diversity Factor Weight',
      description: 'Incentive to inject novel categories, counter-viewpoints, and unfamiliar subjects.',
      rangeLabel: '0 (Monoculture) → 10 (Maximum Broadening)',
    },
  ];

  const hasSelections =
    Boolean(answers.likelyToRise) &&
    Boolean(answers.likelyToLose) &&
    Boolean(answers.likelyBeneficiary);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          <span>Stage 2 of 7</span>
          <span aria-hidden="true">·</span>
          <span>Algorithmic Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Stage 2: Become the Algorithm
        </h1>
        <div className="mt-2 p-3 bg-slate-900 border-l-4 border-cyan-400 rounded-r-xl text-sm text-slate-200 leading-relaxed">
          &ldquo;A recommender system assigns importance to different signals. It uses these signals to score and rank possible content. Changing the importance of a signal can change the feed.&rdquo;
        </div>
      </div>

      {/* Visual Feedback Loop highlighting SIGNALS & SCORING */}
      <FeedbackLoopDiagram activeNode="scoring" />

      {/* Preset Platform Goals */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Step 1: Choose a Commercial / Civic Platform Goal
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Presets automatically adjust baseline weights (customizable below)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(PLATFORM_GOALS).map((goal) => {
            const isSelected = goal.id === selectedGoalId;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => handleGoalSelect(goal.id)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400/40 text-white'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-cyan-200">
                    {goal.title}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono uppercase bg-cyan-400 text-slate-950 px-2 py-0.5 rounded font-bold">
                      Active Goal
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mb-2 font-medium">
                  {goal.tagline}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {goal.description}
                </p>
                <div className="mt-3 text-[11px] text-amber-300/90 font-medium">
                  Primary beneficiary:{' '}
                  <span className="text-slate-300 font-normal">
                    {goal.beneficiaryHint}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 Signal Sliders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            Step 2: Calibrate the 5 Mathematical Signal Weights (0 to 10)
          </h2>
        </div>
        <p className="text-xs text-slate-300">
          Tune each slider to govern the scoring formula. Higher weights directly multiply the contribution of that signal when ordering cards.
        </p>

        <div className="space-y-5">
          {sliderMeta.map((item) => {
            const value = weights[item.key];
            return (
              <div
                key={item.key}
                className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <label
                      htmlFor={`slider-${item.key}`}
                      className="text-sm font-bold text-slate-100 block"
                    >
                      {item.label}
                    </label>
                    <span className="text-xs text-slate-400">
                      {item.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="font-mono text-xl font-black text-cyan-300 tabular-nums">
                      {value}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/ 10</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">0</span>
                  <input
                    id={`slider-${item.key}`}
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={value}
                    onChange={(e) =>
                      onChangeWeight(item.key, parseInt(e.target.value, 10))
                    }
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={value}
                    aria-label={item.label}
                  />
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">10</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  {item.rangeLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            Step 3: Content Moderation & Safety Intervention Level
          </h2>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          How aggressively does the recommender penalize or demote unverified health claims, conspiracy theories, and sensational outrage content?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(
            [
              {
                id: 'low',
                title: 'Low Intervention',
                penalty: 'Minimal damping (-2 to -4 pts)',
                desc: 'Unfiltered virality. Sensational or fringe claims travel freely if engagement is high.',
              },
              {
                id: 'balanced',
                title: 'Balanced Moderation',
                penalty: 'Moderate deduction (-8 to -18 pts)',
                desc: 'Demotes questionable material to middle of feed while preserving user autonomy.',
              },
              {
                id: 'strong',
                title: 'Strong Intervention',
                penalty: 'Strict suppression (-18 to -38 pts)',
                desc: 'Aggressive safety guardrails. Non-authoritative medical or conspiratorial items rarely surface.',
              },
            ] as const
          ).map((lvl) => {
            const isSelected = safetyLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => onChangeSafety(lvl.id)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/40 text-white'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-amber-200">
                    {lvl.title}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono uppercase bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-amber-400/90 mb-2">
                  {lvl.penalty}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lvl.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Streamlined Pre-Ranking Selection Module (Takes ~30 seconds) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Formulate Your Ranking Hypothesis
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            3 Quick Selections · Estimated time: ~30 seconds
          </span>
        </div>

        {/* 1. Which content will probably rise? */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
            1. Which content will probably rise?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONTENT_RISE_OPTIONS.map((opt) => {
              const isSelected = answers.likelyToRise === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangeAnswers({ likelyToRise: opt })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200 font-bold ring-1 ring-cyan-400/40'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Which content may lose visibility? */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
            2. Which content may lose visibility?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONTENT_LOSE_OPTIONS.map((opt) => {
              const isSelected = answers.likelyToLose === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangeAnswers({ likelyToLose: opt })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/50 text-amber-200 font-bold ring-1 ring-amber-400/40'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Who is most likely to benefit from this configuration? */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
            3. Who is most likely to benefit from this configuration?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BENEFICIARY_OPTIONS.map((opt) => {
              const isSelected = answers.likelyBeneficiary === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangeAnswers({ likelyBeneficiary: opt })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-purple-400 bg-purple-950/50 text-purple-200 font-bold ring-1 ring-purple-400/40'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* OPTIONAL Field: Explain one prediction */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <label
            htmlFor="optionalStage2Explanation"
            className="text-xs font-semibold text-slate-300 block"
          >
            Optional: Explain one prediction.
          </label>
          <input
            id="optionalStage2Explanation"
            type="text"
            value={answers.optionalExplanation || ''}
            onChange={(e) =>
              onChangeAnswers({ optionalExplanation: e.target.value })
            }
            placeholder="e.g., Advertisers benefit because high watch time keeps the user engaged in the app longer."
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            {hasSelections ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> 3 predictions selected! Ready to observe the ranking.
              </span>
            ) : (
              <span className="text-slate-400">
                Select an option for questions 1, 2, and 3 above.
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
              <span>Back to User Profile</span>
            </button>

            <button
              type="button"
              onClick={onProceed}
              disabled={!hasSelections}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-cyan-500/20 cursor-pointer"
            >
              <span>Proceed to Stage 3: Rank the Content</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
