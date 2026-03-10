// ── Types ────────────────────────────────────────────────────────────

export interface BopCarEntry {
  id: string;
  name: string;
  lapTimeMinutes: number;
  lapTimeSeconds: number;
  lapTimeMilliseconds: number;
  /** Current ballast already applied to this car (kg) */
  currentBallastKg: number;
  /** Current restrictor already applied to this car (%) */
  currentRestrictorPct: number;
}

export interface BopSettings {
  /** How many seconds 10 kg of ballast costs on this track */
  secondsPer10kg: number;
  /** How many seconds 1 % restrictor costs on this track */
  secondsPer1Restrictor: number;
  /** Maximum ballast before switching to restrictor (kg) */
  maxBallastKg: number;
}

export interface BopResult {
  carId: string;
  carName: string;
  /** The lap time as entered (with whatever BoP was applied) */
  lapTimeSeconds: number;
  /** Estimated zero-BoP (raw) lap time after stripping existing BoP */
  estimatedZeroBopTime: number;
  /** Had existing BoP applied? */
  hadExistingBop: boolean;
  /** Delta between this car's zero-BoP time and the baseline */
  delta: number;
  /** Recommended total ballast (kg) */
  ballastKg: number;
  /** Recommended total restrictor (%) */
  restrictorPct: number;
  isBaseline: boolean;
  warning: string | null;
}

export interface BopOutput {
  baselineCarName: string;
  baselineLapTime: number;
  results: BopResult[];
}

// ── Track Presets ────────────────────────────────────────────────────

export interface TrackPreset {
  id: string;
  label: string;
  description: string;
  secondsPer10kg: number;
  examples: string;
}

export const TRACK_PRESETS: TrackPreset[] = [
  {
    id: 'stop-and-go',
    label: 'Stop-and-Go',
    description: 'Lots of hard braking and low-speed acceleration',
    secondsPer10kg: 0.18,
    examples: 'Monza, Red Bull Ring',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Mix of medium-speed corners and decent straights',
    secondsPer10kg: 0.14,
    examples: 'Nürburgring GP, Imola',
  },
  {
    id: 'technical',
    label: 'Technical / Flowing',
    description: 'High-momentum corners, less heavy braking',
    secondsPer10kg: 0.10,
    examples: 'Brands Hatch, Zandvoort',
  },
  {
    id: 'long',
    label: 'Long / Endurance',
    description: 'Long lap — small penalties add up over many corners',
    secondsPer10kg: 0.22,
    examples: 'Spa, Nordschleife',
  },
];

// ── Default Settings ─────────────────────────────────────────────────

export const DEFAULT_BOP_SETTINGS: BopSettings = {
  secondsPer10kg: 0.15,
  secondsPer1Restrictor: 0.17,
  maxBallastKg: 50,
};

// ── Utility ──────────────────────────────────────────────────────────

/** Convert entry fields to total seconds */
export function entryToSeconds(entry: BopCarEntry): number {
  return entry.lapTimeMinutes * 60 + entry.lapTimeSeconds + entry.lapTimeMilliseconds / 1000;
}

/** Format seconds to M:SS.mmm */
export function formatLapTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const whole = Math.floor(secs);
  const ms = Math.round((secs - whole) * 1000);
  return `${mins}:${String(whole).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

// ── Existing BoP → time penalty ──────────────────────────────────────

/** Calculate how many seconds an existing BoP adds to the lap time */
function existingBopPenalty(car: BopCarEntry, settings: BopSettings): number {
  const ballastPenalty = (car.currentBallastKg / 10) * settings.secondsPer10kg;
  const restrictorPenalty = car.currentRestrictorPct * settings.secondsPer1Restrictor;
  return ballastPenalty + restrictorPenalty;
}

// ── Auto-Detect seconds_per_10kg ─────────────────────────────────────

export interface DetectedPair {
  carName: string;
  lighterBallastKg: number;
  heavierBallastKg: number;
  lighterTime: number;
  heavierTime: number;
  calculatedSecPer10kg: number;
}

export interface AutoDetectResult {
  detected: boolean;
  /** Average seconds_per_10kg across all detected pairs */
  secondsPer10kg: number;
  /** Individual pair calculations */
  pairs: DetectedPair[];
  /** How many unique cars contributed to the average */
  carCount: number;
}

/**
 * If the user enters the same car name twice with different ballast values,
 * we can derive the exact seconds_per_10kg from the lap time difference.
 * When multiple cars have pairs, we average all to get a more accurate result.
 */
export function autoDetectSecondsPer10kg(
  cars: BopCarEntry[],
  settings: BopSettings,
): AutoDetectResult | null {
  const validCars = cars.filter((c) => c.name.trim() !== '' && entryToSeconds(c) > 0);

  // Group by normalized name (lowercase, trimmed)
  const groups = new Map<string, BopCarEntry[]>();
  for (const car of validCars) {
    const key = car.name.trim().toLowerCase();
    const list = groups.get(key) || [];
    list.push(car);
    groups.set(key, list);
  }

  const allPairs: DetectedPair[] = [];
  const contributingCars = new Set<string>();

  // Look for pairs with different ballast in every group
  for (const [, entries] of groups) {
    if (entries.length < 2) continue;

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];

        const ballastDiff = Math.abs(a.currentBallastKg - b.currentBallastKg);
        const restrictorDiff = Math.abs(a.currentRestrictorPct - b.currentRestrictorPct);

        if (ballastDiff < 1) continue;

        const timeA = entryToSeconds(a);
        const timeB = entryToSeconds(b);
        if (Math.abs(timeA - timeB) < 0.001) continue;

        const heavier = a.currentBallastKg > b.currentBallastKg ? a : b;
        const lighter = a.currentBallastKg > b.currentBallastKg ? b : a;
        const heavierTime = entryToSeconds(heavier);
        const lighterTime = entryToSeconds(lighter);

        // Account for restrictor difference if any
        let adjustedTimeDiff = heavierTime - lighterTime;
        if (restrictorDiff > 0) {
          const restrictorTimeDiff =
            (heavier.currentRestrictorPct - lighter.currentRestrictorPct) *
            settings.secondsPer1Restrictor;
          adjustedTimeDiff -= restrictorTimeDiff;
        }

        const calculated = adjustedTimeDiff / (ballastDiff / 10);

        // Sanity check
        if (calculated > 0.01 && calculated < 1.0) {
          allPairs.push({
            carName: heavier.name,
            lighterBallastKg: lighter.currentBallastKg,
            heavierBallastKg: heavier.currentBallastKg,
            lighterTime,
            heavierTime,
            calculatedSecPer10kg: Math.round(calculated * 1000) / 1000,
          });
          contributingCars.add(heavier.name.trim().toLowerCase());
        }
      }
    }
  }

  if (allPairs.length === 0) return null;

  // Average across all pairs
  const avg = allPairs.reduce((sum, p) => sum + p.calculatedSecPer10kg, 0) / allPairs.length;

  return {
    detected: true,
    secondsPer10kg: Math.round(avg * 1000) / 1000,
    pairs: allPairs,
    carCount: contributingCars.size,
  };
}

// ── Main Calculation ─────────────────────────────────────────────────

export function calculateBop(cars: BopCarEntry[], settings: BopSettings): BopOutput | null {
  // Filter out cars with no name or zero lap time
  const validCars = cars.filter((c) => c.name.trim() !== '' && entryToSeconds(c) > 0);

  if (validCars.length < 2) return null;

  // Step 1: Estimate the zero-BoP lap time for each car.
  // If the car already has ballast/restrictor, its actual pace is FASTER
  // than the entered time. We strip out the penalty to get the "raw" time.
  const zeroBopTimes: { car: BopCarEntry; enteredTime: number; zeroBopTime: number; hadBop: boolean }[] =
    validCars.map((car) => {
      const enteredTime = entryToSeconds(car);
      const penalty = existingBopPenalty(car, settings);
      const hadBop = car.currentBallastKg > 0 || car.currentRestrictorPct > 0;
      return {
        car,
        enteredTime,
        zeroBopTime: enteredTime - penalty, // strip penalty → faster raw time
        hadBop,
      };
    });

  // Step 1.5: Deduplicate — merge entries with the same car name.
  // Average their zero-BoP times for the most accurate estimate.
  const deduped = new Map<string, {
    key: string;
    car: BopCarEntry;
    avgZeroBopTime: number;
    enteredTime: number;
    hadBop: boolean;
    count: number;
  }>();

  for (const entry of zeroBopTimes) {
    const key = entry.car.name.trim().toLowerCase();
    const existing = deduped.get(key);
    if (existing) {
      // Running average
      const newCount = existing.count + 1;
      existing.avgZeroBopTime =
        (existing.avgZeroBopTime * existing.count + entry.zeroBopTime) / newCount;
      existing.count = newCount;
      existing.hadBop = existing.hadBop || entry.hadBop;
      // Keep the first entry's car reference and entered time for display
    } else {
      deduped.set(key, {
        key,
        car: entry.car,
        avgZeroBopTime: entry.zeroBopTime,
        enteredTime: entry.enteredTime,
        hadBop: entry.hadBop,
        count: 1,
      });
    }
  }

  const uniqueCars = Array.from(deduped.values());
  if (uniqueCars.length < 2) return null;

  // Step 2: Find the slowest average ZERO-BOP time — that's our baseline
  let baselineIdx = 0;
  let maxZeroBopTime = 0;
  for (let i = 0; i < uniqueCars.length; i++) {
    if (uniqueCars[i].avgZeroBopTime > maxZeroBopTime) {
      maxZeroBopTime = uniqueCars[i].avgZeroBopTime;
      baselineIdx = i;
    }
  }

  const baselineEntry = uniqueCars[baselineIdx];
  const baselineTime = maxZeroBopTime;

  // Step 3: Calculate new BoP for each unique car based on zero-BoP deltas
  const results: BopResult[] = uniqueCars.map(({ car, enteredTime, avgZeroBopTime, hadBop }) => {
    const delta = baselineTime - avgZeroBopTime;

    if (delta <= 0.001) {
      // This is the baseline car (or tied)
      return {
        carId: car.id,
        carName: car.name,
        lapTimeSeconds: enteredTime,
        estimatedZeroBopTime: avgZeroBopTime,
        hadExistingBop: hadBop,
        delta: 0,
        ballastKg: 0,
        restrictorPct: 0,
        isBaseline: car.id === baselineEntry.car.id,
        warning: null,
      };
    }

    // Calculate pure ballast needed
    const pureBallastKg = Math.round((delta / settings.secondsPer10kg) * 10);

    let ballastKg: number;
    let restrictorPct: number;
    let warning: string | null = null;

    if (pureBallastKg <= settings.maxBallastKg) {
      // Ballast only
      ballastKg = pureBallastKg;
      restrictorPct = 0;
    } else {
      // Use max ballast, then convert the rest to restrictor
      ballastKg = settings.maxBallastKg;
      const timeHandledByBallast = (ballastKg / 10) * settings.secondsPer10kg;
      const remainingDelta = delta - timeHandledByBallast;
      restrictorPct = Math.max(0, Math.round(remainingDelta / settings.secondsPer1Restrictor));
      warning = `High ballast needed (${pureBallastKg}kg). Split into ${ballastKg}kg + ${restrictorPct}% restrictor.`;
    }

    return {
      carId: car.id,
      carName: car.name,
      lapTimeSeconds: enteredTime,
      estimatedZeroBopTime: avgZeroBopTime,
      hadExistingBop: hadBop,
      delta,
      ballastKg,
      restrictorPct,
      isBaseline: false,
      warning,
    };
  });

  // Sort: baseline first, then by delta descending
  results.sort((a, b) => {
    if (a.isBaseline) return -1;
    if (b.isBaseline) return 1;
    return b.delta - a.delta;
  });

  return {
    baselineCarName: baselineEntry.car.name,
    baselineLapTime: baselineTime,
    results,
  };
}
