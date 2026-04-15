'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  calculateBop,
  autoDetectSecondsPer10kg,
  autoDetectSecondsPer1Restrictor,
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
  const [cars, setCars] = useState<BopCarEntry[]>([]);
  const [settings, setSettings] = useState<BopSettings>(DEFAULT_BOP_SETTINGS);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedCars, setSavedCars] = useState<string[]>([]);
  const [trackName, setTrackName] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [sortOrder, setSortOrder] = useState<'delta' | 'name-asc' | 'name-desc'>('delta');

  useEffect(() => {
    setIsClient(true);
    // Cars are no longer auto-restored here, they are loaded via the "Load Recent Session" button if desired.

    try {
      const saved = localStorage.getItem('recentBopCars');
      if (saved) setSavedCars(JSON.parse(saved));
    } catch (e) { }
  }, []);

  useEffect(() => {
    if (isClient && cars.length > 0) {
      try {
        localStorage.setItem('bopCalculatorSessionCars', JSON.stringify(cars));
        localStorage.setItem('bopCalculatorTrackName', trackName);
        localStorage.setItem('bopCalculatorSettings', JSON.stringify(settings));
      } catch (e) { }
    }

    const validNames = cars.map((c) => c.name.trim()).filter(Boolean);
    if (validNames.length > 0) {
      setSavedCars((prev) => {
        const next = Array.from(new Set([...validNames, ...prev])).slice(0, 50);
        try {
          localStorage.setItem('recentBopCars', JSON.stringify(next));
        } catch (e) { }
        return next;
      });
    }
  }, [cars, trackName, isClient]);

  const output = useMemo(() => calculateBop(cars, settings), [cars, settings]);
  const autoDetect = useMemo(() => autoDetectSecondsPer10kg(cars, settings), [cars, settings]);
  const autoDetectRestrictor = useMemo(() => autoDetectSecondsPer1Restrictor(cars, settings), [cars, settings]);

  const sortedResults = useMemo(() => {
    if (!output) return [];
    const res = [...output.results];
    if (sortOrder === 'name-asc') {
      res.sort((a, b) => a.carName.localeCompare(b.carName));
    } else if (sortOrder === 'name-desc') {
      res.sort((a, b) => b.carName.localeCompare(a.carName));
    }
    // If 'delta', it's already sorted by calculateBop
    return res;
  }, [output, sortOrder]);

  // Unique car names already entered (for name suggestions)
  const existingNames = useMemo(() => {
    const names = new Set<string>();
    for (const car of cars) {
      const trimmed = car.name.trim();
      if (trimmed) names.add(trimmed);
    }
    for (const saved of savedCars) {
      names.add(saved);
    }
    return Array.from(names);
  }, [cars, savedCars]);

  function applyAutoDetect() {
    if (!autoDetect) return;
    setSettings((s) => ({ ...s, secondsPer10kg: autoDetect.secondsPer10kg }));
    setSelectedPreset('auto-detected');
  }

  function loadRecentSession() {
    try {
      const savedSessionCars = localStorage.getItem('bopCalculatorSessionCars');
      const savedSettings = localStorage.getItem('bopCalculatorSettings');

      if (savedSessionCars) {
        const parsed = JSON.parse(savedSessionCars);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCars(parsed);
        } else {
          alert('No recent session found.');
        }
      } else {
        alert('No recent session found.');
      }

      const savedTrack = localStorage.getItem('bopCalculatorTrackName');
      if (savedTrack) setTrackName(savedTrack);

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      alert('Error loading recent session.');
    }
  }

  function applyAutoDetectRestrictor() {
    if (!autoDetectRestrictor) return;
    setSettings((s) => ({ ...s, secondsPer1Restrictor: autoDetectRestrictor.secondsPer1Restrictor }));
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

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let jsonData: any = null;
    try {
      const text = await file.text();
      jsonData = JSON.parse(text);
    } catch (err) {
      console.error('Error reading JSON:', err);
      alert('Invalid JSON file format.');
      if (e.target) e.target.value = '';
      return;
    }

    if (!jsonData) {
      alert('Could not find a valid Assetto Corsa JSON result file.');
      if (e.target) e.target.value = '';
      return;
    }

    let resultsArray = Array.isArray(jsonData)
      ? jsonData
      : jsonData.cars || jsonData.Result || jsonData.sessionResult?.leaderBoardLines;

    let isSinglePlayerRaceOut = false;
    if (jsonData.players && Array.isArray(jsonData.sessions)) {
      isSinglePlayerRaceOut = true;
    }

    if (!resultsArray && !isSinglePlayerRaceOut) {
      alert('Could not find race results in this JSON file. Please upload a valid Assetto Corsa result file.');
      if (e.target) e.target.value = '';
      return;
    }

    const importedCars: BopCarEntry[] = [];
    const carStats = new Map<string | number, { bestLap: number; ballast: number; restrictor: number, carModel: string, driverName?: string }>();

    if (isSinglePlayerRaceOut) {
      if (jsonData.track) setTrackName(jsonData.track);

      for (const session of jsonData.sessions) {
        if (!session.bestLaps) continue;
        for (const bl of session.bestLaps) {
          const carId = bl.car;
          const player = jsonData.players[carId];
          if (!player) continue;

          const carModel = player.car || 'Unknown Car';
          const driverName = player.name || `Driver ${carId}`;
          const bestLap = bl.time;
          let ballast = player.ballastKG || 0;
          let restrictor = player.restrictor || 0;

          if (bestLap <= 0 || bestLap >= 99999999) continue;

          const existing = carStats.get(carId);
          if (!existing || bestLap < existing.bestLap) {
            carStats.set(carId, { bestLap, ballast, restrictor, carModel, driverName });
          }
        }
      }
    } else {
      if (jsonData.TrackName) {
        setTrackName(`${jsonData.TrackName}${jsonData.TrackConfig ? ` (${jsonData.TrackConfig})` : ''}`);
      }

      for (const entry of resultsArray) {
        const carModel = entry.CarModel || (entry.car && entry.car.carModel) || entry.model || 'Unknown Car';
        const driverName = entry.driver || entry.DriverName || entry.car?.drivers?.[0]?.firstName || undefined;
        const bestLap = entry.BestLap || entry.bestLap || (entry.timing && entry.timing.bestLap) || 0;
        let ballast = entry.BallastKG || entry.ballastKg || 0;
        let restrictor = entry.Restrictor || entry.restrictorPct || 0;

        if (bestLap <= 0 || bestLap >= 99999999) continue;

        // Group by acCarId to preserve multiple drivers of the same car, otherwise group by carModel
        const key = entry.acCarId !== undefined ? entry.acCarId : carModel;

        const existing = carStats.get(key);
        if (!existing || bestLap < existing.bestLap) {
          carStats.set(key, { bestLap, ballast, restrictor, carModel, driverName });
        }
      }
    }

    for (const [key, stats] of carStats.entries()) {
      const totalMs = stats.bestLap;
      const lapTimeMinutes = Math.floor(totalMs / 60000);
      const lapTimeSeconds = Math.floor((totalMs % 60000) / 1000);
      const lapTimeMilliseconds = totalMs % 1000;

      const acCarId = typeof key === 'number' ? key : undefined;

      importedCars.push({
        id: makeId(),
        acCarId,
        name: stats.carModel,
        lapTimeMinutes,
        lapTimeSeconds,
        lapTimeMilliseconds,
        currentBallastKg: stats.ballast,
        currentRestrictorPct: stats.restrictor,
      });
    }

    if (importedCars.length > 0) {
      setCars((prev) => {
        const isCurrentEmpty = prev.every(
          (c) =>
            c.name.trim() === '' &&
            c.lapTimeMinutes === 0 &&
            c.lapTimeSeconds === 0 &&
            c.lapTimeMilliseconds === 0 &&
            c.currentBallastKg === 0 &&
            c.currentRestrictorPct === 0
        );
        if (isCurrentEmpty) {
          return importedCars.length === 1 ? [...importedCars, emptyCarEntry()] : importedCars;
        } else {
          return [
            ...prev.filter((c) => c.name.trim() !== '' || c.lapTimeMinutes > 0 || c.lapTimeSeconds > 0),
            ...importedCars,
          ];
        }
      });
    } else {
      alert('No valid lap times found in the JSON.');
    }

    if (e.target) e.target.value = '';
  }, []);

  const handleIniUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();

      const iniParamsById = new Map<number, { ballast: number; restrictor: number }>();
      const iniParamsByModel = new Map<string, { ballast: number; restrictor: number }>();

      let globalModel = '';
      let currentModel = '';
      let currentCarId = -1;

      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('MODEL=') && currentCarId === -1) {
          globalModel = trimmed.substring(6).trim();
        } else if (trimmed.startsWith('[CAR_')) {
          const match = trimmed.match(/\[CAR_(\d+)\]/);
          if (match) {
            currentCarId = parseInt(match[1], 10);
            currentModel = 'WAITING';
          } else {
            currentCarId = -1;
            currentModel = '';
          }
        } else if (trimmed.startsWith('MODEL=') && currentModel === 'WAITING' && currentCarId !== -1) {
          const m = trimmed.substring(6).trim();
          currentModel = m === '-' ? globalModel : m;
          if (!iniParamsById.has(currentCarId)) {
            iniParamsById.set(currentCarId, { ballast: 0, restrictor: 0 });
            // Also store by model as fallback for manual row entries
            iniParamsByModel.set(currentModel, { ballast: 0, restrictor: 0 });
          }
        } else if (trimmed.startsWith('BALLAST=') && currentCarId !== -1) {
          const val = parseInt(trimmed.substring(8).trim(), 10);
          const stats = iniParamsById.get(currentCarId);
          if (stats && !isNaN(val)) {
            stats.ballast = val;
            if (currentModel && currentModel !== 'WAITING') {
              const mapStats = iniParamsByModel.get(currentModel);
              if (mapStats) mapStats.ballast = val; // Store last seen for model fallback
            }
          }
        } else if (trimmed.startsWith('RESTRICTOR=') && currentCarId !== -1) {
          const val = parseInt(trimmed.substring(11).trim(), 10);
          const stats = iniParamsById.get(currentCarId);
          if (stats && !isNaN(val)) {
            stats.restrictor = val;
            if (currentModel && currentModel !== 'WAITING') {
              const mapStats = iniParamsByModel.get(currentModel);
              if (mapStats) mapStats.restrictor = val;
            }
          }
        }
      }

      if (iniParamsById.size === 0) {
        alert("No cars found in this INI file.");
        return;
      }

      setCars((prev) => {
        const nextCars = prev.map(c => {
          // Try exact match via acCarId first (for imported multi-row singleplayer data)
          let override = c.acCarId !== undefined ? iniParamsById.get(c.acCarId) : undefined;

          // Fallback to name match
          if (!override) {
            override = iniParamsByModel.get(c.name);
          }

          if (override) {
            return { ...c, currentBallastKg: override.ballast, currentRestrictorPct: override.restrictor };
          }
          return c;
        });

        const detect10kg = autoDetectSecondsPer10kg(nextCars, settings);
        const detect1Res = autoDetectSecondsPer1Restrictor(nextCars, settings);
        if (detect10kg || detect1Res) {
          setSettings(s => ({
            ...s,
            secondsPer10kg: detect10kg ? detect10kg.secondsPer10kg : s.secondsPer10kg,
            secondsPer1Restrictor: detect1Res ? detect1Res.secondsPer1Restrictor : s.secondsPer1Restrictor
          }));
        }

        return nextCars;
      });

    } catch (err) {
      console.error('Error parsing INI file', err);
      alert('Invalid INI file format.');
    }

    if (e.target) e.target.value = '';
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
            <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              <span className={styles.sectionIcon}>🏁</span>
              Track Type & Info
            </h3>
          </div>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <input
              type="text"
              placeholder="Enter Track Name (e.g. Monza, Nordschleife...)"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              className={styles.carNameInput}
              style={{ width: '100%' }}
            />
          </div>
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

        {/* Auto-Detect Restrictor Banner */}
        {autoDetectRestrictor && (
          <div className={styles.autoDetectBanner}>
            <div className={styles.autoDetectContent}>
              <div className={styles.autoDetectIcon}>🔬</div>
              <div className={styles.autoDetectText}>
                <strong>Restrictor Auto-Detected!</strong>{' '}
                {autoDetectRestrictor.pairs.length === 1 ? (
                  <>
                    Using &quot;{autoDetectRestrictor.pairs[0].carName}&quot; with{' '}
                    {autoDetectRestrictor.pairs[0].lowerRestrictorPct}% vs{' '}
                    {autoDetectRestrictor.pairs[0].higherRestrictorPct}% restrictor
                  </>
                ) : (
                  <>
                    Averaged from {autoDetectRestrictor.pairs.length} pairs across {autoDetectRestrictor.carCount} car
                    {autoDetectRestrictor.carCount > 1 ? 's' : ''}
                  </>
                )}
                , the calculated value is{' '}
                <strong className={styles.autoDetectValue}>
                  {autoDetectRestrictor.secondsPer1Restrictor}s / 1%
                </strong>
              </div>
            </div>
            {settings.secondsPer1Restrictor !== autoDetectRestrictor.secondsPer1Restrictor && (
              <button className={styles.autoDetectApply} onClick={applyAutoDetectRestrictor}>
                Apply
              </button>
            )}
            {settings.secondsPer1Restrictor === autoDetectRestrictor.secondsPer1Restrictor && (
              <span className={styles.autoDetectApplied}>✓ Applied</span>
            )}
          </div>
        )}

        {/* Car List */}
        <section className={`glass-card ${styles.section}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: '12px' }}>
            <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              <span className={styles.sectionIcon}>🏎️</span>
              Cars
            </h3>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 12px', height: '100%', minHeight: '38px', margin: 0, display: 'flex', alignItems: 'center' }}
                onClick={loadRecentSession}
                title="Restore from last loaded session"
              >
                🔄 Load Recent
              </button>
              <label
                className="btn btn-secondary"
                title="Import lap times and cars from race_out.json"
                style={{ padding: '8px 12px', height: '100%', minHeight: '38px', margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <span>📁 Import race_out.json</span>
              </label>
              <label
                className="btn btn-secondary"
                title="Update current list with ballast/restrictor from race.ini"
                style={{ padding: '8px 12px', height: '100%', minHeight: '38px', margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <input
                  type="file"
                  accept=".ini"
                  style={{ display: 'none' }}
                  onChange={handleIniUpload}
                />
                <span>📁 Map Ballast (race.ini)</span>
              </label>
            </div>
          </div>
          <p className="input-hint" style={{ marginBottom: 'var(--space-md)' }}>
            Enter car names, lap times, and optionally their current BoP. If a car already has
            ballast/restrictor, enter those values and the calculator will estimate its true
            zero-BoP pace. You can also import an Assetto Corsa result JSON to auto-fill.
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                className="form-input"
                style={{ padding: '4px 8px', height: 'auto', minHeight: '30px', margin: 0, fontSize: '13px' }}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="delta">Sort by Pace</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
              <span className="badge badge-yellow">Live</span>
            </div>
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
                {sortedResults.map((r) => (
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
