import {
  ContentCardItem,
  InfluentialSignal,
  ProfileId,
  SafetyInterventionLevel,
  ScoredContentCard,
  SignalWeights,
  UserInteractionEvent,
} from '../types';
import { CONTENT_CARDS_CATALOG } from '../data/profiles';

/**
 * Calculates a 0-10 recency score based on age in hours.
 */
export function calculateRecencyScore(ageInHours: number): number {
  if (ageInHours <= 1) return 10.0;
  if (ageInHours <= 3) return 9.2;
  if (ageInHours <= 6) return 8.0;
  if (ageInHours <= 12) return 6.8;
  if (ageInHours <= 24) return 5.2;
  if (ageInHours <= 48) return 3.5;
  return 2.0;
}

/**
 * Calculates the safety penalty based on intervention level and card risk.
 */
export function calculateSafetyPenalty(
  riskLevel: 'low' | 'moderate' | 'mild_concern',
  safetyLevel: SafetyInterventionLevel
): number {
  if (riskLevel === 'low') return 0;

  if (safetyLevel === 'low') {
    // Low platform intervention: minimal damping
    return riskLevel === 'mild_concern' ? 4 : 2;
  }

  if (safetyLevel === 'balanced') {
    // Balanced moderation: noticeable discount
    return riskLevel === 'mild_concern' ? 18 : 8;
  }

  // Strong intervention: major suppression of questionable material
  return riskLevel === 'mild_concern' ? 38 : 18;
}

/**
 * Calculates scores and ranks a set of cards using the Simplified Classroom Model.
 */
export function scoreAndRankCards(
  cards: ContentCardItem[],
  weights: SignalWeights,
  safetyLevel: SafetyInterventionLevel,
  topicAffinities: Record<string, number> = {}
): ScoredContentCard[] {
  const scored = cards.map((card) => {
    // Dynamic topic adjustment based on simulated user actions
    const topicBoost = topicAffinities[card.topic] || 0;
    const adjustedInterest = Math.max(
      0.5,
      Math.min(10, card.interestMatchScore + topicBoost)
    );

    const recencyScore = calculateRecencyScore(card.ageInHours);

    // Component calculations (each 0-10 score multiplied by student weight 0-10)
    const interestComponent = adjustedInterest * weights.interestMatch;
    const watchTimeComponent = card.predictedWatchTimeScore * weights.watchTime;
    const interactionComponent =
      card.previousInteractionScore * weights.previousInteractions;
    const recencyComponent = recencyScore * weights.recency;
    const diversityComponent = card.diversityContribution * weights.diversity;

    const safetyPenalty = calculateSafetyPenalty(
      card.safetyRiskLevel,
      safetyLevel
    );

    // Raw total score
    const rawScore =
      interestComponent +
      watchTimeComponent +
      interactionComponent +
      recencyComponent +
      diversityComponent -
      safetyPenalty;

    const finalScore = Math.max(0, Math.round(rawScore * 10) / 10);

    // Identify top 3 influential signals
    const signalsList: { name: string; weight: number; contribution: number; explanation: string }[] = [
      {
        name: 'Interest Match',
        weight: weights.interestMatch,
        contribution: interestComponent,
        explanation: `User interest match (${adjustedInterest.toFixed(1)}/10) × Weight (${weights.interestMatch}) = +${interestComponent.toFixed(1)} pts`,
      },
      {
        name: 'Watch Time Prediction',
        weight: weights.watchTime,
        contribution: watchTimeComponent,
        explanation: `Predicted watch time (${card.predictedWatchTimeScore.toFixed(1)}/10) × Weight (${weights.watchTime}) = +${watchTimeComponent.toFixed(1)} pts`,
      },
      {
        name: 'Previous Interactions',
        weight: weights.previousInteractions,
        contribution: interactionComponent,
        explanation: `Historical engagement (${card.previousInteractionScore.toFixed(1)}/10) × Weight (${weights.previousInteractions}) = +${interactionComponent.toFixed(1)} pts`,
      },
      {
        name: 'Recency & Freshness',
        weight: weights.recency,
        contribution: recencyComponent,
        explanation: `Publication age (${card.publicationAge}, score ${recencyScore.toFixed(1)}/10) × Weight (${weights.recency}) = +${recencyComponent.toFixed(1)} pts`,
      },
      {
        name: 'Content Diversity',
        weight: weights.diversity,
        contribution: diversityComponent,
        explanation: `Catalog diversity factor (${card.diversityContribution.toFixed(1)}/10) × Weight (${weights.diversity}) = +${diversityComponent.toFixed(1)} pts`,
      },
    ];

    // If safety penalty was applied, consider it as a significant influence
    if (safetyPenalty > 0) {
      signalsList.push({
        name: 'Safety Moderation Penalty',
        weight: safetyLevel === 'strong' ? 10 : safetyLevel === 'balanced' ? 5 : 2,
        contribution: -safetyPenalty,
        explanation: `Content flagged with ${card.safetyRiskLevel.replace('_', ' ')} under ${safetyLevel} safety rule = -${safetyPenalty} pts deduction`,
      });
    }

    // Sort by absolute impact to identify the 3 most influential signals
    const topSignals: InfluentialSignal[] = [...signalsList]
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 3);

    return {
      ...card,
      score: finalScore,
      rank: 0, // Assigned after sorting
      topSignals,
      scoreBreakdown: {
        interest: Math.round(interestComponent * 10) / 10,
        watchTime: Math.round(watchTimeComponent * 10) / 10,
        interaction: Math.round(interactionComponent * 10) / 10,
        recency: Math.round(recencyComponent * 10) / 10,
        diversity: Math.round(diversityComponent * 10) / 10,
        safetyPenalty,
      },
    };
  });

  // Sort descending by final score
  scored.sort((a, b) => b.score - a.score);

  // Assign 1-indexed ranks
  return scored.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

/**
 * Retrieves the 12 content cards matching the selected profile.
 */
export function getCardsForProfile(profileId: ProfileId): ContentCardItem[] {
  return CONTENT_CARDS_CATALOG.filter((c) => c.profileAffinity === profileId);
}

/**
 * Updates topic affinity records based on a user action.
 */
export function computeUpdatedAffinities(
  currentAffinities: Record<string, number>,
  topic: string,
  impact: number
): Record<string, number> {
  const current = currentAffinities[topic] || 0;
  // Clamp between -6 and +6 total shift
  const updated = Math.max(-6, Math.min(6, current + impact * 0.4));
  return {
    ...currentAffinities,
    [topic]: Math.round(updated * 10) / 10,
  };
}

export interface FeedComparisonResult {
  cardId: string;
  card: ContentCardItem;
  originalRank: number;
  revisedRank: number;
  rankDelta: number; // positive = climbed higher (rank number decreased)
  status: 'climbed' | 'dropped' | 'new_in_top_6' | 'fell_from_top_6' | 'unchanged';
  originalScore: number;
  revisedScore: number;
}

/**
 * Compares two ranked feeds and computes deltas.
 */
export function compareFeeds(
  originalFeed: ScoredContentCard[],
  revisedFeed: ScoredContentCard[]
): FeedComparisonResult[] {
  const origMap = new Map<string, ScoredContentCard>();
  originalFeed.forEach((c) => origMap.set(c.id, c));

  return revisedFeed.map((revCard) => {
    const origCard = origMap.get(revCard.id);
    const origRank = origCard ? origCard.rank : 99;
    const revRank = revCard.rank;
    const rankDelta = origRank - revRank; // e.g. from 5 to 2 = +3 (climbed)

    let status: FeedComparisonResult['status'] = 'unchanged';
    if (origRank > 6 && revRank <= 6) {
      status = 'new_in_top_6';
    } else if (origRank <= 6 && revRank > 6) {
      status = 'fell_from_top_6';
    } else if (rankDelta > 0) {
      status = 'climbed';
    } else if (rankDelta < 0) {
      status = 'dropped';
    }

    return {
      cardId: revCard.id,
      card: revCard,
      originalRank: origRank,
      revisedRank: revRank,
      rankDelta,
      status,
      originalScore: origCard ? origCard.score : 0,
      revisedScore: revCard.score,
    };
  });
}
