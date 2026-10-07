import React from 'react';
import {
  Stage6Answers,
  ScoredContentCard,
  SimulationState,
} from '../types';
import { USER_PROFILES, PLATFORM_GOALS, INTERACTION_METAS } from '../data/profiles';
import { compareFeeds } from '../utils/recommender';
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FeedbackLoopDiagram } from './FeedbackLoopDiagram';

interface Stage6EvidenceCardProps {
  state: SimulationState;
  originalFeed: ScoredContentCard[];
  revisedFeed: ScoredContentCard[];
  answers: Stage6Answers;
  onChangeAnswers: (answers: Partial<Stage6Answers>) => void;
  onProceed: () => void;
  onBack: () => void;
}

export const Stage6EvidenceCard: React.FC<Stage6EvidenceCardProps> = ({
  state,
  originalFeed,
  revisedFeed,
  answers,
  onChangeAnswers,
  onProceed,
  onBack,
}) => {
  const profile = USER_PROFILES[state.selectedProfileId];
  const origGoal = PLATFORM_GOALS[state.selectedGoalId];
  const revGoal = PLATFORM_GOALS[state.revisedGoalId];
  const comparisons = compareFeeds(originalFeed, revisedFeed);

  // Strongest positive interaction & negative interaction
  const positiveInteractions = [...state.interactions].filter(
    (ev) => (INTERACTION_METAS[ev.action]?.affinityImpact || 0) > 0
  );
  const negativeInteractions = [...state.interactions].filter(
    (ev) => (INTERACTION_METAS[ev.action]?.affinityImpact || 0) < 0
  );

  const strongestPos =
    positiveInteractions.sort(
      (a, b) =>
        (INTERACTION_METAS[b.action]?.affinityImpact || 0) -
        (INTERACTION_METAS[a.action]?.affinityImpact || 0)
    )[0];

  const strongestNeg =
    negativeInteractions.sort(
      (a, b) =>
        (INTERACTION_METAS[a.action]?.affinityImpact || 0) -
        (INTERACTION_METAS[b.action]?.affinityImpact || 0)
    )[0];

  // Largest ranking movement
  const largestMovement = [...comparisons].sort(
    (a, b) => Math.abs(b.rankDelta) - Math.abs(a.rankDelta)
  )[0];

  // Content entering and leaving top 6
  const enteredTopSix = comparisons.filter((c) => c.status === 'new_in_top_6');
  const leftTopSix = comparisons.filter((c) => c.status === 'fell_from_top_6');

  const canProceed =
    Boolean(answers.changeAndOutcome?.trim()) ||
    Boolean(answers.revelationAboutPlatform?.trim());

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          <span>Stage 6 of 7</span>
          <span aria-hidden="true">·</span>
          <span>Simulation Evidence Snapshot</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Stage 6: Capture the Evidence
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          The simulation has automatically compiled the empirical evidence from your investigation below. Review the system snapshot and respond to the two synthesis prompts.
        </p>
      </div>

      {/* Visual Feedback Loop */}
      <FeedbackLoopDiagram activeNode="updated_data" />

      {/* Automatically Generated Evidence Snapshot */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Automated Simulation Evidence Snapshot
            </h2>
          </div>
          <span className="text-[11px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-0.5 rounded font-bold">
            Auto-Generated from Experiment Data
          </span>
        </div>

        {/* System & Goal Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              <Layers className="w-3.5 h-3.5" />
              <span>User & Goals Investigated</span>
            </div>
            <div>
              <span className="text-slate-400">User Profile:</span>{' '}
              <strong className="text-white">{profile.name}</strong> ({profile.tagline})
            </div>
            <div>
              <span className="text-slate-400">Original Goal:</span>{' '}
              <strong className="text-cyan-300">{origGoal.title}</strong>{' '}
              <span className="text-slate-500 font-mono">
                (Safety: {state.safetyLevel.toUpperCase()})
              </span>
            </div>
            <div>
              <span className="text-slate-400">Revised Goal:</span>{' '}
              <strong className="text-purple-300">{revGoal.title}</strong>{' '}
              <span className="text-slate-500 font-mono">
                (Safety: {state.revisedSafetyLevel.toUpperCase()})
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold uppercase tracking-wider text-[11px]">
              <Activity className="w-3.5 h-3.5" />
              <span>Weight Comparison</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">ORIGINAL WEIGHTS</span>
                <span>Watch: {state.weights.watchTime} · Int: {state.weights.interestMatch}</span>
                <span className="block">Div: {state.weights.diversity} · Rec: {state.weights.recency}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">REVISED WEIGHTS</span>
                <span>Watch: {state.revisedWeights.watchTime} · Int: {state.revisedWeights.interestMatch}</span>
                <span className="block">Div: {state.revisedWeights.diversity} · Rec: {state.revisedWeights.recency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Behavioral Telemetry Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-2">
            <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              Strongest Recorded Signals
            </div>
            <div>
              <span className="text-slate-400">Strongest Positive Gesture:</span>{' '}
              {strongestPos ? (
                <span className="text-emerald-300 font-semibold">
                  {INTERACTION_METAS[strongestPos.action]?.label || strongestPos.action} on &ldquo;{strongestPos.cardTitle}&rdquo; (+{INTERACTION_METAS[strongestPos.action]?.affinityImpact} affinity)
                </span>
              ) : (
                <span className="text-slate-500 italic">None</span>
              )}
            </div>
            <div>
              <span className="text-slate-400">Strongest Negative Gesture:</span>{' '}
              {strongestNeg ? (
                <span className="text-rose-300 font-semibold">
                  {INTERACTION_METAS[strongestNeg.action]?.label || strongestNeg.action} on &ldquo;{strongestNeg.cardTitle}&rdquo; ({INTERACTION_METAS[strongestNeg.action]?.affinityImpact} affinity)
                </span>
              ) : (
                <span className="text-slate-500 italic">None</span>
              )}
            </div>
            <div>
              <span className="text-slate-400">Feedback Loop Pattern:</span>{' '}
              <span className="text-slate-200">
                User interactions dynamically biased topic scoring by up to ±6.0 points across successive recalculations.
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-2">
            <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              Ranking Movement & Viewport Shifts
            </div>
            <div>
              <span className="text-slate-400">Largest Rank Delta:</span>{' '}
              {largestMovement ? (
                <span className="text-white font-semibold">
                  &ldquo;{largestMovement.card.title}&rdquo; shifted{' '}
                  <span className={largestMovement.rankDelta > 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {largestMovement.rankDelta > 0 ? `+${largestMovement.rankDelta}` : largestMovement.rankDelta} spots
                  </span>{' '}
                  (from #{largestMovement.originalRank} to #{largestMovement.revisedRank})
                </span>
              ) : (
                <span className="text-slate-500 italic">None</span>
              )}
            </div>
            <div>
              <span className="text-slate-400">Entered Top 6:</span>{' '}
              {enteredTopSix.length > 0 ? (
                <span className="text-emerald-300">
                  {enteredTopSix.map((c) => c.card.title).join(', ')}
                </span>
              ) : (
                <span className="text-slate-400 italic">No new entries</span>
              )}
            </div>
            <div>
              <span className="text-slate-400">Left Top 6:</span>{' '}
              {leftTopSix.length > 0 ? (
                <span className="text-rose-300">
                  {leftTopSix.map((c) => c.card.title).join(', ')}
                </span>
              ) : (
                <span className="text-slate-400 italic">No displacements</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two Required Student Synthesis Prompts (~3 lines each) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">
            Synthesize Your Evidence
          </h2>
        </div>
        <p className="text-xs text-slate-300">
          Answer the two short inquiry questions below based on the automated evidence snapshot above.
        </p>

        <div className="space-y-4">
          {/* Prompt 1 */}
          <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2">
            <label
              htmlFor="changeAndOutcome"
              className="text-xs font-bold uppercase tracking-wider text-cyan-300 block"
            >
              1. What did you change, and what happened to the feed?
            </label>
            <textarea
              id="changeAndOutcome"
              rows={3}
              value={answers.changeAndOutcome || ''}
              onChange={(e) =>
                onChangeAnswers({ changeAndOutcome: e.target.value })
              }
              placeholder="e.g., I switched the goal from Maximize Watch Time to Increase Diversity, which raised the diversity multiplier to 10. As a result, civic reporting entered the top 6 and sensational clips were demoted."
              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
            />
          </div>

          {/* Prompt 2 */}
          <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2">
            <label
              htmlFor="revelationAboutPlatform"
              className="text-xs font-bold uppercase tracking-wider text-cyan-300 block"
            >
              2. What does this reveal about platform goals, signals or feedback?
            </label>
            <textarea
              id="revelationAboutPlatform"
              rows={3}
              value={answers.revelationAboutPlatform || ''}
              onChange={(e) =>
                onChangeAnswers({ revelationAboutPlatform: e.target.value })
              }
              placeholder="e.g., This demonstrates that even though the user's data remained identical, the platform's choice of objective function fundamentally shapes what information the user sees."
              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            {canProceed ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Ready to formulate your final claim!
              </span>
            ) : (
              <span className="text-slate-400">
                Write a one-sentence synthesis in either field above to proceed.
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
              <span>Back to Stage 5 Goal Comparison</span>
            </button>

            <button
              type="button"
              onClick={onProceed}
              disabled={!canProceed}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-cyan-500/20 cursor-pointer"
            >
              <span>Proceed to Stage 7: Final Claim</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
