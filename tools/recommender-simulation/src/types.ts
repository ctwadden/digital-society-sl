/**
 * Types for Recommender-System Simulation
 * Designed for IB Digital Society Grade 11
 */

export type ProfileId = 'maya' | 'noah' | 'ava' | 'eli';

export interface UserProfile {
  id: ProfileId;
  name: string;
  tagline: string;
  interests: string[];
  recentBehaviour: string[];
  bio: string;
  badgeTheme: {
    bg: string;
    text: string;
    accent: string;
  };
}

export type CreatorType =
  | 'Independent Creator'
  | 'News Outlet'
  | 'Verified Educator'
  | 'Brand Sponsor'
  | 'Viral Trend Channel'
  | 'Public Health Org'
  | 'Grassroots Club';

export type SafetyRiskLevel = 'low' | 'moderate' | 'mild_concern';

export type ContentCategory =
  | 'highly_relevant'
  | 'unfamiliar_useful'
  | 'entertainment'
  | 'news_public'
  | 'sponsored'
  | 'reliable_health_edu'
  | 'sensational'
  | 'mild_safety_concern';

export interface ContentCardItem {
  id: string;
  profileAffinity: ProfileId;
  title: string;
  topic: string;
  creatorType: CreatorType;
  creatorName: string;
  publicationAge: string;
  ageInHours: number;
  predictedWatchTimeScore: number; // 0-10
  interestMatchScore: number; // 0-10
  previousInteractionScore: number; // 0-10
  diversityContribution: number; // 0-10
  safetyRiskLevel: SafetyRiskLevel;
  categoryType: ContentCategory;
  description: string;
}

export type SafetyInterventionLevel = 'low' | 'balanced' | 'strong';

export interface SignalWeights {
  interestMatch: number; // 0-10
  watchTime: number; // 0-10
  previousInteractions: number; // 0-10
  recency: number; // 0-10
  diversity: number; // 0-10
}

export type PlatformGoalId =
  | 'watch_time'
  | 'immediate_engagement'
  | 'diversity'
  | 'balanced';

export interface PlatformGoalConfig {
  id: PlatformGoalId;
  title: string;
  tagline: string;
  description: string;
  defaultWeights: SignalWeights;
  defaultSafety: SafetyInterventionLevel;
  beneficiaryHint: string;
}

export type InteractionType =
  | 'watch'
  | 'watch_end'
  | 'like'
  | 'share'
  | 'skip'
  | 'not_interested';

export interface InteractionActionMeta {
  type: InteractionType;
  label: string;
  shortLabel: string;
  description: string;
  affinityImpact: number;
  iconName: string;
}

export interface UserInteractionEvent {
  cardId: string;
  cardTitle: string;
  topic: string;
  action: InteractionType;
  stepNumber: number;
  timestamp: number;
}

export interface InfluentialSignal {
  name: string;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface ScoredContentCard extends ContentCardItem {
  score: number;
  rank: number;
  topSignals: InfluentialSignal[];
  scoreBreakdown: {
    interest: number;
    watchTime: number;
    interaction: number;
    recency: number;
    diversity: number;
    safetyPenalty: number;
  };
}

export type InvestigationRouteId = 'route_a' | 'route_b' | 'route_c' | 'route_d';

export interface InvestigationRoute {
  id: InvestigationRouteId;
  title: string;
  subtitle: string;
  profileId: ProfileId;
  initialGoalId: PlatformGoalId;
  revisedGoalId?: PlatformGoalId;
  steps: string[];
  focusNote: string;
}

export interface Stage1Answers {
  predictedTopics: string[]; // up to 3 chips
  selectedEvidence: string[]; // 1 or 2 behaviours
  optionalExplanation?: string;
  // Legacy backward-compatibility
  predictedContent?: string;
  evidenceFromProfile?: string;
}

export interface Stage2Answers {
  likelyToRise: string;
  likelyToLose: string;
  likelyBeneficiary: string;
  optionalExplanation?: string;
  // Legacy backward-compatibility
  firstAppearingPrediction?: string;
  littleVisibilityPrediction?: string;
  whoBenefitsPrediction?: string;
}

export interface Stage3Answers {
  surprisingCardId: string;
  surprisingReason: string;
  mostImportantSignalReason: string;
  // Legacy backward-compatibility
  surprisingObservation?: string;
  highVisibilityItem?: string;
  lowDiscoveryItem?: string;
}

export interface Stage4MidPrediction {
  step: 2 | 4;
  // Step 2 prediction
  step2Prediction?: string;
  step2OptionalExplanation?: string;
  // Step 4 prediction
  breadthPrediction?: string;
  strongestActionIndex?: number;
  step4OptionalExplanation?: string;
  // Legacy backward-compatibility
  showMorePrediction?: string;
  showLessPrediction?: string;
}

export interface Stage5Answers {
  moreDiverseFeed: 'feed_a' | 'feed_b' | 'about_the_same' | '';
  moreEngagingFeed: 'feed_a' | 'feed_b' | 'about_the_same' | '';
  primaryBeneficiary: string;
  oneImportantChange: string;
  // Legacy backward-compatibility
  whatChanged?: string;
  whyChanged?: string;
  userVsPlatformPriorities?: string;
  varietyComparison?: string;
  engagementComparison?: string;
  whoBenefitsEach?: string;
}

export interface Stage6Answers {
  changeAndOutcome: string;
  revelationAboutPlatform: string;
}

// Visual snapshot data calculated automatically from simulation state
export interface SimulationEvidenceSnapshot {
  userProfileName: string;
  originalGoalTitle: string;
  revisedGoalTitle: string;
  originalWeights: SignalWeights;
  revisedWeights: SignalWeights;
  originalSafety: SafetyInterventionLevel;
  revisedSafety: SafetyInterventionLevel;
  interactionCount: number;
  strongestPositiveInteraction: string;
  strongestNegativeInteraction: string;
  largestMovement: {
    cardTitle: string;
    fromRank: number;
    toRank: number;
    delta: number;
  } | null;
  enteredTopSix: string[];
  leftTopSix: string[];
  feedbackLoopPattern: string;
}

export type StanceType =
  | 'agree'
  | 'mostly_agree'
  | 'unsure'
  | 'mostly_disagree'
  | 'disagree';

export interface FinalClaimData {
  stance: StanceType | '';
  claim: string; // Auto-populated from stance
  selectedEvidence: string; // One of 6 selectable pieces of evidence
  reasoning: string; // One short response: "This evidence shows that ______ has more control because ______."
  questionOrUncertainty?: string; // Optional field
  // Legacy backward-compatibility
  evidence?: string;
  stakeholderConsequence?: string;
}

export interface SimulationState {
  currentStage: number; // 1 to 7 or 8 for final report
  selectedProfileId: ProfileId;
  assignedRouteId?: InvestigationRouteId | null;
  stage1Answers: Stage1Answers;
  selectedGoalId: PlatformGoalId;
  weights: SignalWeights;
  safetyLevel: SafetyInterventionLevel;
  stage2Answers: Stage2Answers;
  stage3Answers: Stage3Answers;
  // Dynamic profile updates from interactions:
  topicAffinities: Record<string, number>;
  interactions: UserInteractionEvent[];
  stage4Predictions: {
    step2?: Stage4MidPrediction;
    step4?: Stage4MidPrediction;
  };
  // Goal change comparison (Stage 5):
  revisedGoalId: PlatformGoalId;
  revisedWeights: SignalWeights;
  revisedSafetyLevel: SafetyInterventionLevel;
  stage5Answers: Stage5Answers;
  // Stage 6 Snapshot & two student responses:
  stage6Answers: Stage6Answers;
  // Final Claim (Stage 7):
  finalClaim: FinalClaimData;
}
