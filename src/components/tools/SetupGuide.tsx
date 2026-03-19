'use client';

import { useState, useMemo } from 'react';
import {
  PROBLEMS,
  PHASES,
  PARAMETERS,
  RAKE_GUIDE,
  getRecommendations,
  getParameterById,
  type ProblemId,
  type PhaseId,
  type Impact,
} from '@/lib/setupGuide';
import styles from './SetupGuide.module.css';

// ── Helpers ────────────────────────────────────────────────────────

function directionArrow(dir: string, end: string): string {
  if (dir === 'adjust') return '⟳';
  if (dir === 'increase') return '▲';
  return '▼';
}

function directionLabel(dir: string, end: string): string {
  if (dir === 'adjust') return `Adjust ${end}`;
  const verb = dir === 'increase' ? 'Increase' : 'Decrease';
  return `${verb} ${end}`;
}

function impactLabel(impact: Impact): string {
  switch (impact) {
    case 'high':
      return 'High Impact';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
  }
}

// ── Component ──────────────────────────────────────────────────────

export default function SetupGuide() {
  const [selectedProblem, setSelectedProblem] = useState<ProblemId | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<PhaseId>('entry');
  const [expandedParams, setExpandedParams] = useState<Set<string>>(new Set());
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set());
  const [showRakeGuide, setShowRakeGuide] = useState(false);

  const recommendations = useMemo(() => {
    if (!selectedProblem) return [];
    return getRecommendations(selectedProblem, selectedPhase);
  }, [selectedProblem, selectedPhase]);

  const selectedProblemData = useMemo(
    () => PROBLEMS.find((p) => p.id === selectedProblem),
    [selectedProblem],
  );

  function toggleParam(id: string) {
    setExpandedParams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleTip(idx: number) {
    setExpandedTips((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }

  // Group parameters by category for the reference section
  const paramsByCategory = useMemo(() => {
    const map = new Map<string, typeof PARAMETERS>();
    for (const p of PARAMETERS) {
      const existing = map.get(p.category) || [];
      existing.push(p);
      map.set(p.category, existing);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className={styles.layout}>
      {/* ── Left: Selection Panel ── */}
      <div className={styles.selectionPanel}>
        {/* Problem Selector */}
        <section className={`glass-card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🔍</span>
            What&apos;s the Problem?
          </h3>
          <p className={styles.sectionHint}>
            Select the handling issue you&apos;re experiencing.
          </p>

          <div className={styles.problemGrid}>
            {PROBLEMS.map((problem) => (
              <button
                key={problem.id}
                className={`${styles.problemCard} ${
                  selectedProblem === problem.id ? styles.problemCardActive : ''
                }`}
                onClick={() => setSelectedProblem(problem.id)}
                style={
                  {
                    '--problem-color': problem.color,
                  } as React.CSSProperties
                }
              >
                <span className={styles.problemIcon}>{problem.icon}</span>
                <span className={styles.problemLabel}>{problem.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Phase Selector */}
        {selectedProblem && (
          <section className={`glass-card ${styles.section} ${styles.phaseSection}`}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🏁</span>
              When Does It Happen?
            </h3>
            <p className={styles.sectionHint}>
              Select the phase of the corner where you notice the issue most.
            </p>

            <div className={styles.phaseRow}>
              {PHASES.map((phase) => (
                <button
                  key={phase.id}
                  className={`${styles.phaseBtn} ${
                    selectedPhase === phase.id ? styles.phaseBtnActive : ''
                  }`}
                  onClick={() => setSelectedPhase(phase.id)}
                >
                  <span className={styles.phaseLabel}>{phase.label}</span>
                  <span className={styles.phaseDesc}>{phase.description}</span>
                </button>
              ))}
            </div>

            {/* Corner Diagram */}
            <div className={styles.cornerDiagram}>
              <svg
                viewBox="0 0 340 140"
                className={styles.cornerSvg}
                aria-label="Corner phase diagram"
              >
                {/* Track surface */}
                <path
                  d="M 20 120 Q 100 120 170 60 Q 240 0 320 20"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="40"
                  strokeLinecap="round"
                />

                {/* Racing line */}
                <path
                  d="M 20 120 Q 100 120 170 60 Q 240 0 320 20"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />

                {/* Entry zone highlight */}
                <path
                  d="M 20 120 Q 60 120 100 100"
                  fill="none"
                  stroke={selectedPhase === 'entry' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.3s ease' }}
                />

                {/* Mid zone highlight */}
                <path
                  d="M 100 100 Q 140 80 180 55"
                  fill="none"
                  stroke={selectedPhase === 'mid' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.3s ease' }}
                />

                {/* Exit zone highlight */}
                <path
                  d="M 180 55 Q 250 10 320 20"
                  fill="none"
                  stroke={selectedPhase === 'exit' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.3s ease' }}
                />

                {/* Labels */}
                <text x="50" y="105" className={styles.cornerLabel}
                  fill={selectedPhase === 'entry' ? 'var(--accent-primary)' : 'var(--text-muted)'}
                >
                  Entry
                </text>
                <text x="140" y="48" className={styles.cornerLabel}
                  fill={selectedPhase === 'mid' ? 'var(--accent-primary)' : 'var(--text-muted)'}
                >
                  Mid
                </text>
                <text x="265" y="15" className={styles.cornerLabel}
                  fill={selectedPhase === 'exit' ? 'var(--accent-primary)' : 'var(--text-muted)'}
                >
                  Exit
                </text>

                {/* Car dot */}
                <circle
                  cx={selectedPhase === 'entry' ? 60 : selectedPhase === 'mid' ? 155 : 280}
                  cy={selectedPhase === 'entry' ? 118 : selectedPhase === 'mid' ? 60 : 18}
                  r="6"
                  fill="var(--accent-primary)"
                  style={{ transition: 'cx 0.4s ease, cy 0.4s ease' }}
                >
                  <animate
                    attributeName="r"
                    values="5;8;5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
          </section>
        )}

        {/* Parameter Reference */}
        <section className={`glass-card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📖</span>
            Setup Parameter Reference
          </h3>
          <p className={styles.sectionHint}>
            Click any parameter to learn what it does.
          </p>

          <div className={styles.refList}>
            {paramsByCategory.map(([category, params]) => (
              <div key={category} className={styles.refCategory}>
                <div className={styles.refCategoryHeader}>{category}</div>
                {params.map((param) => (
                  <div key={param.id} className={styles.refItem}>
                    <button
                      className={`${styles.refToggle} ${
                        expandedParams.has(param.id) ? styles.refToggleOpen : ''
                      }`}
                      onClick={() => toggleParam(param.id)}
                    >
                      <span className={styles.refName}>{param.name}</span>
                      <span className={styles.refArrow}>
                        {expandedParams.has(param.id) ? '−' : '+'}
                      </span>
                    </button>
                    {expandedParams.has(param.id) && (
                      <div className={styles.refBody}>
                        <p className={styles.refDesc}>{param.description}</p>
                        <p className={styles.refWhatItDoes}>{param.whatItDoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Rake & Ride Height Guide */}
        <section className={`glass-card ${styles.section}`}>
          <button
            className={styles.rakeToggle}
            onClick={() => setShowRakeGuide((v) => !v)}
          >
            <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              <span className={styles.sectionIcon}>📐</span>
              Ride Height &amp; Rake Guide
            </h3>
            <span
              className={`${styles.rakeToggleArrow} ${showRakeGuide ? styles.rakeToggleArrowOpen : ''}`}
            >
              ▼
            </span>
          </button>

          {showRakeGuide && (
            <div className={styles.rakeContent}>
              <p className={styles.rakeOverview}>{RAKE_GUIDE.overview}</p>

              {/* What is Rake */}
              <div className={styles.rakeFormula}>
                <span className={styles.rakeFormulaLabel}>Formula</span>
                <span className={styles.rakeFormulaText}>
                  {RAKE_GUIDE.whatIsRake}
                </span>
              </div>

              {/* Why Rake Matters */}
              <div className={styles.rakeWhySection}>
                <h4 className={styles.rakeSubTitle}>Why Rake Matters</h4>
                <ul className={styles.rakeWhyList}>
                  {RAKE_GUIDE.whyRakeMatters.map((reason, i) => (
                    <li key={i} className={styles.rakeWhyItem}>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Car Class Reference */}
              <div className={styles.rakeClassSection}>
                <h4 className={styles.rakeSubTitle}>Optimal Rake by Car Class</h4>
                <div className={styles.rakeClassGrid}>
                  {RAKE_GUIDE.carClasses.map((cls) => (
                    <div key={cls.name} className={styles.rakeClassCard}>
                      <div className={styles.rakeClassHeader}>
                        <span className={styles.rakeClassIcon}>{cls.icon}</span>
                        <span className={styles.rakeClassName}>{cls.name}</span>
                      </div>
                      <div className={styles.rakeClassValues}>
                        <div className={styles.rakeClassValue}>
                          <span className={styles.rakeClassValueLabel}>Rake</span>
                          <span className={styles.rakeClassValueNum}>
                            {cls.typicalRake}
                          </span>
                        </div>
                        <div className={styles.rakeClassValue}>
                          <span className={styles.rakeClassValueLabel}>Front</span>
                          <span className={styles.rakeClassValueNumSm}>
                            {cls.frontRange}
                          </span>
                        </div>
                        <div className={styles.rakeClassValue}>
                          <span className={styles.rakeClassValueLabel}>Rear</span>
                          <span className={styles.rakeClassValueNumSm}>
                            {cls.rearRange}
                          </span>
                        </div>
                      </div>
                      <p className={styles.rakeClassNotes}>{cls.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tuning Steps */}
              <div className={styles.rakeTuningSection}>
                <h4 className={styles.rakeSubTitle}>Step-by-Step Tuning</h4>
                <ol className={styles.rakeTuningList}>
                  {RAKE_GUIDE.tuningSteps.map((step, i) => (
                    <li key={i} className={styles.rakeTuningStep}>
                      <span className={styles.rakeTuningNum}>{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Pro Tips */}
              <div className={styles.rakeTipsSection}>
                <h4 className={styles.rakeSubTitle}>💡 Pro Tips</h4>
                <div className={styles.rakeTipsList}>
                  {RAKE_GUIDE.tips.map((tip, i) => (
                    <div key={i} className={styles.rakeTipItem}>
                      <button
                        className={`${styles.rakeTipToggle} ${
                          expandedTips.has(i) ? styles.rakeTipToggleOpen : ''
                        }`}
                        onClick={() => toggleTip(i)}
                      >
                        <span className={styles.rakeTipTitle}>{tip.title}</span>
                        <span className={styles.refArrow}>
                          {expandedTips.has(i) ? '−' : '+'}
                        </span>
                      </button>
                      {expandedTips.has(i) && (
                        <div className={styles.rakeTipBody}>
                          <p>{tip.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Right: Results Panel ── */}
      <div className={styles.resultsPanel}>
        <div className={`glass-card ${styles.resultsCard}`}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>Recommendations</h3>
            {selectedProblem && <span className="badge badge-yellow">Live</span>}
          </div>

          {!selectedProblem ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔧</div>
              <p className={styles.emptyTitle}>Select a Handling Problem</p>
              <p className={styles.emptyText}>
                Choose a problem from the left panel to get tailored setup
                recommendations for your car.
              </p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🤔</div>
              <p className={styles.emptyText}>
                No specific recommendations found for this combination. Try a
                different corner phase.
              </p>
            </div>
          ) : (
            <>
              {/* Problem & phase summary */}
              <div
                className={styles.resultsSummary}
                style={
                  {
                    '--problem-color': selectedProblemData?.color,
                  } as React.CSSProperties
                }
              >
                <div className={styles.summaryProblem}>
                  <span className={styles.summaryIcon}>
                    {selectedProblemData?.icon}
                  </span>
                  <div>
                    <span className={styles.summaryLabel}>
                      {selectedProblemData?.label}
                    </span>
                    <span className={styles.summaryPhase}>
                      on {PHASES.find((p) => p.id === selectedPhase)?.label}
                    </span>
                  </div>
                </div>
                <span className={styles.summaryCount}>
                  {recommendations.length} suggestion{recommendations.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Recommendation Cards */}
              <div className={styles.recList}>
                {recommendations.map((rec, i) => {
                  const param = getParameterById(rec.parameterId);
                  if (!param) return null;
                  return (
                    <div
                      key={`${rec.parameterId}-${i}`}
                      className={`${styles.recCard} ${styles[`recCard${rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)}`]}`}
                    >
                      <div className={styles.recTop}>
                        <div className={styles.recDirection}>
                          <span
                            className={`${styles.recArrow} ${styles[`recArrow${rec.direction === 'increase' ? 'Up' : rec.direction === 'decrease' ? 'Down' : 'Adjust'}`]}`}
                          >
                            {directionArrow(rec.direction, rec.end)}
                          </span>
                          <div>
                            <span className={styles.recParamName}>
                              {param.name}
                            </span>
                            <span className={styles.recDirectionLabel}>
                              {directionLabel(rec.direction, rec.end)}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`${styles.recImpact} ${styles[`recImpact${rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)}`]}`}
                        >
                          {impactLabel(rec.impact)}
                        </span>
                      </div>
                      <p className={styles.recExplanation}>
                        {rec.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <div className={styles.disclaimer}>
                <span>💡</span>
                <span>
                  These are general guidelines. Make one change at a time and test.
                  Driving technique also plays a significant role — smooth inputs
                  are key!
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
