'use client';

import { useState, useMemo } from 'react';
import { calculateRace, type RaceInputs } from '@/lib/ams2Calculator';
import styles from './RaceDurationCalculator.module.css';

// ── Default Inputs ─────────────────────────────────────────────────
const DEFAULT_INPUTS: RaceInputs = {
  raceDurationHours: 1,
  raceDurationMinutes: 0,
  lapTimeMinutes: 2,
  lapTimeSeconds: 0,
  lapTimeMilliseconds: 0,
  hasFormationLap: true,
  fuelPerLap: 3.5,
  tankCapacity: 55,
  pitStopDuration: 30,
  timeMultiplier: 1,
};

// ── Helper: numeric input change ───────────────────────────────────
function parseNum(val: string, fallback: number = 0): number {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : Math.max(0, n);
}

// ── Component ──────────────────────────────────────────────────────
export default function RaceDurationCalculator() {
  const [inputs, setInputs] = useState<RaceInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculateRace(inputs), [inputs]);

  function set<K extends keyof RaceInputs>(key: K, value: RaceInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  const isSimTime = inputs.timeMultiplier > 1;

  return (
    <div className={styles.layout}>
      {/* ── Inputs Panel ── */}
      <div className={styles.inputsPanel}>

        {/* Race Duration */}
        <section className={`glass-card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⏱️</span>
            Race Duration
          </h3>
          <div className={styles.inputRow}>
            <div className="input-group">
              <label className="input-label">Hours</label>
              <input
                id="race-hours"
                className="form-input"
                type="number"
                min={0}
                max={100}
                value={inputs.raceDurationHours}
                onChange={(e) => set('raceDurationHours', parseNum(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Minutes</label>
              <input
                id="race-minutes"
                className="form-input"
                type="number"
                min={0}
                max={59}
                value={inputs.raceDurationMinutes}
                onChange={(e) => set('raceDurationMinutes', parseNum(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>
        </section>

        {/* Lap Time */}
        <section className={`glass-card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏁</span>
            Lap Time
          </h3>
          <div className={styles.inputRow3}>
            <div className="input-group">
              <label className="input-label">Min</label>
              <input
                id="lap-minutes"
                className="form-input"
                type="number"
                min={0}
                max={59}
                value={inputs.lapTimeMinutes}
                onChange={(e) => set('lapTimeMinutes', parseNum(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Sec</label>
              <input
                id="lap-seconds"
                className="form-input"
                type="number"
                min={0}
                max={59}
                value={inputs.lapTimeSeconds}
                onChange={(e) => set('lapTimeSeconds', parseNum(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label className="input-label">ms</label>
              <input
                id="lap-ms"
                className="form-input"
                type="number"
                min={0}
                max={999}
                value={inputs.lapTimeMilliseconds}
                onChange={(e) => set('lapTimeMilliseconds', parseNum(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>
          <p className="input-hint">Your best representative lap time</p>
        </section>

        {/* Formation Lap */}
        <section className={`glass-card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🚦</span>
            Formation Lap
          </h3>
          <div
            className="toggle-row"
            role="switch"
            aria-checked={inputs.hasFormationLap}
            onClick={() => set('hasFormationLap', !inputs.hasFormationLap)}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && set('hasFormationLap', !inputs.hasFormationLap)}
          >
            <div className={`toggle ${inputs.hasFormationLap ? 'on' : ''}`} />
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                Include Formation Lap
              </p>
              <p className="input-hint" style={{ marginTop: 2 }}>
                Adds 1 lap at ~120% pace before race start (AMS2 default)
              </p>
            </div>
          </div>
        </section>

        {/* Fuel & Pit Stops */}
        <section className={`glass-card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⛽</span>
            Fuel &amp; Pit Stops
          </h3>
          <div className={styles.inputRow}>
            <div className="input-group">
              <label className="input-label" htmlFor="fuel-per-lap">Fuel / Lap (L)</label>
              <input
                id="fuel-per-lap"
                className="form-input"
                type="number"
                min={0}
                step={0.1}
                value={inputs.fuelPerLap}
                onChange={(e) => set('fuelPerLap', parseNum(e.target.value))}
                placeholder="3.5"
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="tank-capacity">Tank Capacity (L)</label>
              <input
                id="tank-capacity"
                className="form-input"
                type="number"
                min={0}
                step={1}
                value={inputs.tankCapacity}
                onChange={(e) => set('tankCapacity', parseNum(e.target.value))}
                placeholder="55"
              />
            </div>
          </div>
          <div className="input-group" style={{ marginTop: 'var(--space-md)' }}>
            <label className="input-label" htmlFor="pit-stop-duration">Avg Pit Stop Duration (seconds)</label>
            <input
              id="pit-stop-duration"
              className="form-input"
              type="number"
              min={0}
              step={1}
              value={inputs.pitStopDuration}
              onChange={(e) => set('pitStopDuration', parseNum(e.target.value))}
              placeholder="30"
            />
            <p className="input-hint">Total time lost per pit stop including in &amp; out laps</p>
          </div>
        </section>

        {/* Simulated Time */}
        <section className={`glass-card ${styles.section} ${styles.sectionSim}`}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🌅</span>
            Simulated Time (Day/Night Cycle)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            AMS2 lets you configure an in-game time multiplier so a 24-minute session
            feels like a full 24-hour race. Set the multiplier to match your in-game setting.
          </p>

          <div className="input-group">
            <label className="input-label" htmlFor="time-multiplier">Time Multiplier (×)</label>
            <input
              id="time-multiplier"
              className="form-input"
              type="number"
              min={1}
              max={600}
              step={1}
              value={inputs.timeMultiplier}
              onChange={(e) => set('timeMultiplier', Math.max(1, parseNum(e.target.value, 1)))}
              placeholder="60"
            />
            <p className="input-hint">
              ×1 = real time &nbsp;|&nbsp; ×60 = 1 real minute = 1 in-game hour &nbsp;|&nbsp; ×1440 = 1 real minute = 1 in-game day
            </p>
          </div>

          {/* Quick presets */}
          <div className={styles.presets}>
            {[1, 6, 12, 24, 60].map((m) => (
              <button
                key={m}
                className={`${styles.presetBtn} ${inputs.timeMultiplier === m ? styles.presetBtnActive : ''}`}
                onClick={() => set('timeMultiplier', m)}
              >
                ×{m}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ── Results Panel ── */}
      <div className={styles.resultsPanel}>
        <div className={`glass-card ${styles.resultsCard}`}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>Results</h3>
            <span className="badge badge-yellow">Live</span>
          </div>

          {/* Key metrics */}
          <div className={styles.keyMetrics}>
            <div className={styles.keyMetric}>
              <span className="result-label">Total Laps</span>
              <span className={`result-value highlight`}>{results.formatted.totalLaps}</span>
            </div>
            <div className={styles.keyMetric}>
              <span className="result-label">Race Duration</span>
              <span className="result-value">{results.formatted.totalRaceTime}</span>
            </div>
          </div>

          <div className="divider" />

          {/* Fuel & Pits */}
          <div className={styles.resultsGroup}>
            <p className={styles.groupLabel}>Fuel &amp; Pit Strategy</p>
            <div className={`result-grid ${styles.resultGrid2}`}>
              <div className="result-item">
                <span className="result-label">Fuel Required</span>
                <span className="result-value">{results.formatted.fuelRequired}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Pit Stops</span>
                <span className={`result-value ${results.pitStopsRequired > 0 ? '' : ''}`}>
                  {results.formatted.pitStops}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">Time Lost in Pits</span>
                <span className="result-value">{results.formatted.timeLostInPits}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Effective Race Time</span>
                <span className="result-value">{results.formatted.effectiveRaceTime}</span>
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Simulated Time */}
          <div className={`${styles.resultsGroup} ${isSimTime ? styles.simActive : ''}`}>
            <p className={styles.groupLabel}>
              🌅 Simulated Time{isSimTime ? ` (×${inputs.timeMultiplier})` : ' (×1 — Real-time)'}
            </p>
            <div className={`result-grid ${styles.resultGrid2}`}>
              <div className="result-item">
                <span className="result-label">You Race For (Real Time)</span>
                <span className="result-value">{results.formatted.realTimeDuration}</span>
                <span className="result-sub">Time you actually sit at your PC</span>
              </div>
              <div className="result-item">
                <span className="result-label">In-Game Time Passes</span>
                <span className={`result-value ${isSimTime ? 'highlight-cyan' : ''}`}>
                  {results.formatted.inGameDuration}
                </span>
                <span className="result-sub">In-game world clock advances by this</span>
              </div>
            </div>

            {isSimTime && (
              <div className={styles.simNote}>
                <span>💡</span>
                <p>
                  At ×{inputs.timeMultiplier}, your {results.formatted.realTimeDuration} session simulates{' '}
                  <strong style={{ color: 'var(--accent-secondary)' }}>{results.formatted.inGameDuration}</strong> of in-game time.
                  {inputs.timeMultiplier === 60 && ' Perfect for a 24-minute "24 Hours of Le Mans" style race!'}
                </p>
              </div>
            )}
          </div>

          <div className="divider" />

          {/* Lap time reference */}
          <div className={styles.resultsGroup}>
            <p className={styles.groupLabel}>Lap Reference</p>
            <div className="result-item">
              <span className="result-label">Lap Time</span>
              <span className="result-value mono">{results.formatted.lapTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
