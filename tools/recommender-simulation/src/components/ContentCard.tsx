import React, { useState } from 'react';
import {
  ScoredContentCard,
  InteractionType,
} from '../types';
import { INTERACTION_METAS } from '../data/profiles';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
  Play,
  CheckCircle,
  ThumbsUp,
  Share2,
  FastForward,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface ContentCardProps {
  card: ScoredContentCard;
  showScore?: boolean;
  showRank?: boolean;
  interactive?: boolean;
  onInteract?: (cardId: string, action: InteractionType) => void;
  disabledInteractions?: boolean;
  rankBadgeOverride?: React.ReactNode;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  card,
  showScore = true,
  showRank = true,
  interactive = false,
  onInteract,
  disabledInteractions = false,
  rankBadgeOverride,
}) => {
  const [expandedWhy, setExpandedWhy] = useState(false);

  const getCategoryLabel = () => {
    switch (card.categoryType) {
      case 'highly_relevant':
        return 'Core Interest Match';
      case 'unfamiliar_useful':
        return 'Exploratory Discovery';
      case 'entertainment':
        return 'Viral Entertainment';
      case 'news_public':
        return 'Civic / Local News';
      case 'sponsored':
        return 'Paid Promotion';
      case 'reliable_health_edu':
        return 'Verified Educational';
      case 'sensational':
        return 'High-Emotion Sensational';
      case 'mild_safety_concern':
        return 'Safety / Quality Flag';
      default:
        return card.topic;
    }
  };

  return (
    <article
      className="bg-white text-slate-900 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
      aria-labelledby={`card-title-${card.id}`}
    >
      <div className="p-5">
        {/* Header row: Rank, Category type, Safety indicator */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {showRank && (
              <span className="inline-flex items-center justify-center font-mono font-bold text-xs bg-slate-900 text-white rounded px-2 py-0.5">
                #{card.rank}
              </span>
            )}
            {rankBadgeOverride}

            {/* Zero-pill metadata */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span className="text-cyan-700">{card.topic}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-slate-500 font-normal">{getCategoryLabel()}</span>
            </div>
          </div>

          {/* Safety Risk Indicator */}
          {card.safetyRiskLevel !== 'low' ? (
            <div
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"
              title="Flagged by safety heuristics for unverified or sensational assertions"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
              <span>Mild Concern</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Standard</span>
            </div>
          )}
        </div>

        {/* Card Title */}
        <h3
          id={`card-title-${card.id}`}
          className="text-base font-bold text-slate-900 leading-snug mb-2 hover:text-cyan-800 transition-colors"
        >
          {card.title}
        </h3>

        {/* Short fictional description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          {card.description}
        </p>

        {/* Creator & Publishing metadata (Zero-Pill discipline) */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 pb-3 border-b border-slate-100 flex-wrap">
          <span className="font-medium text-slate-700">{card.creatorName}</span>
          <span aria-hidden="true">·</span>
          <span>{card.creatorType}</span>
          <span aria-hidden="true">·</span>
          <span>{card.publicationAge}</span>
        </div>

        {/* Key Signals Data Strip */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">WATCH TIME</span>
            <span className="font-semibold text-slate-800">
              {card.predictedWatchTimeScore.toFixed(1)}/10
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">INTEREST MATCH</span>
            <span className="font-semibold text-slate-800">
              {card.interestMatchScore.toFixed(1)}/10
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">HISTORICAL ENG.</span>
            <span className="font-semibold text-slate-800">
              {card.previousInteractionScore.toFixed(1)}/10
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">DIVERSITY</span>
            <span className="font-semibold text-slate-800">
              {card.diversityContribution.toFixed(1)}/10
            </span>
          </div>
        </div>
      </div>

      {/* Footer Area: Score and Expandable Reason */}
      <div className="bg-slate-100/90 border-t border-slate-200 p-4">
        {showScore && (
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                SIMPLIFIED CLASSROOM MODEL SCORE
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black tabular-nums text-slate-900">
                  {card.score.toFixed(1)}
                </span>
                <span className="text-[11px] text-slate-500">ranking points</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpandedWhy(!expandedWhy)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-800 hover:text-cyan-950 px-2.5 py-1.5 rounded-md hover:bg-slate-200/80 transition-colors"
              aria-expanded={expandedWhy}
            >
              <span>{expandedWhy ? 'Hide Signals' : 'Why Recommended?'}</span>
              {expandedWhy ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        {/* Expandable Explanation Panel */}
        {expandedWhy && (
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-2.5 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-cyan-900 font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-700" aria-hidden="true" />
              <span>Three Most Influential Signals</span>
            </div>

            <ol className="space-y-1.5 list-decimal list-inside pl-1 text-[11px]">
              {card.topSignals.map((sig, idx) => (
                <li key={idx} className="leading-snug">
                  <strong className="text-slate-900">{sig.name}:</strong>{' '}
                  <span className="text-slate-600">{sig.explanation}</span>
                </li>
              ))}
            </ol>

            <div className="p-2 bg-white rounded border border-slate-200 text-[10px] space-y-1 font-mono">
              <div className="text-slate-500 font-semibold uppercase">
                Detailed Point Calculation
              </div>
              <div className="flex justify-between">
                <span>Interest Match:</span>
                <span>+{card.scoreBreakdown.interest.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Watch Time Prediction:</span>
                <span>+{card.scoreBreakdown.watchTime.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Historical Engagement:</span>
                <span>+{card.scoreBreakdown.interaction.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Recency & Freshness:</span>
                <span>+{card.scoreBreakdown.recency.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Catalog Diversity:</span>
                <span>+{card.scoreBreakdown.diversity.toFixed(1)}</span>
              </div>
              {card.scoreBreakdown.safetyPenalty > 0 && (
                <div className="flex justify-between text-amber-800 font-bold">
                  <span>Safety Deduction:</span>
                  <span>-{card.scoreBreakdown.safetyPenalty}</span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 italic">
              Note: This is a simplified linear educational formula. Real platforms use multi-stage deep neural rankers with thousands of non-linear signals.
            </p>
          </div>
        )}

        {/* Interactive Action Row (Stage 4) */}
        {interactive && onInteract && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Choose User Action (Signal Test)
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              <button
                type="button"
                onClick={() => onInteract(card.id, 'watch')}
                disabled={disabledInteractions}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-[10px] font-medium transition-colors disabled:opacity-50"
                title="Casual view (~30s). Mild signal of interest."
              >
                <Play className="w-3.5 h-3.5 mb-0.5 text-cyan-600" aria-hidden="true" />
                <span>Watch</span>
              </button>

              <button
                type="button"
                onClick={() => onInteract(card.id, 'watch_end')}
                disabled={disabledInteractions}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-[10px] font-medium transition-colors disabled:opacity-50"
                title="Watch to end. Strong retention signal."
              >
                <CheckCircle className="w-3.5 h-3.5 mb-0.5 text-emerald-600" aria-hidden="true" />
                <span>Full Watch</span>
              </button>

              <button
                type="button"
                onClick={() => onInteract(card.id, 'like')}
                disabled={disabledInteractions}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-[10px] font-medium transition-colors disabled:opacity-50"
                title="Like. Explicit positive interest signal."
              >
                <ThumbsUp className="w-3.5 h-3.5 mb-0.5 text-purple-600" aria-hidden="true" />
                <span>Like</span>
              </button>

              <button
                type="button"
                onClick={() => onInteract(card.id, 'share')}
                disabled={disabledInteractions}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-[10px] font-medium transition-colors disabled:opacity-50"
                title="Share. Viral multiplier signal."
              >
                <Share2 className="w-3.5 h-3.5 mb-0.5 text-amber-600" aria-hidden="true" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => onInteract(card.id, 'skip')}
                disabled={disabledInteractions}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-[10px] font-medium transition-colors disabled:opacity-50"
                title="Skip after 2s. Negative retention signal."
              >
                <FastForward className="w-3.5 h-3.5 mb-0.5 text-slate-500" aria-hidden="true" />
                <span>Skip</span>
              </button>

              <button
                type="button"
                onClick={() => onInteract(card.id, 'not_interested')}
                disabled={disabledInteractions}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-[10px] font-medium transition-colors disabled:opacity-50"
                title="Not interested. Strong explicit negative suppression signal."
              >
                <EyeOff className="w-3.5 h-3.5 mb-0.5 text-rose-600" aria-hidden="true" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
