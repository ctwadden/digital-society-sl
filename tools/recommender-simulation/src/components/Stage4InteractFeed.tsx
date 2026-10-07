import React, { useState } from 'react';
import {
  ScoredContentCard,
  UserInteractionEvent,
  InteractionType,
  Stage4MidPrediction,
} from '../types';
import { INTERACTION_METAS } from '../data/profiles';
import { computeUpdatedAffinities } from '../utils/recommender';
import { ContentCard } from './ContentCard';
import { FeedbackLoopDiagram } from './FeedbackLoopDiagram';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  History,
} from 'lucide-react';

interface Stage4InteractFeedProps {
  scoredCards: ScoredContentCard[];
  interactions: UserInteractionEvent[];
  onAddInteraction: (cardId: string, action: InteractionType) => void;
  midPredictions: {
    step2?: Stage4MidPrediction;
    step4?: Stage4MidPrediction;
  };
  onSaveMidPrediction: (step: 2 | 4, pred: Stage4MidPrediction) => void;
  onProceed: () => void;
  onBack: () => void;
}

const STEP2_PREDICTION_OPTIONS = [
  'more content from this topic',
  'less content from this topic',
  'similar creators will rise',
  'unfamiliar topics will disappear',
  'little or no change',
  'not sure',
];

const BREADTH_PREDICTION_OPTIONS = [
  'much broader',
  'somewhat broader',
  'no clear change',
  'somewhat narrower',
  'much narrower',
];

export const Stage4InteractFeed: React.FC<Stage4InteractFeedProps> = ({
  scoredCards,
  interactions,
  onAddInteraction,
  midPredictions,
  onSaveMidPrediction,
  onProceed,
  onBack,
}) => {
  const interactionCount = interactions.length;
  // Display the actual scaled, capped topic-affinity change from each action.
  let runningAffinities: Record<string, number> = {};
  const affinityChanges = interactions.map((event) => {
    const previous = runningAffinities[event.topic] || 0;
    runningAffinities = computeUpdatedAffinities(
      runningAffinities,
      event.topic,
      INTERACTION_METAS[event.action]?.affinityImpact || 0
    );
    return Math.round((runningAffinities[event.topic] - previous) * 10) / 10;
  });

  // Track if student is currently completing a required prediction prompt at checkpoint 2 or 4
  const isAwaitingCheckpoint2 =
    interactionCount >= 2 && !midPredictions.step2;
  const isAwaitingCheckpoint4 =
    interactionCount >= 4 && !midPredictions.step4;

  // State for Checkpoint 2
  const [selectedStep2Pred, setSelectedStep2Pred] = useState('');
  const [optionalStep2Expl, setOptionalStep2Expl] = useState('');

  // State for Checkpoint 4
  const [selectedBreadthPred, setSelectedBreadthPred] = useState('');
  const [selectedStrongestActionIndex, setSelectedStrongestActionIndex] = useState<number | null>(null);
  const [optionalStep4Expl, setOptionalStep4Expl] = useState('');

  const handleSaveCheckpoint2 = () => {
    if (!selectedStep2Pred) return;
    onSaveMidPrediction(2, {
      step: 2,
      step2Prediction: selectedStep2Pred,
      step2OptionalExplanation: optionalStep2Expl,
      showMorePrediction: selectedStep2Pred, // backward compatibility
    });
  };

  const handleSaveCheckpoint4 = () => {
    if (!selectedBreadthPred || selectedStrongestActionIndex === null) return;
    onSaveMidPrediction(4, {
      step: 4,
      breadthPrediction: selectedBreadthPred,
      strongestActionIndex: selectedStrongestActionIndex,
      step4OptionalExplanation: optionalStep4Expl,
      showMorePrediction: selectedBreadthPred, // backward compatibility
    });
  };

  const isComplete =
    interactionCount >= 6 &&
    Boolean(midPredictions.step2) &&
    Boolean(midPredictions.step4);

  // Determine current active node in the feedback loop
  const activeLoopNode =
    interactionCount === 0
      ? 'ranked_feed'
      : isAwaitingCheckpoint2 || isAwaitingCheckpoint4
      ? 'user_action'
      : 'updated_data';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          <span>Stage 4 of 7</span>
          <span aria-hidden="true">·</span>
          <span>Behavioral Feedback Loop</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Stage 4: Interact with the Feed
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Every time a user watches, likes, shares, or dismisses a card, their action functions as an empirical signal. Complete <strong>6 interactions</strong> below. The algorithm updates topic affinity and re-ranks the feed immediately after each action. Pause after actions 2 and 4 to record your predictions and observations.
        </p>
      </div>

      {/* Visual Feedback Loop Architecture */}
      <FeedbackLoopDiagram activeNode={activeLoopNode} />

      {/* Progress & Telemetry Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Interaction Quota
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-mono text-cyan-300 tabular-nums">
              {Math.min(6, interactionCount)}
            </span>
            <span className="text-slate-500 font-mono text-sm">/ 6 Completed</span>
          </div>
        </div>

        {/* Visual progress dots */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const completed = interactionCount >= num;
            const isCheckpoint = num === 2 || num === 4 || num === 6;
            return (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-all ${
                  completed
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : isCheckpoint
                    ? 'bg-slate-950 text-slate-400 border-amber-500/50'
                    : 'bg-slate-950 text-slate-600 border-slate-800'
                }`}
                title={isCheckpoint ? `Checkpoint ${num}: Review the updated feed` : `Interaction ${num}`}
              >
                {completed ? '✓' : num}
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkpoint 2 Prediction Interruption (Simplified selection chips) */}
      {isAwaitingCheckpoint2 && (
        <div className="bg-amber-950/40 border-2 border-amber-500 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">
              Feedback Loop Checkpoint 1 (After 2 Interactions)
            </h2>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            You completed 2 actions:
            <strong className="text-cyan-300">
              {' '}{interactions[0]?.action.replace('_', ' ')} on &ldquo;{interactions[0]?.cardTitle}&rdquo;
            </strong>{' '}
            and{' '}
            <strong className="text-cyan-300">
              {interactions[1]?.action.replace('_', ' ')} on &ldquo;{interactions[1]?.cardTitle}&rdquo;
            </strong>.
          </p>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
              If you continue interacting in a similar way, what do you predict will happen? (Select one)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STEP2_PREDICTION_OPTIONS.map((opt) => {
                const isSelected = selectedStep2Pred === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedStep2Pred(opt)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-bold ring-1 ring-amber-400/50'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Optional Field */}
            <div className="pt-2">
              <label
                htmlFor="optionalStep2Explanation"
                className="text-[11px] text-slate-400 block mb-1"
              >
                Optional: explain further in one sentence
              </label>
              <input
                id="optionalStep2Explanation"
                type="text"
                value={optionalStep2Expl}
                onChange={(e) => setOptionalStep2Expl(e.target.value)}
                placeholder="e.g., The algorithm will likely boost this topic because share is a viral signal."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveCheckpoint2}
              disabled={!selectedStep2Pred}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all disabled:opacity-40 cursor-pointer"
            >
              Save Prediction & Continue
            </button>
          </div>
        </div>
      )}

      {/* Checkpoint 4 Prediction Interruption (Breadth + Strongest Action) */}
      {isAwaitingCheckpoint4 && (
        <div className="bg-amber-950/40 border-2 border-amber-500 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">
              Feedback Loop Checkpoint 2 (After 4 Interactions)
            </h2>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            You completed 4 actions. Notice how the behavioral feedback loop is continuously tuning the feed.
          </p>

          <div className="space-y-4">
            {/* 1. Is the feed becoming broader or narrower? */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                1. Is the feed becoming broader or narrower? (Select one)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {BREADTH_PREDICTION_OPTIONS.map((opt) => {
                  const isSelected = selectedBreadthPred === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedBreadthPred(opt)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-bold ring-1 ring-amber-400/50'
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

            {/* 2. Which action created the strongest signal? */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                2. Which action created the strongest signal? (Select one of your 4 actions)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {interactions.slice(0, 4).map((actionEvent, index) => {
                  const isSelected = selectedStrongestActionIndex === index;
                  const meta = INTERACTION_METAS[actionEvent.action];
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedStrongestActionIndex(index)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/60 text-amber-200 font-bold ring-1 ring-amber-400/50'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          ACTION #{index + 1}: {meta?.label || actionEvent.action}
                        </span>
                        {isSelected && <span className="text-amber-400">✓ Selected</span>}
                      </div>
                      <div className="text-xs font-semibold text-white">
                        &ldquo;{actionEvent.cardTitle}&rdquo;
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Topic: {actionEvent.topic}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Field */}
            <div>
              <label
                htmlFor="optionalStep4Explanation"
                className="text-[11px] text-slate-400 block mb-1"
              >
                Optional: explain further in one sentence
              </label>
              <input
                id="optionalStep4Explanation"
                type="text"
                value={optionalStep4Expl}
                onChange={(e) => setOptionalStep4Expl(e.target.value)}
                placeholder="e.g., The 'Not Interested' dismissal triggered a sharp penalty against similar posts."
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveCheckpoint4}
              disabled={!selectedBreadthPred || selectedStrongestActionIndex === null}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all disabled:opacity-40 cursor-pointer"
            >
              Save Observation & Continue
            </button>
          </div>
        </div>
      )}

      {/* Signal Log & Explanations */}
      {interactions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <History className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Real-Time Signal Log: How Your Actions Updated User Data
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {interactions.map((event, idx) => {
              const meta = INTERACTION_METAS[event.action];
              const affinityChange = affinityChanges[idx];
              return (
                <div
                  key={idx}
                  className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs flex items-start gap-2"
                >
                  <span className="font-mono text-cyan-400 font-bold">
                    #{idx + 1}
                  </span>
                  <div className="leading-snug">
                    <div className="font-semibold text-slate-200">
                      {meta?.label || event.action}: &ldquo;{event.cardTitle}&rdquo;
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Signal: Topic &ldquo;{event.topic}&rdquo;{' '}
                      <span className={affinityChange > 0 ? 'text-emerald-400 font-bold' : affinityChange < 0 ? 'text-rose-400 font-bold' : 'text-slate-400 font-bold'}>
                        {affinityChange > 0 ? '+' : ''}{affinityChange.toFixed(1)} affinity
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400">
            Each action&apos;s signal strength is scaled by 0.4. Total topic affinity is capped at −6.0 to +6.0 and adjusts Interest Match, which is capped at 0.5 to 10.0. A signal may change the score without changing the rank.
          </p>
        </div>
      )}

      {/* Content Cards Grid with Active Interactive Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Current Dynamic Feed ({scoredCards.length} Cards)
          </h2>
          <span className="text-xs text-slate-400">
            {interactionCount < 6
              ? 'Click any action below a card to send a signal to the algorithm'
              : 'All 6 interactions completed! Review feedback loop below.'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {scoredCards.map((card) => (
            <ContentCard
              key={card.id}
              card={card}
              showScore={true}
              showRank={true}
              interactive={interactionCount < 6 && !isAwaitingCheckpoint2 && !isAwaitingCheckpoint4}
              onInteract={onAddInteraction}
              disabledInteractions={
                interactionCount >= 6 ||
                isAwaitingCheckpoint2 ||
                isAwaitingCheckpoint4
              }
            />
          ))}
        </div>
      </div>

      {/* Completion & Proceed Card */}
      {isComplete && (
        <div className="bg-emerald-950/40 border border-emerald-500/60 rounded-2xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">
              Feedback Loop Investigation Complete!
            </h2>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            You observed how individual behavioral choices (watching, liking, skipping) transformed into numerical telemetry, which recalculated the ranking order. In Stage 5, you will test what happens when the <strong>platform itself changes its goal</strong> while holding user data constant!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Stage 3 Feed</span>
            </button>

            <button
              type="button"
              onClick={onProceed}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-all shadow-md cursor-pointer"
            >
              <span>Proceed to Stage 5: Change the Goal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
