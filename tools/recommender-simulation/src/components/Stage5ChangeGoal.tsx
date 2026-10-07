import React from 'react';
import {
  PlatformGoalId,
  SafetyInterventionLevel,
  ScoredContentCard,
  SignalWeights,
  Stage5Answers,
} from '../types';
import { PLATFORM_GOALS } from '../data/profiles';
import { compareFeeds } from '../utils/recommender';
import { FeedbackLoopDiagram } from './FeedbackLoopDiagram';
import {
  GitCompare,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface Stage5ChangeGoalProps {
  originalFeed: ScoredContentCard[];
  revisedFeed: ScoredContentCard[];
  originalGoalId: PlatformGoalId;
  revisedGoalId: PlatformGoalId;
  onSelectRevisedGoal: (id: PlatformGoalId) => void;
  revisedWeights: SignalWeights;
  onChangeRevisedWeight: (key: keyof SignalWeights, value: number) => void;
  revisedSafety: SafetyInterventionLevel;
  onChangeRevisedSafety: (level: SafetyInterventionLevel) => void;
  answers: Stage5Answers;
  onChangeAnswers: (answers: Partial<Stage5Answers>) => void;
  onProceed: () => void;
  onBack: () => void;
}

const BENEFICIARY_OPTIONS_STAGE5 = [
  'the user',
  'the platform',
  'advertisers',
  'familiar creators',
  'unfamiliar creators',
  'credible/public-interest sources',
  'sensational creators',
  'not sure',
];

export const Stage5ChangeGoal: React.FC<Stage5ChangeGoalProps> = ({
  originalFeed,
  revisedFeed,
  originalGoalId,
  revisedGoalId,
  onSelectRevisedGoal,
  revisedWeights,
  onChangeRevisedWeight,
  revisedSafety,
  onChangeRevisedSafety,
  answers,
  onChangeAnswers,
  onProceed,
  onBack,
}) => {
  const originalGoal = PLATFORM_GOALS[originalGoalId];
  const revisedGoal = PLATFORM_GOALS[revisedGoalId];

  const handleSelectGoal = (id: PlatformGoalId) => {
    onSelectRevisedGoal(id);
    const goal = PLATFORM_GOALS[id];
    if (goal) {
      Object.entries(goal.defaultWeights).forEach(([key, val]) => {
        onChangeRevisedWeight(key as keyof SignalWeights, val);
      });
      onChangeRevisedSafety(goal.defaultSafety);
    }
  };

  const comparisons = compareFeeds(originalFeed, revisedFeed);

  const isQ1Complete = Boolean(answers.moreDiverseFeed);
  const isQ2Complete = Boolean(answers.moreEngagingFeed);
  const isQ3Complete = Boolean(answers.primaryBeneficiary);

  // Can proceed once quick selections 1, 2, 3 are made; observation sentence is encouraged
  const canProceed = isQ1Complete && isQ2Complete && isQ3Complete;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          <span>Stage 5 of 7</span>
          <span aria-hidden="true">·</span>
          <span>Comparative System Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Stage 5: Change the Platform Goal
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          The user did not change. Their interaction history is identical. Now, simulate what happens when the <strong>platform executive priorities</strong> shift to a different objective. Compare both feeds side by side to uncover who holds structural power.
        </p>
      </div>

      {/* Visual Feedback Loop */}
      <FeedbackLoopDiagram activeNode="scoring" />

      {/* Revised Goal Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-2">
          Select a Different Platform Goal to Test
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Original Goal in Stage 2/3: <strong className="text-cyan-300">{originalGoal.title}</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(PLATFORM_GOALS).map((goal) => {
            const isSelected = goal.id === revisedGoalId;
            const isOriginal = goal.id === originalGoalId;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => handleSelectGoal(goal.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-400 bg-purple-950/40 ring-1 ring-purple-400/50 text-white'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-purple-200">
                    {goal.title}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] font-mono uppercase bg-purple-400 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                      Testing
                    </span>
                  )}
                  {isOriginal && !isSelected && (
                    <span className="text-[9px] font-mono text-slate-400">
                      (Original)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-3">
                  {goal.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">
              Side-by-Side Feed Comparison: Top 6 Positions
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Top 6 visible cards represent immediate mobile viewport visibility
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feed A: Original Goal */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                  Feed A · Original Platform Goal
                </span>
                <span className="text-sm font-bold text-white">
                  {originalGoal.title}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {originalFeed.slice(0, 6).map((card) => (
                <div
                  key={card.id}
                  className="bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 text-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                      #{card.rank}
                    </span>
                    <span className="text-[11px] font-semibold text-cyan-700">
                      {card.topic}
                    </span>
                    <span className="font-mono text-slate-500 font-bold ml-auto text-[11px]">
                      {card.score.toFixed(1)} pts
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs mb-1">
                    {card.title}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {card.creatorName} · {card.creatorType}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feed B: Revised Goal with Shift Badges */}
          <div className="bg-slate-900 border border-purple-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
                  Feed B · Revised Platform Goal
                </span>
                <span className="text-sm font-bold text-white">
                  {revisedGoal.title}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {revisedFeed.slice(0, 6).map((card) => {
                const comp = comparisons.find((c) => c.cardId === card.id);
                return (
                  <div
                    key={card.id}
                    className="bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 text-xs flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold bg-purple-900 text-white px-2 py-0.5 rounded text-[11px]">
                          #{card.rank}
                        </span>

                        {/* Movement Badge */}
                        {comp?.status === 'new_in_top_6' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            <TrendingUp className="w-3 h-3" /> New in Top 6
                          </span>
                        )}
                        {comp?.status === 'climbed' && comp.rankDelta > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded">
                            <TrendingUp className="w-3 h-3" /> +{comp.rankDelta} spots
                          </span>
                        )}
                        {comp?.status === 'dropped' && comp.rankDelta < 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            <TrendingDown className="w-3 h-3" /> {comp.rankDelta} spots
                          </span>
                        )}
                        {comp?.status === 'unchanged' && (
                          <span className="text-[10px] text-slate-400">
                            Unchanged
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-purple-950 font-bold ml-auto text-[11px]">
                        {card.score.toFixed(1)} pts
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-xs mb-1">
                      {card.title}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {card.creatorName} · {card.creatorType}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Highlight dropped items summary */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2">
          <span className="font-bold text-amber-400 uppercase tracking-wider block text-[11px]">
            Items Displaced from the Top 6
          </span>
          <div className="text-slate-300 space-y-1">
            {comparisons
              .filter((c) => c.status === 'fell_from_top_6')
              .map((c) => (
                <div key={c.cardId} className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono font-bold">
                    &bull; &ldquo;{c.card.title}&rdquo;
                  </span>
                  <span className="text-slate-400">
                    (fell from #{c.originalRank} to #{c.revisedRank})
                  </span>
                </div>
              ))}
            {comparisons.filter((c) => c.status === 'fell_from_top_6').length === 0 && (
              <span className="text-slate-400 italic">
                Minor rank adjustments within the top tier.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Streamlined Comparative Inquiry (3 Quick Choices + 1 Two-Line Field) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">
              Comparative Analysis
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            3 Multiple-Choice Questions + 1 Short Sentence
          </span>
        </div>

        {/* 1. Which feed is more diverse? */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block">
            1. Which feed is more diverse?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'feed_a', label: 'Feed A' },
              { id: 'feed_b', label: 'Feed B' },
              { id: 'about_the_same', label: 'About the same' },
            ].map((opt) => {
              const isSelected = answers.moreDiverseFeed === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onChangeAnswers({
                      moreDiverseFeed: opt.id as Stage5Answers['moreDiverseFeed'],
                    })
                  }
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-purple-400 bg-purple-950/60 text-purple-200 font-bold ring-1 ring-purple-400/50'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Which feed would probably generate more immediate engagement or watch time? */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block">
            2. Which feed would probably generate more immediate engagement or watch time?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'feed_a', label: 'Feed A' },
              { id: 'feed_b', label: 'Feed B' },
              { id: 'about_the_same', label: 'About the same' },
            ].map((opt) => {
              const isSelected = answers.moreEngagingFeed === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onChangeAnswers({
                      moreEngagingFeed: opt.id as Stage5Answers['moreEngagingFeed'],
                    })
                  }
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-purple-400 bg-purple-950/60 text-purple-200 font-bold ring-1 ring-purple-400/50'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Who benefited most when the platform goal changed? */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block">
            3. Who benefited most when the platform goal changed?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BENEFICIARY_OPTIONS_STAGE5.map((opt) => {
              const isSelected = answers.primaryBeneficiary === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangeAnswers({ primaryBeneficiary: opt })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer border capitalize ${
                    isSelected
                      ? 'border-purple-400 bg-purple-950/60 text-purple-200 font-bold ring-1 ring-purple-400/50'
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

        {/* 4. One short written observation */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2">
          <label
            htmlFor="oneImportantChange"
            className="text-xs font-bold uppercase tracking-wider text-purple-300 block"
          >
            4. Complete this observation (Two lines):
          </label>
          <p className="text-xs text-slate-400">
            &ldquo;One important change was ______ because the platform increased or decreased ______.&rdquo;
          </p>
          <textarea
            id="oneImportantChange"
            rows={2}
            value={answers.oneImportantChange || ''}
            onChange={(e) =>
              onChangeAnswers({ oneImportantChange: e.target.value })
            }
            placeholder="e.g., One important change was that civic and educational cards entered the top 6 because the platform increased the diversity weight and lowered watch time."
            className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stage 4 Interactions</span>
          </button>

          <button
            type="button"
            onClick={onProceed}
            disabled={!canProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-purple-500 hover:bg-purple-400 text-slate-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-purple-500/20 cursor-pointer"
          >
            <span>Proceed to Stage 6: Capture the Evidence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
