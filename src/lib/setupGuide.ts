// ── Setup Guide — Data & Logic ─────────────────────────────────────
// Maps handling problems + corner phases → recommended setup changes.

// ── Types ──────────────────────────────────────────────────────────

export type ProblemId =
  | 'understeer'
  | 'oversteer'
  | 'low-traction'
  | 'high-speed-instability'
  | 'poor-turn-in'
  | 'braking-instability'
  | 'bouncing'
  | 'excessive-body-roll'
  | 'tyre-wear';

export type PhaseId = 'entry' | 'mid' | 'exit';

export type Direction = 'increase' | 'decrease' | 'adjust';
export type End = 'front' | 'rear' | 'overall' | 'both';
export type Impact = 'high' | 'medium' | 'low';

export interface Problem {
  id: ProblemId;
  label: string;
  icon: string;
  description: string;
  color: string; // CSS accent color
}

export interface Phase {
  id: PhaseId;
  label: string;
  description: string;
}

export interface SetupParameter {
  id: string;
  name: string;
  category: string;
  description: string;
  whatItDoes: string;
}

export interface Recommendation {
  parameterId: string;
  direction: Direction;
  end: End;
  impact: Impact;
  explanation: string;
}

export interface RecommendationSet {
  problemId: ProblemId;
  phaseId: PhaseId;
  recommendations: Recommendation[];
}

export interface RakeGuideTip {
  title: string;
  content: string;
}

export interface RakeCarClass {
  name: string;
  icon: string;
  typicalRake: string;
  frontRange: string;
  rearRange: string;
  notes: string;
}

export interface RakeGuide {
  overview: string;
  whatIsRake: string;
  whyRakeMatters: string[];
  carClasses: RakeCarClass[];
  tuningSteps: string[];
  tips: RakeGuideTip[];
}

// ── Problems ───────────────────────────────────────────────────────

export const PROBLEMS: Problem[] = [
  {
    id: 'understeer',
    label: 'Understeer',
    icon: '↗️',
    description: 'Front pushes wide — the car doesn\'t turn enough for your steering input.',
    color: '#ff6b35',
  },
  {
    id: 'oversteer',
    label: 'Oversteer',
    icon: '↩️',
    description: 'Rear steps out — the car rotates too much and threatens to spin.',
    color: '#ff4d6d',
  },
  {
    id: 'poor-turn-in',
    label: 'Poor Turn-in',
    icon: '🔄',
    description: 'Car feels sluggish and unresponsive when you initiate the turn.',
    color: '#f59e0b',
  },
  {
    id: 'low-traction',
    label: 'Low Traction',
    icon: '💨',
    description: 'Wheelspin on corner exit or poor acceleration grip.',
    color: '#8b5cf6',
  },
  {
    id: 'braking-instability',
    label: 'Braking Instability',
    icon: '🔒',
    description: 'Car is unstable, locks up, or pulls to one side under heavy braking.',
    color: '#ef4444',
  },
  {
    id: 'high-speed-instability',
    label: 'High-Speed Instability',
    icon: '⚡',
    description: 'Car feels nervous, twitchy, or floaty at high speeds.',
    color: '#06b6d4',
  },
  {
    id: 'bouncing',
    label: 'Bouncing / Porpoising',
    icon: '〰️',
    description: 'Car bounces on straights or oscillates over bumps and kerbs.',
    color: '#10b981',
  },
  {
    id: 'excessive-body-roll',
    label: 'Excessive Body Roll',
    icon: '🔃',
    description: 'Too much lean in corners — the car feels "floppy" through direction changes.',
    color: '#3b82f6',
  },
  {
    id: 'tyre-wear',
    label: 'Excessive Tyre Wear',
    icon: '🛞',
    description: 'Tyres degrade too quickly or overheat during a stint.',
    color: '#a855f7',
  },
];

// ── Corner Phases ──────────────────────────────────────────────────

export const PHASES: Phase[] = [
  {
    id: 'entry',
    label: 'Corner Entry',
    description: 'Braking zone → turn-in point. Weight transfers to the front.',
  },
  {
    id: 'mid',
    label: 'Mid-Corner',
    description: 'Apex zone. Weight is balanced laterally at peak cornering load.',
  },
  {
    id: 'exit',
    label: 'Corner Exit',
    description: 'Apex → straight. Weight transfers to the rear under acceleration.',
  },
];

// ── Setup Parameters ───────────────────────────────────────────────

export const PARAMETERS: SetupParameter[] = [
  {
    id: 'front-springs',
    name: 'Front Springs',
    category: 'Suspension',
    description: 'Spring stiffness of the front axle.',
    whatItDoes:
      'Controls how quickly weight transfers to the front under braking and how much the front compresses in corners. Softer = more grip but slower response. Stiffer = quicker response but can overwhelm the tyres.',
  },
  {
    id: 'rear-springs',
    name: 'Rear Springs',
    category: 'Suspension',
    description: 'Spring stiffness of the rear axle.',
    whatItDoes:
      'Controls rear weight transfer under acceleration and cornering. Softer = more rear grip. Stiffer = more responsive rear end but may step out easier.',
  },
  {
    id: 'front-arb',
    name: 'Front Anti-Roll Bar',
    category: 'Suspension',
    description: 'Stiffness of the front anti-roll bar (sway bar).',
    whatItDoes:
      'Limits body roll by connecting left and right wheels. Stiffer front ARB transfers more load to the outside front tyre in corners, reducing front grip and promoting understeer.',
  },
  {
    id: 'rear-arb',
    name: 'Rear Anti-Roll Bar',
    category: 'Suspension',
    description: 'Stiffness of the rear anti-roll bar (sway bar).',
    whatItDoes:
      'Stiffer rear ARB transfers more load to the outside rear tyre, reducing rear grip and promoting oversteer. Softening it increases rear grip.',
  },
  {
    id: 'front-dampers',
    name: 'Front Dampers',
    category: 'Suspension',
    description: 'Bump and rebound damping of front shock absorbers.',
    whatItDoes:
      'Controls the speed of weight transfer at the front. Stiffer bump = slower compression under braking. Stiffer rebound = slower recovery after bumps. Affects how progressively the front loads up.',
  },
  {
    id: 'rear-dampers',
    name: 'Rear Dampers',
    category: 'Suspension',
    description: 'Bump and rebound damping of rear shock absorbers.',
    whatItDoes:
      'Controls rear weight transfer rate. Stiffer bump = less rear squat under acceleration. Stiffer rebound = slower rear recovery, can help maintain traction.',
  },
  {
    id: 'front-camber',
    name: 'Front Camber',
    category: 'Alignment',
    description: 'Angle of front wheels relative to vertical (negative = top tilts inward).',
    whatItDoes:
      'More negative camber increases the tyre contact patch in corners, improving cornering grip. Too much reduces straight-line grip and increases inner-edge wear.',
  },
  {
    id: 'rear-camber',
    name: 'Rear Camber',
    category: 'Alignment',
    description: 'Angle of rear wheels relative to vertical.',
    whatItDoes:
      'More negative rear camber improves rear cornering grip. Too much causes instability under braking and excessive inner wear.',
  },
  {
    id: 'front-toe',
    name: 'Front Toe',
    category: 'Alignment',
    description: 'Whether front tyres point inward (toe-in) or outward (toe-out).',
    whatItDoes:
      'Toe-out improves turn-in response and reduces understeer. Toe-in improves straight-line stability but dulls steering response. Large values increase tyre wear.',
  },
  {
    id: 'rear-toe',
    name: 'Rear Toe',
    category: 'Alignment',
    description: 'Whether rear tyres point inward (toe-in) or outward (toe-out).',
    whatItDoes:
      'Rear toe-in improves stability and reduces oversteer on entry. Too much causes understeer and high rear tyre wear. Rear toe-out is rarely used.',
  },
  {
    id: 'ride-height',
    name: 'Ride Height & Rake',
    category: 'Suspension',
    description: 'Ground clearance at front and rear. Rake = rear ride height minus front ride height.',
    whatItDoes:
      'Lower ride height lowers the CG and improves aero efficiency. Rake (rear higher than front) increases front downforce by tilting the underbody, creating more diffuser expansion angle. Typical GT cars run 20–30mm of rake; formula cars 15–25mm. More rake = more front grip & rotation, but can reduce rear stability. Less rake = more stable rear, better traction exits. Finding the right rake is one of the highest-impact changes you can make.',
  },
  {
    id: 'aero',
    name: 'Aero / Wing Level',
    category: 'Aerodynamics',
    description: 'Front splitter + rear wing angles.',
    whatItDoes:
      'More rear wing = more rear downforce = more rear grip in fast corners but more drag on straights. Adjusting the balance (front splitter vs rear wing) shifts aero grip between axles.',
  },
  {
    id: 'diff-coast',
    name: 'Diff Coast (Decel)',
    category: 'Differential',
    description: 'Differential locking percentage when off-throttle.',
    whatItDoes:
      'Higher coast lock ties the driven wheels together during braking/coasting — stabilising the rear but reducing rotation. Lower coast lock allows more rotation on entry.',
  },
  {
    id: 'diff-power',
    name: 'Diff Power (Accel)',
    category: 'Differential',
    description: 'Differential locking percentage under throttle.',
    whatItDoes:
      'Higher power lock ties driven wheels under acceleration — can cause snap oversteer if the inside tyre loses grip. Lower power lock improves traction but reduces straight-line drive.',
  },
  {
    id: 'brake-bias',
    name: 'Brake Bias',
    category: 'Brakes',
    description: 'Distribution of braking force between front and rear axles.',
    whatItDoes:
      'More front bias = front locks first (safer but can cause understeer into corners). More rear bias = rear locks first (more rotation but can cause spins). Typically 55–62% front.',
  },
  {
    id: 'tyre-pressures',
    name: 'Tyre Pressures',
    category: 'Tyres',
    description: 'Cold starting pressures for front and rear tyres.',
    whatItDoes:
      'Higher pressure = smaller contact patch, less grip, more responsive. Lower pressure = larger contact patch, more grip, but can overheat. Balance affects front/rear grip split.',
  },
];

// ── Recommendations Matrix ─────────────────────────────────────────

export const RECOMMENDATIONS: RecommendationSet[] = [
  // ═══════════════════════════════════════════════════════════════════
  // UNDERSTEER
  // ═══════════════════════════════════════════════════════════════════
  {
    problemId: 'understeer',
    phaseId: 'entry',
    recommendations: [
      {
        parameterId: 'brake-bias',
        direction: 'decrease',
        end: 'front',
        impact: 'high',
        explanation:
          'Shift brake bias rearward to reduce front locking and allow the front tyres to focus on turning.',
      },
      {
        parameterId: 'front-arb',
        direction: 'decrease',
        end: 'front',
        impact: 'high',
        explanation:
          'Softer front ARB reduces lateral load transfer at the front → more front grip on turn-in.',
      },
      {
        parameterId: 'rear-arb',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Stiffer rear ARB unloads the rear slightly, freeing the car to rotate more on entry.',
      },
      {
        parameterId: 'diff-coast',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Lower coast lock lets the inside drive wheel spin freely while trail-braking, encouraging rotation.',
      },
      {
        parameterId: 'front-dampers',
        direction: 'decrease',
        end: 'front',
        impact: 'medium',
        explanation:
          'Softer front bump damping lets weight transfer to the front faster under braking → more front grip.',
      },
      {
        parameterId: 'front-springs',
        direction: 'decrease',
        end: 'front',
        impact: 'medium',
        explanation:
          'Softer front springs allow more front compression → larger front contact patch under braking.',
      },
      {
        parameterId: 'ride-height',
        direction: 'decrease',
        end: 'front',
        impact: 'low',
        explanation:
          'Lowering front ride height (more rake) shifts aero balance forward.',
      },
    ],
  },
  {
    problemId: 'understeer',
    phaseId: 'mid',
    recommendations: [
      {
        parameterId: 'front-arb',
        direction: 'decrease',
        end: 'front',
        impact: 'high',
        explanation:
          'Softer front ARB keeps more grip on the inside front tyre, increasing total front grip at peak lateral load.',
      },
      {
        parameterId: 'rear-arb',
        direction: 'increase',
        end: 'rear',
        impact: 'high',
        explanation:
          'Stiffer rear ARB promotes rotation by reducing inside-rear grip.',
      },
      {
        parameterId: 'front-camber',
        direction: 'increase',
        end: 'front',
        impact: 'high',
        explanation:
          'More negative front camber maximizes the contact patch at high slip angles → more front cornering grip.',
      },
      {
        parameterId: 'aero',
        direction: 'increase',
        end: 'front',
        impact: 'medium',
        explanation:
          'More front aero (or less rear wing) shifts the downforce balance forward, adding front grip in fast corners.',
      },
      {
        parameterId: 'front-springs',
        direction: 'decrease',
        end: 'front',
        impact: 'medium',
        explanation:
          'Softer front springs allow more mechanical grip but may slow transitions.',
      },
      {
        parameterId: 'tyre-pressures',
        direction: 'decrease',
        end: 'front',
        impact: 'low',
        explanation:
          'Slightly lower front pressures widen the contact patch for more grip, but watch for overheating.',
      },
    ],
  },
  {
    problemId: 'understeer',
    phaseId: 'exit',
    recommendations: [
      {
        parameterId: 'diff-power',
        direction: 'decrease',
        end: 'rear',
        impact: 'high',
        explanation:
          'Lower power lock reduces the push effect from the differential tying both rear wheels together.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Stiffer rear springs reduce rear squat under acceleration, shifting balance slightly forward.',
      },
      {
        parameterId: 'rear-arb',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Stiffer rear ARB reduces rear grip on exit, encouraging the car to rotate rather than push.',
      },
      {
        parameterId: 'rear-dampers',
        direction: 'increase',
        end: 'rear',
        impact: 'low',
        explanation:
          'Stiffer rear rebound damping slows rear extension under power, reducing rear grip Transfer.',
      },
      {
        parameterId: 'tyre-pressures',
        direction: 'decrease',
        end: 'front',
        impact: 'low',
        explanation:
          'Lower front pressures help front tyres maintain grip as weight shifts rearward.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // OVERSTEER
  // ═══════════════════════════════════════════════════════════════════
  {
    problemId: 'oversteer',
    phaseId: 'entry',
    recommendations: [
      {
        parameterId: 'brake-bias',
        direction: 'increase',
        end: 'front',
        impact: 'high',
        explanation:
          'More front bias prevents rear wheels from locking under braking, stabilising the rear.',
      },
      {
        parameterId: 'rear-arb',
        direction: 'decrease',
        end: 'rear',
        impact: 'high',
        explanation:
          'Softer rear ARB reduces rear load transfer, giving the rear tyres more grip.',
      },
      {
        parameterId: 'diff-coast',
        direction: 'increase',
        end: 'rear',
        impact: 'high',
        explanation:
          'Higher coast lock ties the rear wheels together, stabilising the rear on deceleration.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear springs keep more rear grip by allowing the rear to settle under braking.',
      },
      {
        parameterId: 'rear-toe',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'More rear toe-in increases rear stability by making the rear tyres "point inward", resisting yaw.',
      },
      {
        parameterId: 'rear-dampers',
        direction: 'decrease',
        end: 'rear',
        impact: 'low',
        explanation:
          'Softer rear rebound lets the rear settle faster during weight transfer, maintaining contact.',
      },
    ],
  },
  {
    problemId: 'oversteer',
    phaseId: 'mid',
    recommendations: [
      {
        parameterId: 'rear-arb',
        direction: 'decrease',
        end: 'rear',
        impact: 'high',
        explanation:
          'Softer rear ARB keeps more grip on the inside rear tyre → more total rear grip at apex.',
      },
      {
        parameterId: 'front-arb',
        direction: 'increase',
        end: 'front',
        impact: 'medium',
        explanation:
          'Stiffer front ARB shift the balance toward understeer by reducing front grip relative to the rear.',
      },
      {
        parameterId: 'rear-camber',
        direction: 'increase',
        end: 'rear',
        impact: 'high',
        explanation:
          'More negative rear camber improves rear tyre contact patch at high slip angles.',
      },
      {
        parameterId: 'aero',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'More rear wing pushes the rear tyres into the road harder in fast corners.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear springs increase mechanical rear grip in sustained cornering.',
      },
      {
        parameterId: 'tyre-pressures',
        direction: 'decrease',
        end: 'rear',
        impact: 'low',
        explanation:
          'Slightly lower rear pressures increase the rear contact patch.',
      },
    ],
  },
  {
    problemId: 'oversteer',
    phaseId: 'exit',
    recommendations: [
      {
        parameterId: 'diff-power',
        direction: 'decrease',
        end: 'rear',
        impact: 'high',
        explanation:
          'Lower power lock prevents the diff from binding and snapping the car when the inside tyre loses grip.',
      },
      {
        parameterId: 'rear-arb',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear ARB gives the rear more grip on exit.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear springs allow more rear squat under power, pressing the rear tyres down.',
      },
      {
        parameterId: 'rear-dampers',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear bump damping lets the rear compress faster under acceleration → more traction.',
      },
      {
        parameterId: 'tyre-pressures',
        direction: 'decrease',
        end: 'rear',
        impact: 'low',
        explanation:
          'Lower rear pressures widen the contact patch for better exit traction.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // POOR TURN-IN
  // ═══════════════════════════════════════════════════════════════════
  {
    problemId: 'poor-turn-in',
    phaseId: 'entry',
    recommendations: [
      {
        parameterId: 'front-toe',
        direction: 'adjust',
        end: 'front',
        impact: 'high',
        explanation:
          'Add a small amount of front toe-out to sharpen initial steering response.',
      },
      {
        parameterId: 'front-arb',
        direction: 'decrease',
        end: 'front',
        impact: 'high',
        explanation:
          'Softer front ARB lets the front load up more evenly, improving front bite on turn-in.',
      },
      {
        parameterId: 'front-dampers',
        direction: 'decrease',
        end: 'front',
        impact: 'medium',
        explanation:
          'Softer front bump allows faster weight transfer to the front → quicker front response.',
      },
      {
        parameterId: 'front-camber',
        direction: 'increase',
        end: 'front',
        impact: 'medium',
        explanation:
          'More negative front camber means the tyre generates grip faster at the initial steering angle.',
      },
      {
        parameterId: 'diff-coast',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Lower coast lock frees the inside rear wheel, allowing the car to pivot more easily.',
      },
      {
        parameterId: 'ride-height',
        direction: 'decrease',
        end: 'front',
        impact: 'low',
        explanation:
          'Lower front ride height shifts aero balance forward and lowers CG.',
      },
    ],
  },
  {
    problemId: 'poor-turn-in',
    phaseId: 'mid',
    recommendations: [
      {
        parameterId: 'front-arb',
        direction: 'decrease',
        end: 'front',
        impact: 'high',
        explanation:
          'Softer front ARB maximises front grip through the mid-corner.',
      },
      {
        parameterId: 'front-camber',
        direction: 'increase',
        end: 'front',
        impact: 'high',
        explanation:
          'More front camber improves the tyre\'s grip at sustained high slip angles.',
      },
      {
        parameterId: 'aero',
        direction: 'increase',
        end: 'front',
        impact: 'medium',
        explanation:
          'More front downforce means more front grip at speed.',
      },
      {
        parameterId: 'tyre-pressures',
        direction: 'decrease',
        end: 'front',
        impact: 'low',
        explanation:
          'Slightly lower front pressures widen the contact patch.',
      },
    ],
  },
  {
    problemId: 'poor-turn-in',
    phaseId: 'exit',
    recommendations: [
      {
        parameterId: 'diff-power',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Lower power lock lets the car continue to rotate on throttle application.',
      },
      {
        parameterId: 'rear-arb',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Stiffer rear ARB promotes rotation as you unwind the steering.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'increase',
        end: 'rear',
        impact: 'low',
        explanation:
          'Stiffer rear springs reduce rear squat, keeping the car\'s balance more neutral.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // LOW TRACTION
  // ═══════════════════════════════════════════════════════════════════
  {
    problemId: 'low-traction',
    phaseId: 'entry',
    recommendations: [
      {
        parameterId: 'brake-bias',
        direction: 'increase',
        end: 'front',
        impact: 'high',
        explanation:
          'More front bias prevents rear lockups that disrupt traction through the braking zone.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear springs keep the rear planted during weight transfer.',
      },
      {
        parameterId: 'rear-dampers',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear damping helps tyres maintain contact over bumps/kerbs.',
      },
    ],
  },
  {
    problemId: 'low-traction',
    phaseId: 'mid',
    recommendations: [
      {
        parameterId: 'rear-arb',
        direction: 'decrease',
        end: 'rear',
        impact: 'high',
        explanation:
          'Softer rear ARB preserves inside-rear grip, reducing total lateral grip loss.',
      },
      {
        parameterId: 'rear-camber',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'More negative rear camber optimises the contact patch under cornering loads.',
      },
      {
        parameterId: 'aero',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'More rear downforce pushes the rear tyres into the road at speed.',
      },
      {
        parameterId: 'tyre-pressures',
        direction: 'decrease',
        end: 'rear',
        impact: 'low',
        explanation:
          'Lower rear pressures increase the contact patch for more grip.',
      },
    ],
  },
  {
    problemId: 'low-traction',
    phaseId: 'exit',
    recommendations: [
      {
        parameterId: 'diff-power',
        direction: 'decrease',
        end: 'rear',
        impact: 'high',
        explanation:
          'Lower power lock prevents torque from overwhelming the inside rear tyre.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'decrease',
        end: 'rear',
        impact: 'high',
        explanation:
          'Softer rear springs allow rear squat under power, pressing drives into the road surface.',
      },
      {
        parameterId: 'rear-dampers',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear bump lets the suspension absorb bumps while maintaining contact.',
      },
      {
        parameterId: 'rear-arb',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear ARB gives the inside rear tyre more grip during exit.',
      },
      {
        parameterId: 'tyre-pressures',
        direction: 'decrease',
        end: 'rear',
        impact: 'low',
        explanation:
          'Lower rear pressures improve traction by widening the contact patch.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BRAKING INSTABILITY
  // ═══════════════════════════════════════════════════════════════════
  {
    problemId: 'braking-instability',
    phaseId: 'entry',
    recommendations: [
      {
        parameterId: 'brake-bias',
        direction: 'increase',
        end: 'front',
        impact: 'high',
        explanation:
          'More front bias prevents the rear from locking first, which is the primary cause of braking instability.',
      },
      {
        parameterId: 'diff-coast',
        direction: 'increase',
        end: 'rear',
        impact: 'high',
        explanation:
          'Higher coast lock ties both rear wheels together under engine braking, preventing one from locking before the other.',
      },
      {
        parameterId: 'rear-toe',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'More rear toe-in self-centres the rear axle, adding stability under braking.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear springs stop the rear from unloading too quickly as weight shifts forward.',
      },
      {
        parameterId: 'rear-dampers',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Stiffer rear rebound slows the rear extension during braking, keeping weight on the rear longer.',
      },
      {
        parameterId: 'front-dampers',
        direction: 'increase',
        end: 'front',
        impact: 'low',
        explanation:
          'Stiffer front bump slows weight transfer forward, making the deceleration feel more gradual.',
      },
    ],
  },
  {
    problemId: 'braking-instability',
    phaseId: 'mid',
    recommendations: [
      {
        parameterId: 'brake-bias',
        direction: 'increase',
        end: 'front',
        impact: 'high',
        explanation:
          'If you\'re still trail-braking at the apex, more front bias keeps the rear planted.',
      },
      {
        parameterId: 'rear-arb',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear ARB prevents the rear from stepping out mid-corner while on the brakes.',
      },
      {
        parameterId: 'rear-camber',
        direction: 'increase',
        end: 'rear',
        impact: 'low',
        explanation:
          'More negative rear camber adds rear grip during combined braking and cornering.',
      },
    ],
  },
  {
    problemId: 'braking-instability',
    phaseId: 'exit',
    recommendations: [
      {
        parameterId: 'diff-power',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Lower power lock prevents the rear from snapping when transitioning from trail-brake to throttle.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'decrease',
        end: 'rear',
        impact: 'low',
        explanation:
          'Softer rear springs help maintain traction during the brake-to-throttle transition.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // HIGH-SPEED INSTABILITY
  // ═══════════════════════════════════════════════════════════════════
  {
    problemId: 'high-speed-instability',
    phaseId: 'entry',
    recommendations: [
      {
        parameterId: 'aero',
        direction: 'increase',
        end: 'rear',
        impact: 'high',
        explanation:
          'More rear downforce stabilises the car at high speeds by planting the rear.',
      },
      {
        parameterId: 'rear-toe',
        direction: 'increase',
        end: 'rear',
        impact: 'high',
        explanation:
          'Rear toe-in dramatically improves high-speed straight-line and braking stability.',
      },
      {
        parameterId: 'rear-arb',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear ARB adds rear grip at speed.',
      },
      {
        parameterId: 'ride-height',
        direction: 'increase',
        end: 'rear',
        impact: 'low',
        explanation:
          'Slightly more rear ride height can prevent aero stall from bottoming out.',
      },
    ],
  },
  {
    problemId: 'high-speed-instability',
    phaseId: 'mid',
    recommendations: [
      {
        parameterId: 'aero',
        direction: 'increase',
        end: 'overall',
        impact: 'high',
        explanation:
          'More overall downforce increases grip at high speed — trade top speed for stability.',
      },
      {
        parameterId: 'rear-arb',
        direction: 'decrease',
        end: 'rear',
        impact: 'high',
        explanation:
          'Softer rear ARB keeps the rear planted in high-speed sweepers.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear springs absorb track undulations that unsettle the car at speed.',
      },
      {
        parameterId: 'rear-dampers',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Softer rear dampers let the suspension conform to surface changes at high speed.',
      },
    ],
  },
  {
    problemId: 'high-speed-instability',
    phaseId: 'exit',
    recommendations: [
      {
        parameterId: 'aero',
        direction: 'increase',
        end: 'rear',
        impact: 'high',
        explanation:
          'More rear wing keeps the car stable as you accelerate from fast corners.',
      },
      {
        parameterId: 'diff-power',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Lower power lock prevents rear wheels from fighting each other at high speed.',
      },
      {
        parameterId: 'rear-toe',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'More rear toe-in self-centres the rear during high-speed acceleration.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BOUNCING / PORPOISING
  // ═══════════════════════════════════════════════════════════════════
  {
    problemId: 'bouncing',
    phaseId: 'entry',
    recommendations: [
      {
        parameterId: 'front-dampers',
        direction: 'increase',
        end: 'front',
        impact: 'high',
        explanation:
          'Stiffer front bump damping prevents the front from diving and bouncing back under braking.',
      },
      {
        parameterId: 'front-springs',
        direction: 'increase',
        end: 'front',
        impact: 'medium',
        explanation:
          'Stiffer front springs reduce dive magnitude, preventing bottoming out.',
      },
      {
        parameterId: 'ride-height',
        direction: 'increase',
        end: 'front',
        impact: 'medium',
        explanation:
          'Higher front ride height gives more bump stop clearance so the car doesn\'t bottom out under braking.',
      },
      {
        parameterId: 'rear-dampers',
        direction: 'increase',
        end: 'rear',
        impact: 'low',
        explanation:
          'Stiffer rear rebound prevents the rear from rising too fast as weight shifts forward.',
      },
    ],
  },
  {
    problemId: 'bouncing',
    phaseId: 'mid',
    recommendations: [
      {
        parameterId: 'front-dampers',
        direction: 'increase',
        end: 'overall',
        impact: 'high',
        explanation:
          'More damping on both axles controls oscillation through sustained cornering.',
      },
      {
        parameterId: 'front-springs',
        direction: 'increase',
        end: 'overall',
        impact: 'medium',
        explanation:
          'Stiffer springs reduce travel, preventing the suspension from hitting bump stops repeatedly.',
      },
      {
        parameterId: 'ride-height',
        direction: 'increase',
        end: 'overall',
        impact: 'medium',
        explanation:
          'More ground clearance prevents bottoming out that causes bouncing in corners.',
      },
    ],
  },
  {
    problemId: 'bouncing',
    phaseId: 'exit',
    recommendations: [
      {
        parameterId: 'rear-dampers',
        direction: 'increase',
        end: 'rear',
        impact: 'high',
        explanation:
          'Stiffer rear bump damping prevents the rear from squatting and bouncing under acceleration.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Stiffer rear springs control rear squat under power.',
      },
      {
        parameterId: 'ride-height',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Higher rear ride height prevents the diffuser or floor from stalling during squat.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // EXCESSIVE BODY ROLL
  // ═══════════════════════════════════════════════════════════════════
  {
    problemId: 'excessive-body-roll',
    phaseId: 'entry',
    recommendations: [
      {
        parameterId: 'front-arb',
        direction: 'increase',
        end: 'front',
        impact: 'high',
        explanation:
          'Stiffer front ARB is the most direct control for reducing body roll on turn-in.',
      },
      {
        parameterId: 'front-springs',
        direction: 'increase',
        end: 'front',
        impact: 'medium',
        explanation:
          'Stiffer front springs resist body roll but affect ride quality.',
      },
      {
        parameterId: 'front-dampers',
        direction: 'increase',
        end: 'front',
        impact: 'medium',
        explanation:
          'Stiffer front bump damping slows the rate of roll on initial turn-in.',
      },
      {
        parameterId: 'ride-height',
        direction: 'decrease',
        end: 'overall',
        impact: 'low',
        explanation:
          'A lower CG reduces roll moment, meaning less force trying to roll the car.',
      },
    ],
  },
  {
    problemId: 'excessive-body-roll',
    phaseId: 'mid',
    recommendations: [
      {
        parameterId: 'front-arb',
        direction: 'increase',
        end: 'both',
        impact: 'high',
        explanation:
          'Stiffer ARBs on both axles are the primary tool for controlling sustained body roll.',
      },
      {
        parameterId: 'front-springs',
        direction: 'increase',
        end: 'both',
        impact: 'medium',
        explanation:
          'Stiffer springs on both axles reduce total body roll but reduce grip.',
      },
      {
        parameterId: 'ride-height',
        direction: 'decrease',
        end: 'overall',
        impact: 'low',
        explanation:
          'Lower CG directly reduces the roll moment arm.',
      },
    ],
  },
  {
    problemId: 'excessive-body-roll',
    phaseId: 'exit',
    recommendations: [
      {
        parameterId: 'rear-arb',
        direction: 'increase',
        end: 'rear',
        impact: 'high',
        explanation:
          'Stiffer rear ARB reduces body roll as you unwind steering on exit.',
      },
      {
        parameterId: 'rear-springs',
        direction: 'increase',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Stiffer rear springs control rear roll and squat under acceleration.',
      },
      {
        parameterId: 'rear-dampers',
        direction: 'increase',
        end: 'rear',
        impact: 'low',
        explanation:
          'Stiffer rear rebound controls how quickly the car unwinds roll on exit.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // EXCESSIVE TYRE WEAR
  // ═══════════════════════════════════════════════════════════════════
  {
    problemId: 'tyre-wear',
    phaseId: 'entry',
    recommendations: [
      {
        parameterId: 'front-camber',
        direction: 'adjust',
        end: 'front',
        impact: 'high',
        explanation:
          'Check tyre temps across the tread — even temperatures = correct camber. Hot inside edge = too much negative camber.',
      },
      {
        parameterId: 'front-toe',
        direction: 'decrease',
        end: 'front',
        impact: 'medium',
        explanation:
          'Excessive toe (in or out) scrubs the tyres constantly. Minimise toe while keeping acceptable turn-in response.',
      },
      {
        parameterId: 'brake-bias',
        direction: 'adjust',
        end: 'front',
        impact: 'medium',
        explanation:
          'If front tyres wear excessively, shift bias rearward so fronts do less work. Vice versa for rears.',
      },
      {
        parameterId: 'tyre-pressures',
        direction: 'adjust',
        end: 'overall',
        impact: 'high',
        explanation:
          'Hot centre = pressures too high, hot edges = pressures too low. Target optimal operating window.',
      },
    ],
  },
  {
    problemId: 'tyre-wear',
    phaseId: 'mid',
    recommendations: [
      {
        parameterId: 'front-camber',
        direction: 'adjust',
        end: 'overall',
        impact: 'high',
        explanation:
          'Camber is the #1 factor for mid-corner tyre wear. Aim for even temperatures across the tread at sustained cornering.',
      },
      {
        parameterId: 'front-springs',
        direction: 'decrease',
        end: 'overall',
        impact: 'medium',
        explanation:
          'Softer springs reduce peak loads on the outside tyres, spreading wear more evenly.',
      },
      {
        parameterId: 'front-arb',
        direction: 'decrease',
        end: 'overall',
        impact: 'medium',
        explanation:
          'Softer ARBs spread load across inside and outside tyres, reducing peak wear on the outside tyre.',
      },
      {
        parameterId: 'aero',
        direction: 'increase',
        end: 'overall',
        impact: 'low',
        explanation:
          'More downforce lets you corner at the same speed with less slip angle → less tyre scrub.',
      },
    ],
  },
  {
    problemId: 'tyre-wear',
    phaseId: 'exit',
    recommendations: [
      {
        parameterId: 'diff-power',
        direction: 'decrease',
        end: 'rear',
        impact: 'high',
        explanation:
          'Lower power lock reduces inside rear tyre scrub during exit, cutting rear wear significantly.',
      },
      {
        parameterId: 'rear-camber',
        direction: 'adjust',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Check rear tyre temps — correct rear camber reduces uneven exit wear.',
      },
      {
        parameterId: 'rear-toe',
        direction: 'decrease',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Excessive rear toe-in causes constant tyre scrub. Minimise while maintaining stability.',
      },
      {
        parameterId: 'tyre-pressures',
        direction: 'adjust',
        end: 'rear',
        impact: 'medium',
        explanation:
          'Ensure rear pressures are in the optimal window — check after a few laps of running.',
      },
    ],
  },
];

// ── Rake & Ride Height Guide ───────────────────────────────────────

export const RAKE_GUIDE: RakeGuide = {
  overview:
    'Rake is the difference between the rear and front ride heights. Positive rake (rear higher than front) is used on virtually all race cars to optimise aero balance and handling.',
  whatIsRake:
    'Rake = Rear Ride Height − Front Ride Height. For example, if the front is at 50mm and the rear is at 70mm, the rake is 20mm. This tilts the underbody so air accelerates underneath, generating more downforce through the diffuser.',
  whyRakeMatters: [
    'More rake increases front downforce relative to rear → helps the car turn in and reduces understeer at speed.',
    'More rake improves diffuser efficiency by increasing the expansion angle of the underbody exit.',
    'Too much rake lifts the rear higher, which can reduce rear grip and cause high-speed oversteer.',
    'Less rake stabilises the rear and improves traction on corner exit, but can make the car feel "pushy" (understeer).',
    'Rake affects tyre contact patch angle — excessive rake can cause uneven tyre loading.',
    'Ride height and rake are dynamic — they change based on speed (aero load), fuel load, braking, and bumps.',
  ],
  carClasses: [
    {
      name: 'GT3 / GTE',
      icon: '🏎️',
      typicalRake: '20–30mm',
      frontRange: '50–60mm',
      rearRange: '70–90mm',
      notes:
        'GT cars generate most of their downforce from the floor and diffuser. Run the front as low as possible without bottoming out, then set the rear 20–30mm higher. Start around 25mm rake and adjust based on balance — more for rotation, less for stability.',
    },
    {
      name: 'GT4 / Touring',
      icon: '🚗',
      typicalRake: '15–25mm',
      frontRange: '55–70mm',
      rearRange: '70–90mm',
      notes:
        'Less aero-dependent than GT3. Rake is still beneficial but the window is wider. Focus on not bottoming out over kerbs. These cars are more sensitive to mechanical balance changes (springs, ARBs) than aero rake.',
    },
    {
      name: 'Formula / Open-Wheel',
      icon: '🏁',
      typicalRake: '15–25mm',
      frontRange: '15–30mm',
      rearRange: '30–55mm',
      notes:
        'Highly aero-sensitive. The floor and diffuser do most of the work. Run the front as low as regulations allow, then set the rear for 15–25mm rake. Start at 20mm. Even 2–3mm changes in rake can noticeably shift the aero balance.',
    },
    {
      name: 'Road / Street Cars',
      icon: '🚙',
      typicalRake: '5–15mm',
      frontRange: '70–100mm',
      rearRange: '80–110mm',
      notes:
        'Minimal aero dependence. Rake mostly affects mechanical weight distribution and CG height. Keep it modest. The main goal is lowering the CG without bottoming out on bumps and kerbs.',
    },
  ],
  tuningSteps: [
    'Start with the default or a known-good ride height for your car.',
    'Lower the front ride height gradually (1–2mm at a time) until you notice bottoming out under braking or over kerbs, then raise it 1–2mm.',
    'Set the rear ride height so the rake is in the recommended range for your car class (see chart above).',
    'Drive a few laps and assess: if the car feels "pushy" (understeer) at speed, increase rake by raising the rear 2mm. If the rear feels nervous at speed, decrease rake by lowering the rear 2mm.',
    'Check tyre temperatures — if the fronts are running cooler than the rears, you may benefit from more rake to load the fronts. The reverse suggests less rake.',
    'Remember to account for fuel load — a full tank compresses the rear, reducing effective rake. Consider setting slightly more static rake for endurance races.',
    'If the car bounces or porpoises, the ride height is too low. Raise both ends slightly while maintaining the same rake angle.',
  ],
  tips: [
    {
      title: 'The "Lowest Possible" Rule',
      content:
        'Always aim for the lowest front ride height that doesn\'t cause bottoming out. This maximises ground effect and lowers the CG. Then adjust the rear to set your desired rake.',
    },
    {
      title: 'Rake vs. Wing Balance',
      content:
        'Rake and wing adjustments both shift aero balance. If you need more front grip at speed, try adding rake first — it\'s "free" downforce with less drag than adding front wing.',
    },
    {
      title: 'Track-Specific Adjustments',
      content:
        'Bumpy tracks (e.g. COTA, Sebring) need higher ride heights overall. Smooth tracks (e.g. Silverstone, Barcelona) allow you to run lower. Keep the same rake ratio but scale both ends up/down.',
    },
    {
      title: 'Dynamic vs. Static',
      content:
        'The static ride height you set in the garage changes on-track: -10 to -20mm under aero load at high speed, -5 to -15mm under braking (front), +5 to +10mm under acceleration (front). Design for the running ride height, not just the static one.',
    },
    {
      title: 'Telemetry Check',
      content:
        'If your sim has telemetry, check the ride height trace. You want the car to get close to the ground under aero load but never "floor" for extended periods — that causes aero stall and sudden grip loss.',
    },
    {
      title: 'Spring Rate Connection',
      content:
        'Softer springs = more ride height loss at speed. If you soften springs, you may need to raise static ride height to compensate. Always re-check rake after changing spring rates.',
    },
  ],
};

// ── Lookup Function ────────────────────────────────────────────────

export function getRecommendations(
  problemId: ProblemId,
  phaseId: PhaseId,
): Recommendation[] {
  const set = RECOMMENDATIONS.find(
    (r) => r.problemId === problemId && r.phaseId === phaseId,
  );
  if (!set) return [];

  // Sort by impact: high → medium → low
  const order: Record<Impact, number> = { high: 0, medium: 1, low: 2 };
  return [...set.recommendations].sort(
    (a, b) => order[a.impact] - order[b.impact],
  );
}

export function getParameterById(id: string): SetupParameter | undefined {
  return PARAMETERS.find((p) => p.id === id);
}
