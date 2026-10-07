import React, { useState } from 'react';
import {
  SimulationState,
  ScoredContentCard,
} from '../types';
import { USER_PROFILES, PLATFORM_GOALS, INTERACTION_METAS } from '../data/profiles';
import { compareFeeds, scoreAndRankCards, getCardsForProfile } from '../utils/recommender';
import {
  Printer,
  Copy,
  Check,
  CheckCircle2,
  FileCheck2,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  Camera,
  Scale,
} from 'lucide-react';

interface FinalReportProps {
  state: SimulationState;
  originalFeed: ScoredContentCard[];
  revisedFeed: ScoredContentCard[];
  onBackToClaim: () => void;
  onReset: () => void;
}

export const FinalReport: React.FC<FinalReportProps> = ({
  state,
  originalFeed,
  revisedFeed,
  onBackToClaim,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFallback, setCopyFallback] = useState('');
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
  const strongestPos = positiveInteractions.sort(
    (a, b) =>
      (INTERACTION_METAS[b.action]?.affinityImpact || 0) -
      (INTERACTION_METAS[a.action]?.affinityImpact || 0)
  )[0];
  const strongestNeg = negativeInteractions.sort(
    (a, b) =>
      (INTERACTION_METAS[a.action]?.affinityImpact || 0) -
      (INTERACTION_METAS[b.action]?.affinityImpact || 0)
  )[0];

  const largestMovement = [...comparisons].sort(
    (a, b) => Math.abs(b.rankDelta) - Math.abs(a.rankDelta)
  )[0];

  const enteredTopSix = comparisons.filter((c) => c.status === 'new_in_top_6');
  const leftTopSix = comparisons.filter((c) => c.status === 'fell_from_top_6');

  const surprisingCard = scoreAndRankCards(getCardsForProfile(state.selectedProfileId), state.weights, state.safetyLevel).find(
    (c) => c.id === state.stage3Answers.surprisingCardId
  );

  const handleCopy = async () => {
    const textReport = `
===========================================================
WHO SHAPES YOUR FEED?
A Recommender-System Simulation Report
IB Digital Society · Grade 11 Inquiry Portfolio
===========================================================

1. USER PROFILE INVESTIGATED
-----------------------------------------------------------
[SIMULATION DATA]
User: ${profile.name} (${profile.tagline})
Stated Interests: ${profile.interests.join(', ')}

[STUDENT SELECTION]
Predicted Top Topics: ${(state.stage1Answers.predictedTopics || []).join(', ') || 'N/A'}
Profile Evidence Selected:
${(state.stage1Answers.selectedEvidence || []).map((e) => `  - ${e}`).join('\n') || '  (None selected)'}

[STUDENT WRITING]
Optional Explanation: ${state.stage1Answers.optionalExplanation || '(None provided)'}

2. ALGORITHM GOALS & WEIGHTS TESTED
-----------------------------------------------------------
[STUDENT SELECTION]
Original Goal: ${origGoal.title} (Safety: ${state.safetyLevel.toUpperCase()})
Original Weights:
  - Watch Time: ${state.weights.watchTime}/10
  - Interest Match: ${state.weights.interestMatch}/10
  - Previous Interactions: ${state.weights.previousInteractions}/10
  - Recency: ${state.weights.recency}/10
  - Diversity: ${state.weights.diversity}/10

Pre-Ranking Predictions:
  - Likely to Rise: ${state.stage2Answers.likelyToRise || 'N/A'}
  - Likely to Lose Visibility: ${state.stage2Answers.likelyToLose || 'N/A'}
  - Likely Beneficiary: ${state.stage2Answers.likelyBeneficiary || 'N/A'}

[STUDENT WRITING]
Optional Explanation: ${state.stage2Answers.optionalExplanation || '(None provided)'}

3. RANKED CONTENT ANALYSIS
-----------------------------------------------------------
[STUDENT SELECTION]
Surprising Card: ${surprisingCard ? `Rank #${surprisingCard.rank} "${surprisingCard.title}" (${surprisingCard.topic})` : 'N/A'}
Reason for Surprise: ${state.stage3Answers.surprisingReason || 'N/A'}

[STUDENT WRITING]
Signal Statement:
"${state.stage3Answers.mostImportantSignalReason || 'N/A'}"

4. BEHAVIORAL FEEDBACK LOOP (6 ACTIONS)
-----------------------------------------------------------
[STUDENT SELECTION]
${state.interactions
  .map(
    (ev, i) =>
      `Action ${i + 1}: ${ev.action.toUpperCase()} on "${ev.cardTitle}" (Topic: ${ev.topic})`
  )
  .join('\n')}

Checkpoint 1 (After 2 Actions):
  - Prediction: ${state.stage4Predictions.step2?.step2Prediction || 'N/A'}
  - Optional note: ${state.stage4Predictions.step2?.step2OptionalExplanation || '(None)'}

Checkpoint 2 (After 4 Actions):
  - Feed Breadth: ${state.stage4Predictions.step4?.breadthPrediction || 'N/A'}
  - Strongest Signal Action: Action #${(state.stage4Predictions.step4?.strongestActionIndex ?? 0) + 1}
  - Optional note: ${state.stage4Predictions.step4?.step4OptionalExplanation || '(None)'}

5. PLATFORM GOAL COMPARISON (ORIGINAL VS REVISED)
-----------------------------------------------------------
[STUDENT SELECTION]
Revised Goal: ${revGoal.title} (Safety: ${state.revisedSafetyLevel.toUpperCase()})
Revised Weights:
  - Watch Time: ${state.revisedWeights.watchTime}/10
  - Interest Match: ${state.revisedWeights.interestMatch}/10
  - Previous Interactions: ${state.revisedWeights.previousInteractions}/10
  - Recency: ${state.revisedWeights.recency}/10
  - Diversity: ${state.revisedWeights.diversity}/10

Comparative Judgments:
  - More Diverse Feed: ${state.stage5Answers.moreDiverseFeed ? state.stage5Answers.moreDiverseFeed.toUpperCase() : 'N/A'}
  - More Engaging Feed: ${state.stage5Answers.moreEngagingFeed ? state.stage5Answers.moreEngagingFeed.toUpperCase() : 'N/A'}
  - Primary Beneficiary: ${state.stage5Answers.primaryBeneficiary || 'N/A'}

[STUDENT WRITING]
Important Change Observation:
"${state.stage5Answers.oneImportantChange || 'N/A'}"

6. SIMULATION EVIDENCE SNAPSHOT
-----------------------------------------------------------
[SIMULATION DATA]
- Largest Rank Delta: ${largestMovement ? `"${largestMovement.card.title}" shifted ${largestMovement.rankDelta > 0 ? `+${largestMovement.rankDelta}` : largestMovement.rankDelta} spots` : 'None'}
- Entered Top 6: ${enteredTopSix.map((c) => c.card.title).join(', ') || 'None'}
- Displaced from Top 6: ${leftTopSix.map((c) => c.card.title).join(', ') || 'None'}
- Strongest Positive Signal: ${strongestPos ? `${strongestPos.action} on "${strongestPos.cardTitle}"` : 'None'}
- Strongest Negative Signal: ${strongestNeg ? `${strongestNeg.action} on "${strongestNeg.cardTitle}"` : 'None'}

[STUDENT WRITING]
1. What was changed and what happened:
"${state.stage6Answers.changeAndOutcome || 'N/A'}"

2. Revelation about platform goals, signals or feedback:
"${state.stage6Answers.revelationAboutPlatform || 'N/A'}"

7. FINAL CLAIM & EVALUATION
-----------------------------------------------------------
[STUDENT SELECTION]
Position on Statement: ${state.finalClaim.stance ? state.finalClaim.stance.toUpperCase().replace('_', ' ') : 'N/A'}

[SIMULATION DATA (CLAIM)]
${state.finalClaim.claim || 'N/A'}

[STUDENT SELECTION (EVIDENCE)]
Supporting Evidence: ${state.finalClaim.selectedEvidence || 'N/A'}

[STUDENT WRITING (REASONING)]
Reasoning:
"${state.finalClaim.reasoning || 'N/A'}"

[OPTIONAL UNCERTAINTY]
Question: ${state.finalClaim.questionOrUncertainty || '(None provided)'}
===========================================================
`;

    try {
      await navigator.clipboard.writeText(textReport.trim());
      setCopyFallback('');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopyFallback(textReport.trim());
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner & Print/Export Bar */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
            Stage 8 · Investigation Portfolio
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Final Investigation Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Differentiates student selections, student writing, and simulation-generated evidence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy Results</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {copyFallback && (
        <div className="no-print bg-slate-900 border border-cyan-700 rounded-xl p-4">
          <p role="status" className="text-sm mb-2">Clipboard access is unavailable. Select the report below and copy it manually.</p>
          <textarea aria-label="Report text for manual copy" readOnly value={copyFallback} onFocus={(event) => event.currentTarget.select()} className="w-full h-48 bg-slate-950 text-slate-100 p-3 rounded-lg" />
        </div>
      )}

      {/* Distinction Guide Legend */}
      <div className="no-print bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <span className="font-semibold text-slate-300">Data Origin Legend:</span>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> STUDENT SELECTION
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> STUDENT WRITING
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> SIMULATION DATA
          </span>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="bg-slate-900 print-card border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
            IB Digital Society · Grade 11 Inquiry Brief
          </div>
          <h2 className="text-2xl font-black text-white print-text-dark">
            WHO SHAPES YOUR FEED?
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            A Recommender-System Simulation Report on Algorithmic Power, Values & Identity
          </div>
        </div>

        {/* Section 1: User & Hypotheses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              1. User Profile & Initial Predictions
            </h3>
            <span className="text-[10px] font-mono text-slate-500">STAGE 1</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card space-y-2">
              <span className="text-[10px] font-mono uppercase text-purple-400 block font-bold">
                [SIMULATION DATA] Profile Dossier
              </span>
              <div className="font-semibold text-white print-text-dark">
                {profile.name} — {profile.tagline}
              </div>
              <div className="text-slate-400 print-text-dark">
                Interests: {profile.interests.join(' · ')}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card space-y-2">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                [STUDENT SELECTION] Predicted Content & Evidence
              </span>
              <div>
                <span className="text-slate-400">Predicted Topics:</span>{' '}
                <strong className="text-cyan-300 print-text-dark">
                  {(state.stage1Answers.predictedTopics || []).join(', ') || 'N/A'}
                </strong>
              </div>
              <div className="text-slate-300 print-text-dark">
                <span className="text-slate-400">Profile Evidence Selected:</span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                  {(state.stage1Answers.selectedEvidence || []).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
              {state.stage1Answers.optionalExplanation && (
                <div className="pt-1 text-slate-300 print-text-dark">
                  <span className="text-[10px] font-mono text-amber-400 block font-bold">
                    [STUDENT WRITING]
                  </span>
                  &ldquo;{state.stage1Answers.optionalExplanation}&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Platform Goals & Signal Sliders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              2. Platform Configurations & Pre-Ranking Hypotheses
            </h3>
            <span className="text-[10px] font-mono text-slate-500">STAGE 2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card space-y-2">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                [STUDENT SELECTION] Platform Weights Configured
              </span>
              <div className="font-semibold text-white print-text-dark">
                {origGoal.title}{' '}
                <span className="text-slate-500 font-normal">
                  (Safety: {state.safetyLevel.toUpperCase()})
                </span>
              </div>
              <div className="font-mono text-slate-300 print-text-dark text-[11px] space-y-0.5">
                <div>Watch Time: {state.weights.watchTime}/10</div>
                <div>Interest Match: {state.weights.interestMatch}/10</div>
                <div>Previous Interactions: {state.weights.previousInteractions}/10</div>
                <div>Recency: {state.weights.recency}/10</div>
                <div>Diversity: {state.weights.diversity}/10</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card space-y-2">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                [STUDENT SELECTION] Ranking Hypotheses
              </span>
              <div>
                <span className="text-slate-400">Likely to Rise:</span>{' '}
                <strong className="text-slate-200 print-text-dark">
                  {state.stage2Answers.likelyToRise || 'N/A'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Likely to Lose Visibility:</span>{' '}
                <strong className="text-slate-200 print-text-dark">
                  {state.stage2Answers.likelyToLose || 'N/A'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Likely Beneficiary:</span>{' '}
                <strong className="text-slate-200 print-text-dark">
                  {state.stage2Answers.likelyBeneficiary || 'N/A'}
                </strong>
              </div>
              {state.stage2Answers.optionalExplanation && (
                <div className="pt-1 text-slate-300 print-text-dark">
                  <span className="text-[10px] font-mono text-amber-400 block font-bold">
                    [STUDENT WRITING]
                  </span>
                  &ldquo;{state.stage2Answers.optionalExplanation}&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Ranked Content Observation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              3. Ranked Content Analysis
            </h3>
            <span className="text-[10px] font-mono text-slate-500">STAGE 3</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                  [STUDENT SELECTION] Surprising Result
                </span>
                <div className="text-slate-200 print-text-dark font-semibold">
                  {surprisingCard
                    ? `Rank #${surprisingCard.rank}: "${surprisingCard.title}" (${surprisingCard.topic})`
                    : 'N/A'}
                </div>
                <div className="text-slate-400 mt-1">
                  Reason: {state.stage3Answers.surprisingReason || 'N/A'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">
                  [STUDENT WRITING] Signal Analysis
                </span>
                <p className="text-slate-200 print-text-dark italic">
                  &ldquo;{state.stage3Answers.mostImportantSignalReason || 'N/A'}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Behavioral Feedback Loop */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              4. Feedback Loop Telemetry & Checkpoints
            </h3>
            <span className="text-[10px] font-mono text-slate-500">STAGE 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                [STUDENT SELECTION] {state.interactions.length} Logged Interactions
              </span>
              <ul className="space-y-1">
                {state.interactions.map((ev, i) => (
                  <li key={i} className="text-slate-300 print-text-dark">
                    <span className="font-mono text-cyan-400">#{i + 1}</span>{' '}
                    <strong>{ev.action.toUpperCase()}</strong>: &ldquo;{ev.cardTitle}&rdquo;
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card space-y-2">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                [STUDENT SELECTION] Checkpoint Decisions
              </span>
              <div>
                <span className="text-slate-400">Checkpoint 1 Prediction:</span>{' '}
                <strong className="text-slate-200 print-text-dark">
                  {state.stage4Predictions.step2?.step2Prediction || 'N/A'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Checkpoint 2 Breadth:</span>{' '}
                <strong className="text-slate-200 print-text-dark">
                  {state.stage4Predictions.step4?.breadthPrediction || 'N/A'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Strongest Action Cited:</span>{' '}
                <strong className="text-slate-200 print-text-dark">
                  Action #{state.stage4Predictions.step4?.strongestActionIndex !== undefined ? state.stage4Predictions.step4.strongestActionIndex + 1 : 'N/A'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Goal Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              5. Platform Goal Comparison
            </h3>
            <span className="text-[10px] font-mono text-slate-500">STAGE 5</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                  [STUDENT SELECTION] Diversity
                </span>
                <span className="text-slate-200 print-text-dark font-medium capitalize">
                  {state.stage5Answers.moreDiverseFeed ? state.stage5Answers.moreDiverseFeed.replace('_', ' ') : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                  [STUDENT SELECTION] Engagement
                </span>
                <span className="text-slate-200 print-text-dark font-medium capitalize">
                  {state.stage5Answers.moreEngagingFeed ? state.stage5Answers.moreEngagingFeed.replace('_', ' ') : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                  [STUDENT SELECTION] Beneficiary
                </span>
                <span className="text-slate-200 print-text-dark font-medium capitalize">
                  {state.stage5Answers.primaryBeneficiary || 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">
                [STUDENT WRITING] Important Change Observation
              </span>
              <p className="text-slate-200 print-text-dark italic mt-0.5">
                &ldquo;{state.stage5Answers.oneImportantChange || 'N/A'}&rdquo;
              </p>
            </div>
          </div>
        </div>

        <section className="print-card bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
          <h3 className="font-bold text-cyan-400 print-text-dark">Revised Configuration</h3>
          <p className="print-text-dark">Goal: {revGoal.title} · Safety: {state.revisedSafetyLevel}</p>
          <p className="print-text-dark">Watch Time: {state.revisedWeights.watchTime}/10 · Interest Match: {state.revisedWeights.interestMatch}/10 · Previous Interactions: {state.revisedWeights.previousInteractions}/10 · Recency: {state.revisedWeights.recency}/10 · Diversity: {state.revisedWeights.diversity}/10</p>
          <p className="print-text-dark">Strongest positive signal: {strongestPos ? strongestPos.action + ' — ' + strongestPos.cardTitle : 'None'} · Strongest negative signal: {strongestNeg ? strongestNeg.action + ' — ' + strongestNeg.cardTitle : 'None'}</p>
        </section>

        {/* Section 6: Simulation Evidence Snapshot */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              6. Simulation Evidence Snapshot & Synthesis
            </h3>
            <span className="text-[10px] font-mono text-slate-500">STAGE 6</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card space-y-2">
              <span className="text-[10px] font-mono uppercase text-purple-400 block font-bold">
                [SIMULATION DATA] Automated Evidence Snapshot
              </span>
              <div>
                <span className="text-slate-400">Largest Rank Delta:</span>{' '}
                <strong className="text-slate-200 print-text-dark">
                  {largestMovement ? `"${largestMovement.card.title}" shifted ${largestMovement.rankDelta > 0 ? `+${largestMovement.rankDelta}` : largestMovement.rankDelta} spots` : 'None'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Entered Top 6:</span>{' '}
                <span className="text-emerald-300">
                  {enteredTopSix.map((c) => c.card.title).join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Displaced from Top 6:</span>{' '}
                <span className="text-rose-300">
                  {leftTopSix.map((c) => c.card.title).join(', ') || 'None'}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 print-card space-y-2">
              <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">
                [STUDENT WRITING] Synthesis Responses
              </span>
              <div>
                <span className="text-slate-400 block text-[11px]">1. Change and Feed Outcome:</span>
                <p className="text-slate-200 print-text-dark italic">
                  &ldquo;{state.stage6Answers.changeAndOutcome || 'N/A'}&rdquo;
                </p>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 block text-[11px]">2. Revelation about Platforms & Signals:</span>
                <p className="text-slate-200 print-text-dark italic">
                  &ldquo;{state.stage6Answers.revelationAboutPlatform || 'N/A'}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: Final Evaluative Claim */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              7. Final Evaluative Claim
            </h3>
            <span className="text-[10px] font-mono text-slate-500">STAGE 7</span>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 print-card space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                [STUDENT SELECTION] Stance:
              </span>
              <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-bold uppercase font-mono">
                {state.finalClaim.stance ? state.finalClaim.stance.replace('_', ' ') : 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-purple-400 block font-bold">
                [SIMULATION DATA] Generated Claim
              </span>
              <p className="text-slate-200 print-text-dark font-medium">
                {state.finalClaim.claim || 'N/A'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                [STUDENT SELECTION] Supporting Evidence
              </span>
              <p className="text-slate-300 print-text-dark">
                &bull; {state.finalClaim.selectedEvidence || 'N/A'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">
                [STUDENT WRITING] Reasoning Statement
              </span>
              <p className="text-slate-200 print-text-dark italic">
                &ldquo;{state.finalClaim.reasoning || 'N/A'}&rdquo;
              </p>
            </div>

            {state.finalClaim.questionOrUncertainty && (
              <div className="pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  [STUDENT WRITING] Optional Question / Uncertainty
                </span>
                <p className="text-slate-300 print-text-dark">
                  {state.finalClaim.questionOrUncertainty}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WHO SHAPES YOUR FEED? · Grade 11 IB Digital Society Ignition Activity</span>
          <span>Educational Simulation Model · Local Storage Only</span>
        </div>
      </div>

      {/* Navigation & Reset Controls */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={onBackToClaim}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Final Claim</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Investigation</span>
        </button>
      </div>
    </div>
  );
};
