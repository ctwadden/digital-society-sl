import React from 'react';
import { X, BookOpen, AlertTriangle, Target, Lightbulb, MessageSquare } from 'lucide-react';

interface TeacherGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                Educator Curriculum Support
              </span>
              <h2
                id="teacher-guide-title"
                className="text-xl font-black text-white"
              >
                Teacher Guide: IB Digital Society Ignition Activity
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close Teacher Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pedagogical Purpose */}
        <div className="p-4 bg-purple-950/30 border border-purple-800/60 rounded-xl text-xs text-purple-200 leading-relaxed space-y-2">
          <div>
            <strong>Pedagogical Context & Target Time (25–35 Minutes):</strong> This simulation is engineered as an <em>ignition activity</em> to initiate the Grade 11 IB Digital Society unit exploring <strong>Algorithms, Data, Power, Identity, Values, and Ethics</strong>.
          </div>
          <div className="text-slate-300">
            &bull; <strong>Selection-Driven Inquiry:</strong> Most responses are streamlined selections, chips, and single-sentence reflections rather than long paragraphs. Students spend the majority of their time manipulating signal sliders, predicting outcomes, and observing feedback loops.
          </div>
          <div className="text-slate-300">
            &bull; <strong>Simulation as Mechanism Evidence:</strong> The simulation itself produces empirical mechanism evidence. Students can complete a separate article evidence brief afterward.
          </div>
          <div className="text-slate-300">
            &bull; <strong>Regroup Discussion:</strong> Nuanced ethical judgments and stakeholder power trade-offs are designed to be explored and developed during the post-activity teacher-led regroup plenary.
          </div>
        </div>

        {/* Learning Targets */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Target className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Learning Targets (Syllabus Aligned)
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold">&bull;</span>
              <span><strong>Identify Systems Elements:</strong> Deconstruct inputs, signals, mathematical rules, ranked outputs, and iterative feedback loops.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold">&bull;</span>
              <span><strong>Examine Algorithmic Objectives:</strong> Explain how altering a platform&apos;s goal fundamentally reshapes the distribution of content without changing the user.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold">&bull;</span>
              <span><strong>Map Stakeholder Impacts:</strong> Differentiate consequences across users, content creators, commercial advertisers, and public civil society.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold">&bull;</span>
              <span><strong>Distinguish Evidence from Assumption:</strong> Base claims on empirical simulation observations rather than popular tech folklore.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold">&bull;</span>
              <span><strong>Critique Technological Neutrality:</strong> Recognize that recommender systems are intentional, value-laden socio-technical systems rather than passive or neutral conduits.</span>
            </li>
          </ul>
        </div>

        {/* Common Misconceptions Debunked */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Common Student Misconceptions to Address
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {[
              {
                myth: 'The algorithm "knows" exactly what someone wants.',
                reality: 'It only measures proxy behaviors (retention seconds, clicks, re-shares). It cannot perceive user fulfillment or regret.',
              },
              {
                myth: 'Every algorithm uses artificial intelligence.',
                reality: 'Many ranking systems combine heuristic scoring, linear weights, and rules with machine-learning sub-models.',
              },
              {
                myth: 'Users completely control their feeds.',
                reality: 'Users only select actions within an interface pre-curated and weighted by platform architects.',
              },
              {
                myth: 'Platforms completely control every single result.',
                reality: 'Complex emergent feedback loops can surprise engineers, creating unintended distribution cascades.',
              },
              {
                myth: 'Engagement automatically means user satisfaction.',
                reality: 'High watch time frequently stems from outrage, anxiety, or compulsive scrolling rather than endorsement.',
              },
              {
                myth: 'A filter bubble is an unavoidable fate for all.',
                reality: 'Deliberate diversity weights, exploratory discovery buffers, and user awareness can disrupt narrow silos.',
              },
              {
                myth: 'This simulation accurately clones TikTok or YouTube.',
                reality: 'This is a transparent classroom conceptual model designed for pedagogical clarity, not proprietary replication.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1"
              >
                <div className="font-semibold text-amber-300">
                  Myth: &ldquo;{item.myth}&rdquo;
                </div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  {item.reality}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classroom Discussion Starters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <MessageSquare className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Plenary Discussion Starters
            </h3>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <li>When you skipped a card after 2 seconds, did the algorithm interpret that as &ldquo;boring&rdquo; or &ldquo;harmful&rdquo;? Why does that nuance matter?</li>
            <li>In Stage 5, who benefited most when the goal switched to &ldquo;Increase Diversity&rdquo;? Who lost out financially?</li>
            <li>If a platform knows that sensational health fads generate 3× the watch time of peer-reviewed medicine, what ethical duty do their engineers have?</li>
            <li>Why did we refer to this as an &ldquo;architecture of choices&rdquo; rather than an &ldquo;impartial mirror&rdquo;?</li>
          </ol>
        </div>

        {/* Classroom Model Warning */}
        <div className="flex items-start gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Methodological Warning:</strong> Remind students that commercial recommender systems are far more opaque and non-linear. This simulation uses explicit additive weights (0–10) so students can isolate individual causal relationships without black-box confusion.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
