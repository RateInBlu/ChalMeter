/**
 * ChalMeter India - Core TypeScript Definitions
 */

export type VehicleType = 'Car / SUV' | 'Hatchback' | 'Sedan' | 'Two-Wheeler / Bike' | 'Auto Rickshaw' | 'Commercial / Bus / Truck';

export type PlateType = 'White (Private)' | 'Yellow (Commercial)' | 'Green (Electric EV)' | 'Black (Self-Drive / Rental)';

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DrivingBehaviourTag {
  id: string;
  name: string;
  type: 'positive' | 'negative';
  icon: string;
  description: string;
}

export interface Review {
  id: string;
  vehicleId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userBadge?: string;
  rating: number; // 1 to 5
  tags: string[]; // tag IDs
  comment?: string;
  locationCity: string;
  locationState: string;
  roadType: 'City Street' | 'National Highway' | 'Expressway' | 'Narrow By-lane' | 'Traffic Intersection';
  timeOfDay: 'Morning Rush' | 'Daytime' | 'Evening Peak' | 'Late Night';
  isDashcamVerified: boolean;
  helpfulCount: number;
  reportCount: number;
  isFlagged: boolean;
  isDemo?: boolean; // DEMO AUDIT: Flag strictly separating sample records from actual community ratings
  createdAt: string; // ISO string
}

export interface Vehicle {
  id: string; // Plate normalized e.g. DL01AB1234
  registrationNumber: string; // formatted e.g. DL 01 AB 1234
  stateCode: string; // e.g. DL, MH, KA, HR
  make: string; // e.g. Tata, Mahindra, Maruti Suzuki
  model: string; // e.g. Nexon, Thar, Creta, Swift
  colour: string; // e.g. Pearl White, Deep Black
  vehicleType: VehicleType;
  plateType: PlateType;
  averageRating: number; // 1.0 - 5.0
  totalReviews: number;
  positiveReviewsCount: number;
  negativeReviewsCount: number;
  confidenceScore: ConfidenceLevel;
  topPositiveTags: { tagId: string; count: number }[];
  topNegativeTags: { tagId: string; count: number }[];
  lastReportedAt: string;
  createdAt: string;
  isDemo?: boolean; // DEMO AUDIT: Distinguishes sample catalog entries from community-indexed vehicles
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  badge: 'Civic Scout' | 'Road Guardian' | 'Highway Sentinel' | 'Master Inspector';
  karmaPoints: number;
  reviewsCount: number;
  joinedAt: string;
  isModerator?: boolean;
  isDemo?: boolean;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  userId: string;
  reason: 'Spam or Advertising' | 'Abusive / Personal Attack' | 'Wrong Vehicle / Mistaken Plate' | 'Fabricated / False Accusation';
  details?: string;
  createdAt: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

export interface OCRScanResult {
  registrationNumber: string;
  stateCode: string;
  stateName: string;
  make: string;
  model: string;
  colour: string;
  vehicleType: VehicleType;
  plateType: PlateType;
  confidence: number; // 0 to 100
  processingMethod: 'AI_VISION' | 'BROWSER_OCR_FALLBACK' | 'PRESET_SAMPLE';
  rawTextFound?: string;
  needsManualVerification: boolean; // True when characters are partially obscured or format is non-standard
  unconfirmedCharacters?: string;
  verificationReason?: string;
}

export type SupabaseConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface SupabaseHealthCheckResult {
  status: SupabaseConnectionStatus;
  latencyMs?: number;
  tablesFound?: {
    vehicles: boolean;
    reviews: boolean;
    user_profiles: boolean;
    review_reports: boolean;
  };
  authWorking?: boolean;
  message: string;
  errorDetail?: string;
  timestamp: string;
}

// Indian state codes mapping
export const INDIAN_STATE_CODES: Record<string, string> = {
  DL: 'Delhi',
  MH: 'Maharashtra',
  KA: 'Karnataka',
  HR: 'Haryana',
  UP: 'Uttar Pradesh',
  TN: 'Tamil Nadu',
  TS: 'Telangana',
  GJ: 'Gujarat',
  WB: 'West Bengal',
  KL: 'Kerala',
  RJ: 'Rajasthan',
  PB: 'Punjab',
  AP: 'Andhra Pradesh',
  MP: 'Madhya Pradesh',
  BR: 'Bihar',
  OR: 'Odisha',
  OD: 'Odisha',
  AS: 'Assam',
  CH: 'Chandigarh',
  GA: 'Goa',
  UK: 'Uttarakhand',
  UA: 'Uttarakhand',
  HP: 'Himachal Pradesh',
  JK: 'Jammu & Kashmir',
  JH: 'Jharkhand',
  CG: 'Chhattisgarh',
  BH: 'Bharat Series (All-India)',
};
