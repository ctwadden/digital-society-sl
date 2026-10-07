/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ProfileId,
  PlatformGoalId,
  SafetyInterventionLevel,
  SignalWeights,
  SimulationState,
  Stage1Answers,
  Stage2Answers,
  Stage3Answers,
  Stage4MidPrediction,
  Stage5Answers,
  Stage6Answers,
  FinalClaimData,
  InteractionType,
  UserInteractionEvent,
  InvestigationRouteId,
} from './types';
import { PLATFORM_GOALS, INVESTIGATION_ROUTES } from './data/profiles';
import {
  scoreAndRankCards,
  getCardsForProfile,
  computeUpdatedAffinities,
} from './utils/recommender';
import { Header } from './components/Header';
import { Stage1MeetUser } from './components/Stage1MeetUser';
import { Stage2BecomeAlgorithm } from './components/Stage2BecomeAlgorithm';
import { Stage3RankContent } from './components/Stage3RankContent';
import { Stage4InteractFeed } from './components/Stage4InteractFeed';
import { Stage5ChangeGoal } from './components/Stage5ChangeGoal';
import { Stage6EvidenceCard } from './components/Stage6EvidenceCard';
import { Stage7FinalClaim } from './components/Stage7FinalClaim';
import { FinalReport } from './components/FinalReport';
import { TeacherGuideModal } from './components/TeacherGuideModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { HelpModal } from './components/HelpModal';

const STORAGE_KEY = 'who_shapes_your_feed_state_v2';

const INITIAL_STAGE_1_ANSWERS: Stage1Answers = {
  predictedTopics: [],
  selectedEvidence: [],
  optionalExplanation: '',
};

const INITIAL_STAGE_2_ANSWERS: Stage2Answers = {
  likelyToRise: '',
  likelyToLose: '',
  likelyBeneficiary: '',
  optionalExplanation: '',
};

const INITIAL_STAGE_3_ANSWERS: Stage3Answers = {
  surprisingCardId: '',
  surprisingReason: '',
  mostImportantSignalReason: '',
};

const INITIAL_STAGE_5_ANSWERS: Stage5Answers = {
  moreDiverseFeed: '',
  moreEngagingFeed: '',
  primaryBeneficiary: '',
  oneImportantChange: '',
};

const INITIAL_STAGE_6_ANSWERS: Stage6Answers = {
  changeAndOutcome: '',
  revelationAboutPlatform: '',
};

const INITIAL_FINAL_CLAIM: FinalClaimData = {
  stance: '',
  claim: '',
  selectedEvidence: '',
  reasoning: '',
  questionOrUncertainty: '',
};

const DEFAULT_STATE: SimulationState = {
  currentStage: 1,
  selectedProfileId: 'maya',
  stage1Answers: INITIAL_STAGE_1_ANSWERS,
  selectedGoalId: 'watch_time',
  weights: {
    interestMatch: 8,
    watchTime: 10,
    previousInteractions: 7,
    recency: 3,
    diversity: 1,
  },
  safetyLevel: 'low',
  stage2Answers: INITIAL_STAGE_2_ANSWERS,
  stage3Answers: INITIAL_STAGE_3_ANSWERS,
  topicAffinities: {},
  interactions: [],
  stage4Predictions: {},
  revisedGoalId: 'diversity',
  revisedWeights: {
    interestMatch: 5,
    watchTime: 4,
    previousInteractions: 3,
    recency: 6,
    diversity: 10,
  },
  revisedSafetyLevel: 'balanced',
  stage5Answers: INITIAL_STAGE_5_ANSWERS,
  stage6Answers: INITIAL_STAGE_6_ANSWERS,
  finalClaim: INITIAL_FINAL_CLAIM,
};

// Keep algorithm settings, but never carry one profile's evidence into another investigation.
const resetProfileProgress = (
  previous: SimulationState,
  profileId: ProfileId
): SimulationState => ({
  ...previous,
  currentStage: 1,
  selectedProfileId: profileId,
  assignedRouteId: null,
  stage1Answers: INITIAL_STAGE_1_ANSWERS,
  stage2Answers: INITIAL_STAGE_2_ANSWERS,
  stage3Answers: INITIAL_STAGE_3_ANSWERS,
  interactions: [],
  topicAffinities: {},
  stage4Predictions: {},
  stage5Answers: INITIAL_STAGE_5_ANSWERS,
  stage6Answers: INITIAL_STAGE_6_ANSWERS,
  finalClaim: INITIAL_FINAL_CLAIM,
});

export default function App() {
  // Initialize state from localStorage if available
  const [state, setState] = useState<SimulationState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          // Ensure nested objects merge properly
          stage1Answers: { ...DEFAULT_STATE.stage1Answers, ...parsed.stage1Answers },
          weights: { ...DEFAULT_STATE.weights, ...parsed.weights },
          stage2Answers: { ...DEFAULT_STATE.stage2Answers, ...parsed.stage2Answers },
          stage3Answers: { ...DEFAULT_STATE.stage3Answers, ...parsed.stage3Answers },
          revisedWeights: { ...DEFAULT_STATE.revisedWeights, ...parsed.revisedWeights },
          stage5Answers: { ...DEFAULT_STATE.stage5Answers, ...parsed.stage5Answers },
          stage6Answers: { ...DEFAULT_STATE.stage6Answers, ...parsed.stage6Answers },
          finalClaim: { ...DEFAULT_STATE.finalClaim, ...parsed.finalClaim },
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_STATE;
  });

  const [maxReachedStage, setMaxReachedStage] = useState<number>(() => {
    return Math.max(state.currentStage, 1);
  });

  const [isTeacherGuideOpen, setIsTeacherGuideOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
    if (state.currentStage > maxReachedStage) {
      setMaxReachedStage(state.currentStage);
    }
  }, [state, maxReachedStage]);

  // Stage 1 Handlers
  const handleSelectProfile = (id: ProfileId) => {
    if (id === state.selectedProfileId) return;
    setState((prev) => prev.selectedProfileId === id ? prev : resetProfileProgress(prev, id));
    setMaxReachedStage(1);
  };

  const handleSelectRoute = (routeId: InvestigationRouteId | null) => {
    if (routeId === null) {
      setState((prev) => ({ ...prev, assignedRouteId: null }));
      return;
    }
    const route = INVESTIGATION_ROUTES.find((item) => item.id === routeId);
    if (!route) return;
    const originalGoal = PLATFORM_GOALS[route.initialGoalId];
    const revisedGoal = PLATFORM_GOALS[route.revisedGoalId ?? DEFAULT_STATE.revisedGoalId];
    setState((prev) => ({
      ...resetProfileProgress(prev, route.profileId),
      assignedRouteId: route.id,
      selectedGoalId: originalGoal.id,
      weights: { ...originalGoal.defaultWeights },
      // Route D specifically asks students to test strong safety with discovery.
      safetyLevel: route.id === 'route_d' ? 'strong' : originalGoal.defaultSafety,
      revisedGoalId: revisedGoal.id,
      revisedWeights: { ...revisedGoal.defaultWeights },
      revisedSafetyLevel: revisedGoal.defaultSafety,
    }));
    setMaxReachedStage(1);
  };

  const handleChangeStage1Answers = (answers: Partial<Stage1Answers>) => {
    setState((prev) => ({
      ...prev,
      stage1Answers: { ...prev.stage1Answers, ...answers },
    }));
  };

  // Stage 2 Handlers
  const handleSelectGoal = (goalId: PlatformGoalId) => {
    setState((prev) => ({
      ...prev,
      selectedGoalId: goalId,
    }));
  };

  const handleChangeWeight = (key: keyof SignalWeights, value: number) => {
    setState((prev) => ({
      ...prev,
      weights: { ...prev.weights, [key]: value },
    }));
  };

  const handleChangeSafety = (level: SafetyInterventionLevel) => {
    setState((prev) => ({
      ...prev,
      safetyLevel: level,
    }));
  };

  const handleChangeStage2Answers = (answers: Partial<Stage2Answers>) => {
    setState((prev) => ({
      ...prev,
      stage2Answers: { ...prev.stage2Answers, ...answers },
    }));
  };

  // Stage 3 Handlers
  const handleChangeStage3Answers = (answers: Partial<Stage3Answers>) => {
    setState((prev) => ({
      ...prev,
      stage3Answers: { ...prev.stage3Answers, ...answers },
    }));
  };

  // Stage 4 Handlers
  const handleAddInteraction = (cardId: string, action: InteractionType) => {
    const rawCards = getCardsForProfile(state.selectedProfileId);
    const card = rawCards.find((c) => c.id === cardId);
    if (!card) return;

    const actionImpact =
      action === 'watch_end'
        ? 5
        : action === 'share'
        ? 6
        : action === 'like'
        ? 4
        : action === 'watch'
        ? 2
        : action === 'skip'
        ? -2
        : -6;

    const updatedAffinities = computeUpdatedAffinities(
      state.topicAffinities,
      card.topic,
      actionImpact
    );

    const newEvent: UserInteractionEvent = {
      cardId: card.id,
      cardTitle: card.title,
      topic: card.topic,
      action,
      stepNumber: state.interactions.length + 1,
      timestamp: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      topicAffinities: updatedAffinities,
      interactions: [...prev.interactions, newEvent],
    }));
  };

  const handleSaveMidPrediction = (
    step: 2 | 4,
    pred: Stage4MidPrediction
  ) => {
    setState((prev) => ({
      ...prev,
      stage4Predictions: {
        ...prev.stage4Predictions,
        [step === 2 ? 'step2' : 'step4']: pred,
      },
    }));
  };

  // Stage 5 Handlers
  const handleSelectRevisedGoal = (id: PlatformGoalId) => {
    setState((prev) => ({
      ...prev,
      revisedGoalId: id,
    }));
  };

  const handleChangeRevisedWeight = (
    key: keyof SignalWeights,
    value: number
  ) => {
    setState((prev) => ({
      ...prev,
      revisedWeights: { ...prev.revisedWeights, [key]: value },
    }));
  };

  const handleChangeRevisedSafety = (level: SafetyInterventionLevel) => {
    setState((prev) => ({
      ...prev,
      revisedSafetyLevel: level,
    }));
  };

  const handleChangeStage5Answers = (answers: Partial<Stage5Answers>) => {
    setState((prev) => ({
      ...prev,
      stage5Answers: { ...prev.stage5Answers, ...answers },
    }));
  };

  // Stage 6 Handlers
  const handleChangeStage6Answers = (answers: Partial<Stage6Answers>) => {
    setState((prev) => ({
      ...prev,
      stage6Answers: { ...prev.stage6Answers, ...answers },
    }));
  };

  // Stage 7 Handlers
  const handleChangeFinalClaim = (data: Partial<FinalClaimData>) => {
    setState((prev) => ({
      ...prev,
      finalClaim: { ...prev.finalClaim, ...data },
    }));
  };

  // Reset Handler
  const handleConfirmReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setState(DEFAULT_STATE);
    setMaxReachedStage(1);
    setIsResetConfirmOpen(false);
  };

  // Navigation
  const navigateToStage = (stageNum: number) => {
    setState((prev) => ({ ...prev, currentStage: stageNum }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate live feeds
  const profileCards = useMemo(() => {
    return getCardsForProfile(state.selectedProfileId);
  }, [state.selectedProfileId]);

  // Preserve Stage 3's pre-interaction baseline when students revisit their first observation.
  const initialScoredFeed = useMemo(() => {
    return scoreAndRankCards(profileCards, state.weights, state.safetyLevel);
  }, [profileCards, state.weights, state.safetyLevel]);

  // Feed with original weights & dynamic affinities
  const originalScoredFeed = useMemo(() => {
    return scoreAndRankCards(
      profileCards,
      state.weights,
      state.safetyLevel,
      state.topicAffinities
    );
  }, [profileCards, state.weights, state.safetyLevel, state.topicAffinities]);

  // Feed with revised goal weights & same dynamic affinities
  const revisedScoredFeed = useMemo(() => {
    return scoreAndRankCards(
      profileCards,
      state.revisedWeights,
      state.revisedSafetyLevel,
      state.topicAffinities
    );
  }, [
    profileCards,
    state.revisedWeights,
    state.revisedSafetyLevel,
    state.topicAffinities,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Contract */}
      <Header
        currentStage={state.currentStage}
        onNavigateStage={navigateToStage}
        maxReachedStage={maxReachedStage}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenTeacherGuide={() => setIsTeacherGuideOpen(true)}
        onOpenReset={() => setIsResetConfirmOpen(true)}
      />

      {/* Main Simulation Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {state.currentStage === 1 && (
          <Stage1MeetUser
            selectedProfileId={state.selectedProfileId}
            onSelectProfile={handleSelectProfile}
            assignedRouteId={state.assignedRouteId}
            onSelectRoute={handleSelectRoute}
            answers={state.stage1Answers}
            onChangeAnswers={handleChangeStage1Answers}
            onProceed={() => navigateToStage(2)}
          />
        )}

        {state.currentStage === 2 && (
          <Stage2BecomeAlgorithm
            selectedGoalId={state.selectedGoalId}
            onSelectGoal={handleSelectGoal}
            weights={state.weights}
            onChangeWeight={handleChangeWeight}
            safetyLevel={state.safetyLevel}
            onChangeSafety={handleChangeSafety}
            answers={state.stage2Answers}
            onChangeAnswers={handleChangeStage2Answers}
            onProceed={() => navigateToStage(3)}
            onBack={() => navigateToStage(1)}
          />
        )}

        {state.currentStage === 3 && (
          <Stage3RankContent
            scoredCards={initialScoredFeed}
            goalId={state.selectedGoalId}
            weights={state.weights}
            safetyLevel={state.safetyLevel}
            answers={state.stage3Answers}
            onChangeAnswers={handleChangeStage3Answers}
            onProceed={() => navigateToStage(4)}
            onBack={() => navigateToStage(2)}
          />
        )}

        {state.currentStage === 4 && (
          <Stage4InteractFeed
            scoredCards={originalScoredFeed}
            interactions={state.interactions}
            onAddInteraction={handleAddInteraction}
            midPredictions={state.stage4Predictions}
            onSaveMidPrediction={handleSaveMidPrediction}
            onProceed={() => navigateToStage(5)}
            onBack={() => navigateToStage(3)}
          />
        )}

        {state.currentStage === 5 && (
          <Stage5ChangeGoal
            originalFeed={originalScoredFeed}
            revisedFeed={revisedScoredFeed}
            originalGoalId={state.selectedGoalId}
            revisedGoalId={state.revisedGoalId}
            onSelectRevisedGoal={handleSelectRevisedGoal}
            revisedWeights={state.revisedWeights}
            onChangeRevisedWeight={handleChangeRevisedWeight}
            revisedSafety={state.revisedSafetyLevel}
            onChangeRevisedSafety={handleChangeRevisedSafety}
            answers={state.stage5Answers}
            onChangeAnswers={handleChangeStage5Answers}
            onProceed={() => navigateToStage(6)}
            onBack={() => navigateToStage(4)}
          />
        )}

        {state.currentStage === 6 && (
          <Stage6EvidenceCard
            state={state}
            originalFeed={originalScoredFeed}
            revisedFeed={revisedScoredFeed}
            answers={state.stage6Answers}
            onChangeAnswers={handleChangeStage6Answers}
            onProceed={() => navigateToStage(7)}
            onBack={() => navigateToStage(5)}
          />
        )}

        {state.currentStage === 7 && (
          <Stage7FinalClaim
            claimData={state.finalClaim}
            onChangeClaim={handleChangeFinalClaim}
            onProceed={() => navigateToStage(8)}
            onBack={() => navigateToStage(6)}
          />
        )}

        {state.currentStage === 8 && (
          <FinalReport
            state={state}
            originalFeed={originalScoredFeed}
            revisedFeed={revisedScoredFeed}
            onBackToClaim={() => navigateToStage(7)}
            onReset={() => setIsResetConfirmOpen(true)}
          />
        )}
      </main>

      {/* Quiet educational footer */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            WHO SHAPES YOUR FEED? · Grade 11 IB Digital Society Ignition Activity
          </span>
          <span className="font-mono text-[11px] text-cyan-400/80">
            Simplified Educational Model · Answers stay in this browser
          </span>
        </div>
        <p className="max-w-4xl mx-auto px-4 mt-2">Progress saves on this device when browser storage is available. Private browsing, clearing site data, resetting, or changing fictional profile can erase work. Copy or print your report to keep it. Nothing is sent to your teacher automatically; avoid personal details.</p>
      </footer>

      {/* Modals */}
      <TeacherGuideModal
        isOpen={isTeacherGuideOpen}
        onClose={() => setIsTeacherGuideOpen(false)}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        currentStage={state.currentStage}
      />
    </div>
  );
}
