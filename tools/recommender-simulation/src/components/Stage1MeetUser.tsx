import React, { useState } from 'react';
import {
  ProfileId,
  Stage1Answers,
  InvestigationRouteId,
} from '../types';
import {
  USER_PROFILES,
  INVESTIGATION_ROUTES,
  PREDICTION_TOPIC_CHIPS,
} from '../data/profiles';
import {
  User,
  Activity,
  Sparkles,
  ArrowRight,
  Check,
  Compass,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FeedbackLoopDiagram } from './FeedbackLoopDiagram';

interface Stage1MeetUserProps {
  selectedProfileId: ProfileId;
  onSelectProfile: (id: ProfileId) => void;
  assignedRouteId?: InvestigationRouteId | null;
  onSelectRoute?: (routeId: InvestigationRouteId | null) => void;
  answers: Stage1Answers;
  onChangeAnswers: (answers: Partial<Stage1Answers>) => void;
  onProceed: () => void;
}

export const Stage1MeetUser: React.FC<Stage1MeetUserProps> = ({
  selectedProfileId,
  onSelectProfile,
  assignedRouteId = null,
  onSelectRoute,
  answers,
  onChangeAnswers,
  onProceed,
}) => {
  const [showRoutes, setShowRoutes] = useState(false);
  const currentProfile = USER_PROFILES[selectedProfileId];

  const predictedTopics = answers.predictedTopics || [];
  const selectedEvidence = answers.selectedEvidence || [];

  const handleToggleTopic = (topic: string) => {
    if (predictedTopics.includes(topic)) {
      onChangeAnswers({
        predictedTopics: predictedTopics.filter((t) => t !== topic),
      });
    } else {
      if (predictedTopics.length >= 3) {
        // Replace oldest or cap at 3
        onChangeAnswers({
          predictedTopics: [...predictedTopics.slice(1), topic],
        });
      } else {
        onChangeAnswers({
          predictedTopics: [...predictedTopics, topic],
        });
      }
    }
  };

  const handleToggleEvidence = (behaviourText: string) => {
    if (selectedEvidence.includes(behaviourText)) {
      onChangeAnswers({
        selectedEvidence: selectedEvidence.filter((b) => b !== behaviourText),
      });
    } else {
      if (selectedEvidence.length >= 2) {
        onChangeAnswers({
          selectedEvidence: [...selectedEvidence.slice(1), behaviourText],
        });
      } else {
        onChangeAnswers({
          selectedEvidence: [...selectedEvidence, behaviourText],
        });
      }
    }
  };

  const handleSelectRouteCard = (routeId: InvestigationRouteId) => {
    const route = INVESTIGATION_ROUTES.find((r) => r.id === routeId);
    if (!route) return;
    if (onSelectRoute) {
      onSelectRoute(assignedRouteId === routeId ? null : routeId);
    }
    // Set profile if selecting route
    if (assignedRouteId !== routeId) {
      onSelectProfile(route.profileId);
    }
  };

  const isQ1Complete = predictedTopics.length > 0;
  const isQ2Complete = selectedEvidence.length > 0;
  const canProceed = isQ1Complete && isQ2Complete;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Stage Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          <span>Stage 1 of 7</span>
          <span aria-hidden="true">·</span>
          <span>Inquiry Foundation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Stage 1: Meet the User & Formulate Predictions
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Every personalized feed begins with user data: explicit stated interests, implicit consumption trails, and recent behavioral gestures. Select a fictional profile below, analyze their behavioral telemetry, and select your predictions.
        </p>
      </div>

      {/* Visual Feedback Loop showing we are at step 1: USER DATA */}
      <FeedbackLoopDiagram activeNode="user_data" />

      {/* Optional Panel: Teacher-Assigned Investigation Route */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Teacher-Assigned Investigation Route
              </h2>
              <span className="text-xs text-slate-400">
                Optional guided inquiry pathway assigned for your class station
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowRoutes(!showRoutes)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <span>{showRoutes ? 'Hide Routes' : 'View 4 Route Cards'}</span>
            {showRoutes ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {showRoutes && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-fadeIn">
            {INVESTIGATION_ROUTES.map((route) => {
              const isSelected = assignedRouteId === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => handleSelectRouteCard(route.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-purple-400 bg-purple-950/40 ring-1 ring-purple-400/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-purple-300">
                      {route.title}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-mono bg-purple-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                        Selected Route
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-white mb-1.5">
                    {route.subtitle}
                  </div>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                    {route.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                  <div className="mt-2 text-[10px] text-purple-300 italic">
                    Focus: {route.focusNote}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Selector Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
          Select a Fictional User Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(USER_PROFILES).map((profile) => {
            const isSelected = profile.id === selectedProfileId;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => onSelectProfile(profile.id)}
                className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-slate-900 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-950/40'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-white">
                      {profile.name}
                    </span>
                    {isSelected && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-400 text-slate-950">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-cyan-300 mb-3">
                    {profile.tagline}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {profile.bio}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300 block mb-1">
                    Interests:
                  </span>
                  <span>{profile.interests.join(' · ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Profile Detailed Dossier */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">
            User Dossier: {currentProfile.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Stated & Implicit Interests
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {currentProfile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-md font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                User Background & Intent
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                {currentProfile.bio}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Recent Behavioral Telemetry
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {currentProfile.recentBehaviour.map((act, idx) => (
                <li
                  key={idx}
                  className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-lg flex items-start gap-2.5"
                >
                  <span className="text-cyan-400 font-mono font-bold mt-0.5">
                    0{idx + 1}
                  </span>
                  <span className="leading-relaxed">{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Streamlined Prediction Module (Takes ~30 seconds) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              Formulate Your Predictions
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Quick selection chips · Estimated time: ~30 seconds
          </span>
        </div>

        {/* QUESTION 1: Selectable Prediction Chips */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
              Question 1: What content do you predict will appear near the top?
            </label>
            <span className="text-xs font-mono text-cyan-400">
              {predictedTopics.length} of 3 Selected
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Click to select 1 to 3 content categories you expect the recommender to prioritize for {currentProfile.name}:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {PREDICTION_TOPIC_CHIPS.map((chip) => {
              const isSelected = predictedTopics.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleToggleTopic(chip)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* QUESTION 2: Selectable Profile Evidence Cards */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 block">
              Question 2: Which profile evidence most influenced your prediction?
            </label>
            <span className="text-xs font-mono text-cyan-400">
              {selectedEvidence.length} of 2 Selected
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Select 1 or 2 behavioral telemetry items that best substantiate your hypothesis:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {currentProfile.recentBehaviour.map((behaviour, idx) => {
              const isSelected = selectedEvidence.includes(behaviour);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleEvidence(behaviour)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/40 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      EVIDENCE 0{idx + 1}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs leading-relaxed">{behaviour}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* OPTIONAL Field: Explain in one sentence */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <label
            htmlFor="optionalStage1Explanation"
            className="text-xs font-semibold text-slate-300 block"
          >
            Optional: Explain your prediction in one sentence.
          </label>
          <input
            id="optionalStage1Explanation"
            type="text"
            value={answers.optionalExplanation || ''}
            onChange={(e) =>
              onChangeAnswers({ optionalExplanation: e.target.value })
            }
            placeholder="e.g., The complete video watch time sends a much stronger retention signal than the skipped sponsored posts."
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
          />
        </div>

        {/* Navigation Row */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400">
            {canProceed
              ? 'Predictions captured! Ready to configure algorithm signal weights.'
              : 'Select at least 1 prediction chip and 1 piece of profile evidence to proceed.'}
          </span>

          <button
            type="button"
            onClick={onProceed}
            disabled={!canProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-cyan-500/20 cursor-pointer"
          >
            <span>Proceed to Stage 2: Become the Algorithm</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
