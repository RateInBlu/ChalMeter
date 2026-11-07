import { DrivingBehaviourTag } from '../types';

export const POSITIVE_BEHAVIOUR_TAGS: DrivingBehaviourTag[] = [
  {
    id: 'pos_courteous_driving',
    name: 'Courteous Driving',
    type: 'positive',
    icon: 'HeartHandshake',
    description: 'Patient, respectful driving manners; yielded politely and gave way in traffic.',
  },
  {
    id: 'pos_indicator_use',
    name: 'Proper Indicator Usage',
    type: 'positive',
    icon: 'ArrowRightLeft',
    description: 'Always signaled well in advance before turns, lane changes, or stops.',
  },
  {
    id: 'pos_lane_discipline',
    name: 'Lane Discipline',
    type: 'positive',
    icon: 'Columns',
    description: 'Kept to designated lane, overtakes strictly from the correct side.',
  },
  {
    id: 'pos_safe_distance',
    name: 'Safe Following Distance',
    type: 'positive',
    icon: 'ShieldCheck',
    description: 'Maintained ample stopping distance, never rode dangerously close to bumpers.',
  },
  {
    id: 'pos_giving_way',
    name: 'Giving Way',
    type: 'positive',
    icon: 'CornerDownRight',
    description: 'Yielded to pedestrians, allowed merging vehicles, and cleared emergency passage.',
  },
  {
    id: 'pos_safe_overtaking',
    name: 'Safe Overtaking',
    type: 'positive',
    icon: 'CheckCircle2',
    description: 'Carefully timed overtaking maneuvers with clear visibility and clean clearance.',
  },
  // Compatibility aliases
  {
    id: 'pos_courteous_lane',
    name: 'Courteous Lane Merging',
    type: 'positive',
    icon: 'GitMerge',
    description: 'Politely allowed cars to merge, signaled early and gave right of way.',
  },
  {
    id: 'pos_ambulance_way',
    name: 'Gave Emergency Passage',
    type: 'positive',
    icon: 'Siren',
    description: 'Promptly moved left to give unobstructed way to ambulance/fire crew.',
  },
  {
    id: 'pos_pedestrian_friendly',
    name: 'Pedestrian & Zebra Yielding',
    type: 'positive',
    icon: 'Footprints',
    description: 'Halted before zebra crossings, respected pedestrians crossing.',
  },
];

export const NEGATIVE_BEHAVIOUR_TAGS: DrivingBehaviourTag[] = [
  {
    id: 'neg_aggressive_driving',
    name: 'Aggressive Driving',
    type: 'negative',
    icon: 'ZapOff',
    description: 'Hostile speeding, abrupt acceleration, or intimidatory road intimidation.',
  },
  {
    id: 'neg_tailgating',
    name: 'Tailgating',
    type: 'negative',
    icon: 'AlertTriangle',
    description: 'Riding mere inches behind bumper, flashing high-beams aggressively.',
  },
  {
    id: 'neg_lane_cutting',
    name: 'Sudden Lane Cutting',
    type: 'negative',
    icon: 'Split',
    description: 'Abruptly swerving across lanes without signaling or checking blind spots.',
  },
  {
    id: 'neg_wrong_side',
    name: 'Wrong-Side Driving',
    type: 'negative',
    icon: 'Ban',
    description: 'Driving upstream against flow, one-way violations, or wrong-side flyover driving.',
  },
  {
    id: 'neg_unnecessary_honking',
    name: 'Unnecessary Honking',
    type: 'negative',
    icon: 'Volume2',
    description: 'Continuous nuisance honking at red lights, quiet zones, or traffic bottlenecks.',
  },
  {
    id: 'neg_dangerous_overtaking',
    name: 'Dangerous Overtaking',
    type: 'negative',
    icon: 'AlertOctagon',
    description: 'Blind-curve overtaking, cutting off oncoming vehicles, or undertaking on the left.',
  },
  // Compatibility aliases
  {
    id: 'neg_rash_driving',
    name: 'Rash & Reckless Driving',
    type: 'negative',
    icon: 'ZapOff',
    description: 'Aggressive zig-zag cutting between vehicles at high speed.',
  },
  {
    id: 'neg_no_indicator',
    name: 'Abrupt Turn Without Signal',
    type: 'negative',
    icon: 'CornerUpRight',
    description: 'Darted across 2 lanes without warning indicators.',
  },
  {
    id: 'neg_excessive_honking',
    name: 'Continuous & Irritating Honking',
    type: 'negative',
    icon: 'Volume2',
    description: 'Honking at red signals, hospital silent zones, or jams.',
  },
];

export const ALL_TAGS = [...POSITIVE_BEHAVIOUR_TAGS, ...NEGATIVE_BEHAVIOUR_TAGS];

export function getTagById(id: string): DrivingBehaviourTag | undefined {
  return ALL_TAGS.find((tag) => tag.id === id);
}
