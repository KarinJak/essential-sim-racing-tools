'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  calculateBop,
  autoDetectSecondsPer10kg,
  formatLapTime,
  TRACK_PRESETS,
  DEFAULT_BOP_SETTINGS,
  type BopCarEntry,
  type BopSettings,
  type TrackPreset,
} from '@/lib/bopCalculator';
import styles from './BopCalculator.module.css';

// ── Helpers ────────────────────────────────────────────────────────

let nextId = 1;
function makeId(): string {
  return `car-${Date.now()}-${nextId++}`;
}

function emptyCarEntry(): BopCarEntry {
  return {
    id: makeId(),
    name: '',
    lapTimeMinutes: 0,
    lapTimeSeconds: 0,
    lapTimeMilliseconds: 0,
    currentBallastKg: 0,
    currentRestrictorPct: 0,
  };
}

function parseNum(val: string, fallback: number = 0): number {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : Math.max(0, n);
}

/**
 * Display a numeric value in an input field.
 * Returns '' only when the value is the initial default 0 AND the field is empty,
 * but returns '0' when the user has explicitly typed 0.
 * We track this by storing raw strings in a separate map.
 */
const rawInputs = new Map<string, string>();

function numericDisplay(key: string, value: number): string {
  const raw = rawInputs.get(key);
  // If the raw input is a string that parses to the current value (or is ''),
  // use the raw string to preserve user input like '0', '00', etc.
  if (raw !== undefined) return raw;
  // Initial state: show empty for 0
  return value === 0 ? '' : String(value);
}

function handleNumericChange(
  key: string,
  rawValue: string,
  max: number,
  allowDecimals: boolean = false,
): number {
  const filterRegex = allowDecimals ? /[^0-9.]/g : /[^0-9]/g;
  const raw = rawValue.replace(filterRegex, '');
  rawInputs.set(key, raw);
  if (raw === '') return 0;
  const parsed = allowDecimals ? parseFloat(raw) : parseInt(raw, 10);
  return isNaN(parsed) ? 0 : Math.min(max, parsed);
}

// ── Component ──────────────────────────────────────────────────────

export default function BopCalculator() {
  const [cars, setCars] = useState<BopCarEntry[]>([emptyCarEntry(), emptyCarEntry()]);
  const [settings, setSettings] = useState<BopSettings>(DEFAULT_BOP_SETTINGS);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const output = useMemo(() => calculateBop(cars, settings), [cars, settings]);
  const autoDetect = useMemo(() => autoDetectSecondsPer10kg(cars, settings), [cars, settings]);

  // Unique car names already entered (for name suggestions)
  const existingNames = useMemo(() => {
    const names = new Set<string>();
    for (const car of cars) {
      const trimmed = car.name.trim();
      if (trimmed) names.add(trimmed);
    }
    return Array.from(names);
  }, [cars]);

  function applyAutoDetect() {
    if (!autoDetect) return;
    setSettings((s) => ({ ...s, secondsPer10kg: autoDetect.secondsPer10kg }));
    setSelectedPreset('auto-detected');
  }

  // ── Car list handlers ──────────────────────────────────────────

  const updateCar = useCallback((id: string, update: Partial<BopCarEntry>) => {
    setCars((prev) => prev.map((c) => (c.id === id ? { ...c, ...update } : c)));
  }, []);

  const removeCar = useCallback((id: string) => {
    setCars((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addCar = useCallback(() => {
    setCars((prev) => [...prev, emptyCarEntry()]);
  }, []);

  // ── Preset handler ─────────────────────────────────────────────

  function applyPreset(preset: TrackPreset) {
    setSelectedPreset(preset.id);
    setSettings((prev) => ({ ...prev, secondsPer10kg: preset.secondsPer10kg }));
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className={styles.layout}>
      {/* ── Inputs Panel ── */}
      <div className={styles.inputsPanel}>
        {/* Track Type */}
        <section className={`glass-card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏁</span>
            Track Type
          </h3>
          <p className="input-hint" style={{ marginBottom: 'var(--space-md)' }}>
            Select a track type to auto-fill the ballast penalty value, or set it manually below.
          </p>
          <div className={styles.presetGrid}>
            {TRACK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`${styles.presetCard} ${selectedPreset === preset.id ? styles.presetCardActive : ''}`}
                onClick={() => applyPreset(preset)}
              >
                <div className={styles.presetCardLabel}>{preset.label}</div>
                <div className={styles.presetCardDesc}>{preset.description}</div>
                <div className={styles.presetCardExamples}>{preset.examples}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Auto-Detect Banner */}
        {autoDetect && (
          <div className={styles.autoDetectBanner}>
            <div className={styles.autoDetectContent}>
              <div className={styles.autoDetectIcon}>🔬</div>
              <div className={styles.autoDetectText}>
                <strong>Auto-Detected!</strong>{' '}
                {autoDetect.pairs.length === 1 ? (
                  <>
                    Using &quot;{autoDetect.pairs[0].carName}&quot; with{' '}
                    {autoDetect.pairs[0].lighterBallastKg}kg vs{' '}
                    {autoDetect.pairs[0].heavierBallastKg}kg ballast
                  </>
                ) : (
                  <>
                    Averaged from {autoDetect.pairs.length} pairs across {autoDetect.carCount} car
                    {autoDetect.carCount > 1 ? 's' : ''}
                  </>
                )}
                , the calculated value is{' '}
                <strong className={styles.autoDetectValue}>
                  {autoDetect.secondsPer10kg}s / 10kg
                </strong>
              </div>
            </div>
            {settings.secondsPer10kg !== autoDetect.secondsPer10kg && (
              <button className={styles.autoDetectApply} onClick={applyAutoDetect}>
                Apply
              </button>
            )}
            {settings.secondsPer10kg === autoDetect.secondsPer10kg && (
              <span className={styles.autoDetectApplied}>✓ Applied</span>
            )}
          </div>
        )}

        {/* Car List */}
        <section className={`glass-card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏎️</span>
            Cars
          </h3>
          <p className="input-hint" style={{ marginBottom: 'var(--space-md)' }}>
            Enter car names, lap times, and optionally their current BoP. If a car already has
            ballast/restrictor, enter those values and the calculator will estimate its true
            zero-BoP pace.
          </p>

          {/* Header labels */}
          <div className={styles.carRowHeader}>
            <span className={styles.carRowHeaderLabel}>Car Name</span>
            <span className={styles.carRowHeaderLabel}>Lap Time (M : SS . mmm)</span>
            <span className={styles.carRowHeaderLabel}>Current BoP</span>
            <span className={styles.carRowHeaderLabel}>&nbsp;</span>
          </div>

          <div className={styles.carList}>
            {cars.map((car) => (
              <div key={car.id} className={styles.carRow}>
                <div className={styles.carNameWrapper}>
                  <input
                    className={styles.carNameInput}
                    type="text"
                    value={car.name}
                    onChange={(e) => updateCar(car.id, { name: e.target.value })}
                    placeholder="e.g. Porsche 911 GT3 R"
                    list={`car-suggestions-${car.id}`}
                  />
                  <datalist id={`car-suggestions-${car.id}`}>
                    {existingNames
                      .filter((n) => n.toLowerCase() !== car.name.trim().toLowerCase())
                      .map((n) => (
                        <option key={n} value={n} />
                      ))}
                  </datalist>
                  {car.name.trim() !== '' &&
                    existingNames.some(
                      (n) =>
                        n.toLowerCase() === car.name.trim().toLowerCase() && n !== car.name.trim(),
                    ) &&
                    null}
                  {car.name.trim() !== '' &&
                    cars.some(
                      (other) =>
                        other.id !== car.id &&
                        other.name.trim().toLowerCase() === car.name.trim().toLowerCase() &&
                        other.name.trim() !== '',
                    ) && (
                      <div className={styles.duplicateHint}>
                        ⚡ Calibration pair — helps auto-detect sec/10kg
                      </div>
                    )}
                </div>

                <div className={styles.lapTimeGroup}>
                  <input
                    className={styles.lapTimeInput}
                    type="text"
                    inputMode="numeric"
                    value={numericDisplay(`${car.id}-min`, car.lapTimeMinutes)}
                    onChange={(e) => {
                      updateCar(car.id, { lapTimeMinutes: handleNumericChange(`${car.id}-min`, e.target.value, 59) });
                    }}
                    placeholder="M"
                  />
                  <span className={styles.lapTimeSep}>:</span>
                  <input
                    className={styles.lapTimeInput}
                    type="text"
                    inputMode="numeric"
                    value={numericDisplay(`${car.id}-sec`, car.lapTimeSeconds)}
                    onChange={(e) => {
                      updateCar(car.id, { lapTimeSeconds: handleNumericChange(`${car.id}-sec`, e.target.value, 59) });
                    }}
                    placeholder="SS"
                  />
                  <span className={styles.lapTimeSep}>.</span>
                  <input
                    className={styles.lapTimeInput}
                    type="text"
                    inputMode="numeric"
                    value={numericDisplay(`${car.id}-ms`, car.lapTimeMilliseconds)}
                    onChange={(e) => {
                      updateCar(car.id, { lapTimeMilliseconds: handleNumericChange(`${car.id}-ms`, e.target.value, 999) });
                    }}
                    placeholder="mmm"
                  />
                </div>

                <div className={styles.currentBopGroup}>
                  <input
                    className={styles.bopInput}
                    type="text"
                    inputMode="numeric"
                    value={numericDisplay(`${car.id}-ballast`, car.currentBallastKg)}
                    onChange={(e) => {
                      updateCar(car.id, { currentBallastKg: handleNumericChange(`${car.id}-ballast`, e.target.value, 200) });
                    }}
                    placeholder="0"
                    title="Current ballast (kg)"
                  />
                  <span className={styles.bopInputLabel}>kg</span>
                  <input
                    className={styles.bopInput}
                    type="text"
                    inputMode="numeric"
                    value={numericDisplay(`${car.id}-restr`, car.currentRestrictorPct)}
                    onChange={(e) => {
                      updateCar(car.id, { currentRestrictorPct: handleNumericChange(`${car.id}-restr`, e.target.value, 100) });
                    }}
                    placeholder="0"
                    title="Current restrictor (%)"
                  />
                  <span className={styles.bopInputLabel}>%</span>
                </div>

                <button
                  className={styles.removeBtn}
                  onClick={() => removeCar(car.id)}
                  title="Remove car"
                  disabled={cars.length <= 2}
                  style={cars.length <= 2 ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}
                >
                  ×
                </button>
              </div>
            ))}

            <button className={styles.addBtn} onClick={addCar}>
              + Add Car
            </button>
          </div>
        </section>

        {/* Advanced Settings */}
        <section className={`glass-card ${styles.section}`}>
          <button className={styles.advancedToggle} onClick={() => setShowAdvanced((v) => !v)}>
            <span>⚙️ Advanced Settings</span>
            <span
              className={`${styles.advancedArrow} ${showAdvanced ? styles.advancedArrowOpen : ''}`}
            >
              ▼
            </span>
          </button>

          {showAdvanced && (
            <div className={styles.advancedBody}>
              <div className="input-group">
                <label className="input-label" htmlFor="bop-sec-per-10kg">
                  Sec / 10 kg
                </label>
                <input
                  id="bop-sec-per-10kg"
                  className="form-input"
                  type="text"
                  inputMode="decimal"
                  value={numericDisplay('settings-secPer10kg', settings.secondsPer10kg)}
                  onChange={(e) => {
                    const v = handleNumericChange('settings-secPer10kg', e.target.value, 1, true);
                    setSettings((s) => ({ ...s, secondsPer10kg: v }));
                    setSelectedPreset(null);
                  }}
                />
                <p className="input-hint">Seconds lost per 10 kg ballast</p>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="bop-sec-per-rest">
                  Sec / 1% Restr.
                </label>
                <input
                  id="bop-sec-per-rest"
                  className="form-input"
                  type="text"
                  inputMode="decimal"
                  value={numericDisplay('settings-secPerRestr', settings.secondsPer1Restrictor)}
                  onChange={(e) => {
                    const v = handleNumericChange('settings-secPerRestr', e.target.value, 2, true);
                    setSettings((s) => ({
                      ...s,
                      secondsPer1Restrictor: v,
                    }));
                  }}
                />
                <p className="input-hint">Seconds lost per 1 % restrictor</p>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="bop-max-ballast">
                  Max Ballast (kg)
                </label>
                <input
                  id="bop-max-ballast"
                  className="form-input"
                  type="text"
                  inputMode="numeric"
                  value={numericDisplay('settings-maxBallast', settings.maxBallastKg)}
                  onChange={(e) => {
                    setSettings((s) => ({ ...s, maxBallastKg: handleNumericChange('settings-maxBallast', e.target.value, 200) }));
                  }}
                />
                <p className="input-hint">Above this → switch to restrictor</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Results Panel ── */}
      <div className={styles.resultsPanel}>
        <div className={`glass-card ${styles.resultsCard}`}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>BoP Results</h3>
            <span className="badge badge-yellow">Live</span>
          </div>

          {!output ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⚖️</div>
              <p className={styles.emptyText}>
                Add at least 2 cars with names and lap times to see BoP recommendations.
              </p>
            </div>
          ) : (
            <>
              {/* Baseline summary */}
              <div className={styles.baselineSummary}>
                <span className={styles.baselineLabel}>Baseline (Slowest Car)</span>
                <span className={styles.baselineName}>{output.baselineCarName}</span>
                <span className={styles.baselineTime}>{formatLapTime(output.baselineLapTime)}</span>
              </div>

              {/* Results list */}
              <div className={styles.resultsList}>
                {output.results.map((r) => (
                  <div
                    key={r.carId}
                    className={`${styles.resultRow} ${r.isBaseline ? styles.resultRowBaseline : ''} ${r.warning ? styles.resultRowWarning : ''}`}
                  >
                    <div className={styles.resultRowTop}>
                      <span className={styles.resultCarName}>
                        {r.carName}
                        {r.isBaseline && (
                          <span className={styles.baselineBadge} style={{ marginLeft: 8 }}>
                            Baseline
                          </span>
                        )}
                      </span>
                      {!r.isBaseline && (
                        <span className={styles.resultDelta}>−{r.delta.toFixed(3)}s faster</span>
                      )}
                    </div>

                    {!r.isBaseline && (
                      <div className={styles.resultMetrics}>
                        <div className={styles.resultMetric}>
                          <span className={styles.resultMetricLabel}>Ballast</span>
                          <span
                            className={`${styles.resultMetricValue} ${styles.resultMetricValueHighlight}`}
                          >
                            {r.ballastKg} kg
                          </span>
                        </div>
                        {r.restrictorPct > 0 && (
                          <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>Restrictor</span>
                            <span
                              className={`${styles.resultMetricValue} ${styles.resultMetricValueCyan}`}
                            >
                              {r.restrictorPct}%
                            </span>
                          </div>
                        )}
                        <div className={styles.resultMetric}>
                          <span className={styles.resultMetricLabel}>
                            {r.hadExistingBop ? 'Entered Time' : 'Lap Time'}
                          </span>
                          <span className={styles.resultMetricValue}>
                            {formatLapTime(r.lapTimeSeconds)}
                          </span>
                        </div>
                        {r.hadExistingBop && (
                          <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>Est. Zero-BoP</span>
                            <span
                              className={`${styles.resultMetricValue} ${styles.resultMetricValueCyan}`}
                            >
                              {formatLapTime(r.estimatedZeroBopTime)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {r.isBaseline && (
                      <div className={styles.resultMetrics}>
                        <div className={styles.resultMetric}>
                          <span className={styles.resultMetricLabel}>
                            {r.hadExistingBop ? 'Entered Time' : 'Lap Time'}
                          </span>
                          <span className={styles.resultMetricValue}>
                            {formatLapTime(r.lapTimeSeconds)}
                          </span>
                        </div>
                        {r.hadExistingBop && (
                          <div className={styles.resultMetric}>
                            <span className={styles.resultMetricLabel}>Est. Zero-BoP</span>
                            <span
                              className={`${styles.resultMetricValue} ${styles.resultMetricValueCyan}`}
                            >
                              {formatLapTime(r.estimatedZeroBopTime)}
                            </span>
                          </div>
                        )}
                        <div className={styles.resultMetric}>
                          <span className={styles.resultMetricLabel}>Ballast</span>
                          <span className={styles.resultMetricValue}>0 kg</span>
                        </div>
                      </div>
                    )}

                    {r.warning && (
                      <div className={styles.warningNote}>
                        <span>⚠️</span>
                        <span>{r.warning}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary footer */}
              <div className={styles.summaryFooter}>
                <span className={styles.summaryCount}>{output.results.length} cars balanced</span>
                <span>sec/10kg: {settings.secondsPer10kg}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
