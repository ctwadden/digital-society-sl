import React, { useState } from 'react';
import {
  ScoredContentCard,
  SignalWeights,
  SafetyInterventionLevel,
  Stage3Answers,
  PlatformGoalId,
} from '../types';
import { PLATFORM_GOALS } from '../data/profiles';
import { ContentCard } from './ContentCard';
import { FeedbackLoopDiagram } from './FeedbackLoopDiagram';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2,
  MousePointerClick,
} from 'lucide-react';

interface Stage3RankContentProps {
  scoredCards: ScoredContentCard[];
  goalId: PlatformGoalId;
  weights: SignalWeights;
  safetyLevel: SafetyInterventionLevel;
  answers: Stage3Answers;
  onChangeAnswers: (answers: Partial<Stage3Answers>) => void;
  onProceed: () => void;
  onBack: () => void;
}

const SURPRISING_REASONS = [
  'ranked higher than expected',
  'ranked lower than expected',
  'safety had little effect',
  'diversity had a strong effect',
  'watch time dominated',
  'previous interactions dominated',
  'another reason',
];

export const Stage3RankContent: React.FC<Stage3RankContentProps> = ({
  scoredCards,
  goalId,
  weights,
  safetyLevel,
  answers,
  onChangeAnswers,
  onProceed,
  onBack,
}) => {
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const currentGoal = PLATFORM_GOALS[goalId];

  // Get distinct topics for interactive segmented filter
  const topics = Array.from(new Set(scoredCards.map((c) => c.topic)));

  const filteredCards =
    filterTopic === 'all'
      ? scoredCards
      : scoredCards.filter((c) => c.topic === filterTopic);

  const selectedCard = scoredCards.find((c) => c.id === answers.surprisingCardId);

  const isCardSelected = Boolean(answers.surprisingCardId);
  const isReasonSelected = Boolean(answers.surprisingReason);

  // Can proceed once card and reason are chosen; one-sentence statement is encouraged
  const canProceed = isCardSelected && isReasonSelected;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          <span>Stage 3 of 7</span>
          <span aria-hidden="true">·</span>
          <span>Feed Generation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Stage 3: Rank the Content
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          The recommender mathematical engine has computed ranking scores for all 12 candidate posts using your active weights ({weights.interestMatch} interest, {weights.watchTime} watch time, {weights.previousInteractions} interactions, {weights.recency} recency, {weights.diversity} diversity, {safetyLevel} safety).
        </p>
      </div>

      {/* Visual Feedback Loop highlighting RANKED FEED */}
      <FeedbackLoopDiagram activeNode="ranked_feed" />

      {/* Educational Model Formula Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                SIMPLIFIED CLASSROOM MODEL
              </span>
              <h2 className="text-sm font-bold text-white mt-1">
                Linear Scoring Formula in Effect
              </h2>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Active Goal: <strong className="text-cyan-300">{currentGoal.title}</strong>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
          Score = (Interest × {weights.interestMatch}) + (WatchTime × {weights.watchTime}) + (Interactions × {weights.previousInteractions}) + (Recency × {weights.recency}) + (Diversity × {weights.diversity}) - SafetyPenalty({safetyLevel})
        </div>

        <p className="text-xs text-slate-400 italic">
          Disclaimer: This formula is an illustrative educational model for Grade 11 inquiry into algorithmic mechanisms. Real commercial platforms (TikTok, YouTube, Meta, X) rely on multi-stage candidate generators, neural embeddings, graph databases, and continuous reinforcement learning.
        </p>
      </div>

      {/* Interactive Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Ranked Output (12 Items)</span>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setFilterTopic('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              filterTopic === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Topics ({scoredCards.length})
          </button>
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterTopic(t)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterTopic === t
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Instruction to select card */}
      <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl text-xs text-cyan-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {answers.surprisingCardId ? (
              <span>
                Selected surprising post:{' '}
                <strong className="text-white">
                  #{selectedCard?.rank} &ldquo;{selectedCard?.title}&rdquo;
                </strong>
              </span>
            ) : (
              'Click on any content card below to select the result that surprised you most.'
            )}
          </span>
        </div>
        {answers.surprisingCardId && (
          <button
            type="button"
            onClick={() => onChangeAnswers({ surprisingCardId: '' })}
            className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
          >
            Change
          </button>
        )}
      </div>

      {/* Ranked Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCards.map((card) => {
          const isSelected = answers.surprisingCardId === card.id;
          return (
            <div
              key={card.id}
              onClick={() => onChangeAnswers({ surprisingCardId: card.id })}
              className={`relative rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? 'ring-3 ring-cyan-400 shadow-lg shadow-cyan-950/60'
                  : 'hover:ring-1 hover:ring-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 z-10 bg-cyan-500 text-slate-950 font-bold text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> Selected Surprise
                </div>
              )}
              <ContentCard
                card={card}
                showScore={true}
                showRank={true}
                interactive={false}
              />
            </div>
          );
        })}
      </div>

      {/* Streamlined Analysis Module (Quick Selection + 1 Two-Line Field) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              Analyze the Results
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            2 Quick Selections + 1 Short Sentence
          </span>
        </div>

        {/* 1. Select the result that surprised you most */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2.5">
          <label
            htmlFor="surprisingCardSelect"
            className="text-xs font-bold uppercase tracking-wider text-cyan-300 block"
          >
            1. Result that surprised you most (Click any card above or select below):
          </label>
          <select
            id="surprisingCardSelect"
            value={answers.surprisingCardId || ''}
            onChange={(e) => onChangeAnswers({ surprisingCardId: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none cursor-pointer"
          >
            <option value="">-- Choose a ranked card to analyze --</option>
            {scoredCards.map((c) => (
              <option key={c.id} value={c.id}>
                Rank #{c.rank} · &ldquo;{c.title}&rdquo; ({c.topic}) · Score: {c.score.toFixed(1)}
              </option>
            ))}
          </select>
          {selectedCard && (
            <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-lg border border-cyan-800/80 text-xs text-slate-200">
              <div>
                <span className="font-mono font-bold text-cyan-300 mr-2">
                  Rank #{selectedCard.rank}
                </span>
                <span className="font-semibold text-white">
                  &ldquo;{selectedCard.title}&rdquo;
                </span>{' '}
                <span className="text-slate-400">({selectedCard.topic})</span>
              </div>
              <span className="text-xs text-emerald-400 font-bold">✓ Selected</span>
            </div>
          )}
        </div>

        {/* 2. Why was it surprising? */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
            2. Why was it surprising?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SURPRISING_REASONS.map((reason) => {
              const isSelected = answers.surprisingReason === reason;
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => onChangeAnswers({ surprisingReason: reason })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200 font-bold ring-1 ring-cyan-400/40'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {reason}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. One short required field */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2">
          <label
            htmlFor="mostImportantSignalReason"
            className="text-xs font-bold uppercase tracking-wider text-cyan-300 block"
          >
            3. Complete this statement:
          </label>
          <p className="text-xs text-slate-400">
            &ldquo;The most important signal in this result was ______ because ______.&rdquo;
          </p>
          <textarea
            id="mostImportantSignalReason"
            rows={2}
            value={answers.mostImportantSignalReason || ''}
            onChange={(e) =>
              onChangeAnswers({ mostImportantSignalReason: e.target.value })
            }
            placeholder="e.g., The most important signal in this result was watch-time prediction because its 10x multiplier lifted it above local news."
            className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Algorithm Weights</span>
          </button>

          <button
            type="button"
            onClick={onProceed}
            disabled={!canProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-cyan-500/20 cursor-pointer"
          >
            <span>Proceed to Stage 4: Interact with the Feed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
