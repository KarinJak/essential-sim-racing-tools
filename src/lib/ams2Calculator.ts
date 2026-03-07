// ── Types ──────────────────────────────────────────────────────────

export interface RaceInputs {
  // Race duration
  raceDurationHours: number;
  raceDurationMinutes: number;
  // Lap time
  lapTimeMinutes: number;
  lapTimeSeconds: number;
  lapTimeMilliseconds: number;
  // Formation lap
  hasFormationLap: boolean;
  // Fuel
  fuelPerLap: number;        // litres
  tankCapacity: number;      // litres
  // Pit stop
  pitStopDuration: number;   // seconds
  // Simulated time
  timeMultiplier: number;    // e.g. 60 means 1 real min = 60 in-game minutes
}

export interface RaceResults {
  // Timing
  totalRaceSeconds: number;
  lapTimeSeconds: number;
  totalLaps: number;
  // Fuel & pits
  fuelRequired: number;
  pitStopsRequired: number;
  timeLostInPitsSeconds: number;
  effectiveRaceTimeSeconds: number;
  // Simulated time results
  realTimeDurationSeconds: number;   // how long you sit at PC (real time)
  inGameDurationSeconds: number;     // in-game time that passes
  // Formatted
  formatted: {
    lapTime: string;
    totalRaceTime: string;
    effectiveRaceTime: string;
    realTimeDuration: string;
    inGameDuration: string;
    fuelRequired: string;
    pitStops: string;
    timeLostInPits: string;
    totalLaps: string;
  };
}

// ── Helpers ────────────────────────────────────────────────────────

/** Converts h/m/s/ms into total seconds */
export function toSeconds(h: number, m: number, s: number, ms: number = 0): number {
  return h * 3600 + m * 60 + s + ms / 1000;
}

/** Formats seconds as M:SS.mmm or H:MM:SS.mmm */
export function formatTime(totalSec: number): string {
  if (isNaN(totalSec) || !isFinite(totalSec) || totalSec < 0) return '—';
  const h   = Math.floor(totalSec / 3600);
  const m   = Math.floor((totalSec % 3600) / 60);
  const s   = Math.floor(totalSec % 60);
  const ms  = Math.round((totalSec - Math.floor(totalSec)) * 1000);

  const hStr  = h > 0 ? `${h}:` : '';
  const mStr  = h > 0 ? String(m).padStart(2, '0') : String(m);
  const sStr  = String(s).padStart(2, '0');
  const msStr = String(ms).padStart(3, '0');

  return `${hStr}${mStr}:${sStr}.${msStr}`;
}

/** Formats seconds as a human-friendly duration string e.g. "1h 24m 33s" */
export function formatDuration(totalSec: number): string {
  if (isNaN(totalSec) || !isFinite(totalSec) || totalSec < 0) return '—';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

// ── Core Calculator ────────────────────────────────────────────────

export function calculateRace(inputs: RaceInputs): RaceResults {
  const {
    raceDurationHours,
    raceDurationMinutes,
    lapTimeMinutes,
    lapTimeSeconds,
    lapTimeMilliseconds,
    hasFormationLap,
    fuelPerLap,
    tankCapacity,
    pitStopDuration,
    timeMultiplier,
  } = inputs;

  // ── Convert base values ──
  const raceDurationSec = toSeconds(raceDurationHours, raceDurationMinutes, 0);
  const lapTimeSec      = toSeconds(0, lapTimeMinutes, lapTimeSeconds, lapTimeMilliseconds);

  // Guard against zero/invalid values
  if (lapTimeSec <= 0 || raceDurationSec <= 0) {
    return buildEmptyResults();
  }

  // ── Formation lap (AMS2 formation lap is ~120% lap time) ──
  const formationLapTimeSec = hasFormationLap ? lapTimeSec * 1.2 : 0;
  const racingTime          = raceDurationSec - formationLapTimeSec;

  // ── Total laps (racing laps only, formation is separate) ──
  const totalLaps = Math.floor(racingTime / lapTimeSec);
  if (totalLaps <= 0) return buildEmptyResults();

  // ── Fuel calculations ──
  const fuelLaps     = totalLaps + (hasFormationLap ? 1 : 0);
  const fuelRequired = fuelLaps * fuelPerLap;
  const pitStops     = tankCapacity > 0
    ? Math.max(0, Math.ceil(fuelRequired / tankCapacity) - 1)
    : 0;
  const timeLostInPits = pitStops * pitStopDuration;

  // ── Race time ──
  const totalRaceTime     = formationLapTimeSec + totalLaps * lapTimeSec;
  const effectiveRaceTime = totalRaceTime + timeLostInPits;

  // ── Simulated time ──
  // realTimeDuration = configured session duration
  // inGameDuration   = realTimeDuration × timeMultiplier
  const realTimeDurationSec = raceDurationSec;
  const inGameDurationSec   = realTimeDurationSec * Math.max(1, timeMultiplier);

  return {
    totalRaceSeconds:         raceDurationSec,
    lapTimeSeconds:           lapTimeSec,
    totalLaps,
    fuelRequired,
    pitStopsRequired:         pitStops,
    timeLostInPitsSeconds:    timeLostInPits,
    effectiveRaceTimeSeconds: effectiveRaceTime,
    realTimeDurationSeconds:  realTimeDurationSec,
    inGameDurationSeconds:    inGameDurationSec,
    formatted: {
      lapTime:           formatTime(lapTimeSec),
      totalRaceTime:     formatDuration(totalRaceTime),
      effectiveRaceTime: formatDuration(effectiveRaceTime),
      realTimeDuration:  formatDuration(realTimeDurationSec),
      inGameDuration:    formatDuration(inGameDurationSec),
      fuelRequired:      `${fuelRequired.toFixed(1)} L`,
      pitStops:          String(pitStops),
      timeLostInPits:    `${timeLostInPits.toFixed(0)} s`,
      totalLaps:         String(totalLaps),
    },
  };
}

function buildEmptyResults(): RaceResults {
  const empty = '—';
  return {
    totalRaceSeconds: 0,
    lapTimeSeconds: 0,
    totalLaps: 0,
    fuelRequired: 0,
    pitStopsRequired: 0,
    timeLostInPitsSeconds: 0,
    effectiveRaceTimeSeconds: 0,
    realTimeDurationSeconds: 0,
    inGameDurationSeconds: 0,
    formatted: {
      lapTime: empty,
      totalRaceTime: empty,
      effectiveRaceTime: empty,
      realTimeDuration: empty,
      inGameDuration: empty,
      fuelRequired: empty,
      pitStops: empty,
      timeLostInPits: empty,
      totalLaps: empty,
    },
  };
}
