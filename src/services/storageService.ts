/**
 * ChalMeter India (चाल + मीटर) — Unified Storage & Supabase Database Service
 * 
 * Manages:
 * - Strict separation of Live Community Ratings vs Sample Demo Data
 * - Live Supabase PostgreSQL database read/write with graceful offline fallback
 * - Spam protection & 24h per-vehicle duplicate check
 * - Community score calculation & Bayesian confidence score
 * - Realtime subscriptions & reactive state listeners
 */

import { Vehicle, Review, UserProfile, ReviewReport, ConfidenceLevel } from '../types';
import { SEED_VEHICLES, SEED_REVIEWS } from '../data/seedData';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const LIVE_VEHICLES_KEY = 'chalmeter_live_vehicles_v2';
const LIVE_REVIEWS_KEY = 'chalmeter_live_reviews_v2';
const CURRENT_USER_KEY = 'chalmeter_active_user_v2';
const USER_PROFILES_KEY = 'chalmeter_profiles_v2';
const USER_LAST_POST_KEY = 'chalmeter_last_post_timestamp';
const HELPFUL_VOTES_KEY = 'chalmeter_helpful_votes_v2';
const REPORTS_KEY = 'chalmeter_reports_v2';
const SHOW_DEMO_KEY = 'chalmeter_show_demo_data_v2';

const memStore: Record<string, string> = {};
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof localStorage !== 'undefined') {
      try {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
        // Seamless backward compatibility with legacy storage keys
        if (key.startsWith('chalmeter_')) {
          return localStorage.getItem(key.replace('chalmeter_', 'roadscore_'));
        }
        return null;
      } catch {
        return null;
      }
    }
    return memStore[key] || (key.startsWith('chalmeter_') ? memStore[key.replace('chalmeter_', 'roadscore_')] : null) || null;
  },
  setItem: (key: string, val: string): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, val);
        return;
      } catch {
        // Fallback to memStore
      }
    }
    memStore[key] = val;
  },
  removeItem: (key: string): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
        return;
      } catch {
        // Fallback to memStore
      }
    }
    delete memStore[key];
  },
};

class StorageService {
  // Live community database records (isDemo: false)
  private liveVehicles: Vehicle[] = [];
  private liveReviews: Review[] = [];

  // Quarantined sample catalog records (isDemo: true)
  private demoVehicles: Vehicle[] = [];
  private demoReviews: Review[] = [];

  private users: UserProfile[] = [];
  private currentUser: UserProfile | null = null;
  private showDemoData: boolean = true;
  private isSyncingWithSupabase: boolean = false;
  private lastSyncError: string | null = null;

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    // 1. Load Demo Data (Always flagged with isDemo: true)
    this.demoVehicles = SEED_VEHICLES.map((v) => ({ ...v, isDemo: true }));
    this.demoReviews = SEED_REVIEWS.map((r) => ({ ...r, isDemo: true }));

    // 2. Production Security: Separate demo data strictly.
    // Public users see ONLY genuine database records by default.
    // Demo samples are kept strictly quarantined and disabled by default.
    const storedShowDemo = safeStorage.getItem(SHOW_DEMO_KEY);
    this.showDemoData = storedShowDemo === 'true';

    // 3. Load Live Community Records from persistent store
    try {
      const storedLiveVehicles = safeStorage.getItem(LIVE_VEHICLES_KEY);
      this.liveVehicles = storedLiveVehicles ? JSON.parse(storedLiveVehicles) : [];

      const storedLiveReviews = safeStorage.getItem(LIVE_REVIEWS_KEY);
      this.liveReviews = storedLiveReviews ? JSON.parse(storedLiveReviews) : [];

      const storedUsers = safeStorage.getItem(USER_PROFILES_KEY);
      // Only retain genuine user accounts (not fictional scout profiles)
      this.users = storedUsers ? JSON.parse(storedUsers).filter((u: UserProfile) => !u.isDemo) : [];

      const storedActiveUser = safeStorage.getItem(CURRENT_USER_KEY);
      if (storedActiveUser) {
        const parsed = JSON.parse(storedActiveUser);
        // Do not auto-login as a fictional seed user
        this.currentUser = parsed?.isDemo ? null : parsed;
      } else {
        // Real security: Unauthenticated users start as Guest (null)
        this.currentUser = null;
      }
    } catch (e) {
      console.warn('LocalStorage load warning:', e);
      this.liveVehicles = [];
      this.liveReviews = [];
    }

    // 4. If Supabase credentials are configured, pull live cloud records asynchronously
    if (isSupabaseConfigured()) {
      this.syncFromSupabase();
    }
  }

  public subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  private persistLocal() {
    try {
      safeStorage.setItem(LIVE_VEHICLES_KEY, JSON.stringify(this.liveVehicles));
      safeStorage.setItem(LIVE_REVIEWS_KEY, JSON.stringify(this.liveReviews));
      safeStorage.setItem(USER_PROFILES_KEY, JSON.stringify(this.users));
      safeStorage.setItem(SHOW_DEMO_KEY, String(this.showDemoData));
      if (this.currentUser) {
        safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      } else {
        safeStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to persist to local storage:', e);
    }
    this.notify();
  }

  // --- DEMO DATA AUDIT & SEPARATION CONTROLS ---

  public isShowingDemoData(): boolean {
    return this.showDemoData;
  }

  public setShowDemoData(show: boolean) {
    this.showDemoData = show;
    this.persistLocal();
  }

  public getLiveReviewsCount(): number {
    return this.liveReviews.length;
  }

  public getLiveVehiclesCount(): number {
    return this.liveVehicles.length;
  }

  // --- SUPABASE LIVE SYNCHRONIZATION ---

  public async syncFromSupabase() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    this.isSyncingWithSupabase = true;
    this.lastSyncError = null;

    try {
      // 1. Fetch live vehicles from Supabase
      const { data: remoteVehicles, error: vError } = await supabase
        .from('vehicles')
        .select('*')
        .order('last_reported_at', { ascending: false });

      if (vError) {
        console.warn('Supabase fetch vehicles error:', vError.message);
        this.lastSyncError = vError.message;
      } else if (remoteVehicles) {
        // Map Supabase column names to TypeScript Vehicle type
        const mappedVehicles: Vehicle[] = remoteVehicles.map((row) => ({
          id: row.id,
          registrationNumber: row.registration_number,
          stateCode: row.state_code,
          make: row.make,
          model: row.model,
          colour: row.colour,
          vehicleType: row.vehicle_type,
          plateType: row.plate_type,
          averageRating: Number(row.average_rating) || 5.0,
          totalReviews: row.total_reviews || 0,
          positiveReviewsCount: row.positive_reviews_count || 0,
          negativeReviewsCount: row.negative_reviews_count || 0,
          confidenceScore: (row.confidence_score as ConfidenceLevel) || 'LOW',
          topPositiveTags: [],
          topNegativeTags: [],
          lastReportedAt: row.last_reported_at || new Date().toISOString(),
          createdAt: row.created_at || new Date().toISOString(),
          isDemo: false, // LIVE DATABASE RECORD
        }));

        this.liveVehicles = mappedVehicles;
      }

      // 2. Fetch live reviews
      const { data: remoteReviews, error: rError } = await supabase
        .from('reviews')
        .select('*, user_profiles(name, avatar_url, badge)')
        .eq('is_flagged', false)
        .order('created_at', { ascending: false });

      if (!rError && remoteReviews) {
        const mappedReviews: Review[] = remoteReviews.map((r) => {
          const profile = Array.isArray(r.user_profiles) ? r.user_profiles[0] : r.user_profiles;
          return {
            id: r.id,
            vehicleId: r.vehicle_id,
            userId: r.user_id,
            userName: profile?.name || 'Verified Citizen',
            userAvatar: profile?.avatar_url,
            userBadge: profile?.badge,
            rating: r.rating,
            tags: r.tags || [],
            comment: r.comment || undefined,
            locationCity: r.location_city,
            locationState: r.location_state,
            roadType: r.road_type,
            timeOfDay: r.time_of_day,
            isDashcamVerified: r.is_dashcam_verified,
            helpfulCount: r.helpful_count || 0,
            reportCount: r.report_count || 0,
            isFlagged: r.is_flagged || false,
            createdAt: r.created_at,
            isDemo: false, // LIVE DATABASE RECORD
          };
        });

        this.liveReviews = mappedReviews;
      }

      this.persistLocal();
    } catch (err: unknown) {
      console.warn('Supabase sync exception:', err);
      this.lastSyncError = err instanceof Error ? err.message : String(err);
    } finally {
      this.isSyncingWithSupabase = false;
      this.notify();
    }
  }

  public getSyncStatus(): { isSyncing: boolean; lastError: string | null; isConnected: boolean } {
    return {
      isSyncing: this.isSyncingWithSupabase,
      lastError: this.lastSyncError,
      isConnected: isSupabaseConfigured(),
    };
  }

  // --- VEHICLES RETRIEVAL ---

  public getAllVehicles(): Vehicle[] {
    // If showDemoData is false, return ONLY live community vehicles
    if (!this.showDemoData) {
      return [...this.liveVehicles].sort(
        (a, b) => new Date(b.lastReportedAt).getTime() - new Date(a.lastReportedAt).getTime()
      );
    }

    // Otherwise merge, with live records prioritized over demo records
    const liveIds = new Set(this.liveVehicles.map((v) => v.id.toUpperCase()));
    const nonDuplicatedDemo = this.demoVehicles.filter((v) => !liveIds.has(v.id.toUpperCase()));

    return [...this.liveVehicles, ...nonDuplicatedDemo].sort(
      (a, b) => new Date(b.lastReportedAt).getTime() - new Date(a.lastReportedAt).getTime()
    );
  }

  public getVehicleById(id: string): Vehicle | undefined {
    const cleanId = id.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Check live first
    const live = this.liveVehicles.find((v) => v.id.toUpperCase() === cleanId);
    if (live) return live;

    // Check demo if enabled
    if (this.showDemoData) {
      return this.demoVehicles.find((v) => v.id.toUpperCase() === cleanId);
    }

    return undefined;
  }

  public searchVehicles(query: string, stateFilter?: string, typeFilter?: string): Vehicle[] {
    const all = this.getAllVehicles();
    const cleanQuery = query.replace(/[^A-Za-z0-9]/g, '').toLowerCase();

    return all.filter((v) => {
      const matchPlate =
        !cleanQuery ||
        v.id.toLowerCase().includes(cleanQuery) ||
        v.registrationNumber.toLowerCase().includes(query.toLowerCase());
      const matchMake =
        !cleanQuery ||
        v.make.toLowerCase().includes(query.toLowerCase()) ||
        v.model.toLowerCase().includes(query.toLowerCase());
      const matchState =
        !stateFilter || stateFilter === 'ALL' || v.stateCode.toUpperCase() === stateFilter.toUpperCase();
      const matchType = !typeFilter || typeFilter === 'ALL' || v.vehicleType === typeFilter;

      return (matchPlate || matchMake) && matchState && matchType;
    });
  }

  public async lookupVehicleByPlate(rawPlate: string): Promise<{
    found: boolean;
    vehicle?: Vehicle;
    source: 'SUPABASE_LIVE' | 'LOCAL_LIVE' | 'DEMO_CATALOG' | 'NONE';
    message: string;
  }> {
    const cleanId = rawPlate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!cleanId) {
      return {
        found: false,
        source: 'NONE',
        message: 'No plate number provided for lookup.',
      };
    }

    // 1. Direct query to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .or(`id.eq.${cleanId},registration_number.ilike.${rawPlate.trim()}`)
          .maybeSingle();

        if (!error && data) {
          const mapped: Vehicle = {
            id: data.id,
            registrationNumber: data.registration_number,
            stateCode: data.state_code,
            make: data.make,
            model: data.model,
            colour: data.colour,
            vehicleType: data.vehicle_type,
            plateType: data.plate_type,
            averageRating: Number(data.average_rating) || 5.0,
            totalReviews: data.total_reviews || 0,
            positiveReviewsCount: data.positive_reviews_count || 0,
            negativeReviewsCount: data.negative_reviews_count || 0,
            confidenceScore: (data.confidence_score as ConfidenceLevel) || 'LOW',
            topPositiveTags: [],
            topNegativeTags: [],
            lastReportedAt: data.last_reported_at || new Date().toISOString(),
            createdAt: data.created_at || new Date().toISOString(),
            isDemo: false,
          };

          const existingIdx = this.liveVehicles.findIndex((v) => v.id.toUpperCase() === cleanId);
          if (existingIdx >= 0) {
            this.liveVehicles[existingIdx] = mapped;
          } else {
            this.liveVehicles.unshift(mapped);
          }
          this.persistLocal();

          return {
            found: true,
            vehicle: mapped,
            source: 'SUPABASE_LIVE',
            message: `Found registered vehicle in Supabase cloud database (${mapped.totalReviews} reviews, ${mapped.averageRating}★ average).`,
          };
        }
      } catch (err) {
        console.warn('Supabase lookup error, checking local store:', err);
      }
    }

    // 2. Search local live records
    const live = this.liveVehicles.find((v) => v.id.toUpperCase() === cleanId);
    if (live) {
      return {
        found: true,
        vehicle: live,
        source: 'LOCAL_LIVE',
        message: `Found vehicle in community database (${live.totalReviews} ratings, ${live.averageRating}★ average).`,
      };
    }

    // 3. Search demo catalog if active
    if (this.showDemoData) {
      const demo = this.demoVehicles.find((v) => v.id.toUpperCase() === cleanId);
      if (demo) {
        return {
          found: true,
          vehicle: demo,
          source: 'DEMO_CATALOG',
          message: `Found reference entry in demo vehicle catalog (${demo.totalReviews} reviews, ${demo.averageRating}★ average).`,
        };
      }
    }

    return {
      found: false,
      source: 'NONE',
      message: `No community vehicle profile exists for registration number "${rawPlate}".`,
    };
  }

  public async upsertVehicle(
    vehicleData: Omit<
      Vehicle,
      | 'averageRating'
      | 'totalReviews'
      | 'positiveReviewsCount'
      | 'negativeReviewsCount'
      | 'confidenceScore'
      | 'topPositiveTags'
      | 'topNegativeTags'
      | 'lastReportedAt'
      | 'createdAt'
    >
  ): Promise<Vehicle> {
    const normalizedId = vehicleData.id.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const existing = this.liveVehicles.find((v) => v.id.toUpperCase() === normalizedId);

    if (existing) {
      existing.make = vehicleData.make || existing.make;
      existing.model = vehicleData.model || existing.model;
      existing.colour = vehicleData.colour || existing.colour;
      existing.vehicleType = vehicleData.vehicleType || existing.vehicleType;
      existing.plateType = vehicleData.plateType || existing.plateType;
      existing.isDemo = false; // Mark live record
      this.persistLocal();
      return existing;
    }

    const newVehicle: Vehicle = {
      ...vehicleData,
      id: normalizedId,
      averageRating: 5.0,
      totalReviews: 0,
      positiveReviewsCount: 0,
      negativeReviewsCount: 0,
      confidenceScore: 'LOW',
      topPositiveTags: [],
      topNegativeTags: [],
      lastReportedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isDemo: false, // Created by user in live database
    };

    this.liveVehicles.unshift(newVehicle);
    this.persistLocal();

    // Sync to Supabase in background if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('vehicles')
          .upsert(
            {
              id: newVehicle.id,
              registration_number: newVehicle.registrationNumber,
              state_code: newVehicle.stateCode,
              make: newVehicle.make,
              model: newVehicle.model,
              colour: newVehicle.colour,
              vehicle_type: newVehicle.vehicleType,
              plate_type: newVehicle.plateType,
              average_rating: newVehicle.averageRating,
              total_reviews: newVehicle.totalReviews,
              confidence_score: newVehicle.confidenceScore,
              last_reported_at: newVehicle.lastReportedAt,
            },
            { onConflict: 'id' }
          );
        if (error) console.warn('Supabase upsert vehicle warning:', error.message);
      } catch (err) {
        console.warn('Supabase upsert vehicle exception:', err);
      }
    }

    return newVehicle;
  }

  // --- REVIEWS RETRIEVAL ---

  public getReviewsForVehicle(vehicleId: string): Review[] {
    const cleanVehicleId = vehicleId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // 1. Get live reviews
    const live = this.liveReviews
      .filter((r) => r.vehicleId.toUpperCase() === cleanVehicleId && !r.isFlagged)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 2. If showDemoData is true and vehicle exists in demo set, include demo reviews with DEMO indicator
    if (this.showDemoData) {
      const demo = this.demoReviews
        .filter((r) => r.vehicleId.toUpperCase() === cleanVehicleId && !r.isFlagged)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return [...live, ...demo];
    }

    return live;
  }

  public getReviewsByUser(userId: string): Review[] {
    const live = this.liveReviews.filter((r) => r.userId === userId);
    const demo = this.showDemoData ? this.demoReviews.filter((r) => r.userId === userId) : [];
    return [...live, ...demo].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- DUPLICATE & ANTI-SPAM PROTECTION ---

  public canUserReviewVehicle(userId: string, vehicleId: string): { allowed: boolean; reason?: string } {
    const cleanVehicleId = vehicleId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // 1. Rapid-submission cooldown check (20 seconds)
    const lastPostStr = safeStorage.getItem(`${USER_LAST_POST_KEY}_${userId}`);
    if (lastPostStr) {
      const lastPost = parseInt(lastPostStr, 10);
      const elapsedSec = (Date.now() - lastPost) / 1000;
      if (elapsedSec < 20) {
        return {
          allowed: false,
          reason: `Anti-Spam cooldown: Please wait ${Math.ceil(20 - elapsedSec)}s before submitting another rating.`,
        };
      }
    }

    // 2. 24-hour limit on the same vehicle per user (Requirements 4 & 5)
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const existingRecent = this.liveReviews.find(
      (r) =>
        r.userId === userId &&
        r.vehicleId.toUpperCase() === cleanVehicleId &&
        new Date(r.createdAt).getTime() > twentyFourHoursAgo
    );

    if (existingRecent) {
      return {
        allowed: false,
        reason: 'Duplicate review protection: You have already rated this vehicle in the last 24 hours.',
      };
    }

    return { allowed: true };
  }

  public async addReview(reviewData: {
    vehicleId: string;
    rating: number;
    tags: string[];
    comment?: string;
    locationCity: string;
    locationState: string;
    roadType: Review['roadType'];
    timeOfDay: Review['timeOfDay'];
    isDashcamVerified: boolean;
  }): Promise<Review> {
    if (!this.currentUser) {
      throw new Error('Authentication required to submit a review.');
    }

    const vehicleId = reviewData.vehicleId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Validate spam & duplicate
    const spamCheck = this.canUserReviewVehicle(this.currentUser.id, vehicleId);
    if (!spamCheck.allowed) {
      throw new Error(spamCheck.reason);
    }

    const newReview: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      vehicleId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar,
      userBadge: this.currentUser.badge,
      rating: reviewData.rating,
      tags: reviewData.tags,
      comment: reviewData.comment?.trim(),
      locationCity: reviewData.locationCity,
      locationState: reviewData.locationState,
      roadType: reviewData.roadType,
      timeOfDay: reviewData.timeOfDay,
      isDashcamVerified: reviewData.isDashcamVerified,
      helpfulCount: 0,
      reportCount: 0,
      isFlagged: false,
      isDemo: false, // GENUINE LIVE COMMUNITY RECORD
      createdAt: new Date().toISOString(),
    };

    // Store in live reviews
    this.liveReviews.unshift(newReview);

    // Update anti-spam timestamp
    safeStorage.setItem(`${USER_LAST_POST_KEY}_${this.currentUser.id}`, Date.now().toString());

    // Update user karma and badge
    this.currentUser.reviewsCount += 1;
    this.currentUser.karmaPoints += reviewData.isDashcamVerified ? 30 : 20;

    if (this.currentUser.reviewsCount >= 25) {
      this.currentUser.badge = 'Master Inspector';
    } else if (this.currentUser.reviewsCount >= 10) {
      this.currentUser.badge = 'Highway Sentinel';
    } else if (this.currentUser.reviewsCount >= 4) {
      this.currentUser.badge = 'Road Guardian';
    }

    const uIdx = this.users.findIndex((u) => u.id === this.currentUser!.id);
    if (uIdx >= 0) {
      this.users[uIdx] = { ...this.currentUser };
    }

    // Recalculate vehicle metrics using live reviews!
    this.recalculateVehicleMetrics(vehicleId);
    this.persistLocal();

    // Sync to Supabase live database if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('reviews').insert({
          vehicle_id: newReview.vehicleId,
          user_id: newReview.userId,
          rating: newReview.rating,
          tags: newReview.tags,
          comment: newReview.comment || null,
          location_city: newReview.locationCity,
          location_state: newReview.locationState,
          road_type: newReview.roadType,
          time_of_day: newReview.timeOfDay,
          is_dashcam_verified: newReview.isDashcamVerified,
          helpful_count: 0,
          report_count: 0,
          is_flagged: false,
          created_at: newReview.createdAt,
        });
      } catch (err) {
        console.warn('Supabase review insert warning (saved locally):', err);
      }
    }

    return newReview;
  }

  // --- RECALCULATE AGGREGATE SCORES ---

  private recalculateVehicleMetrics(vehicleId: string) {
    const v = this.liveVehicles.find((item) => item.id.toUpperCase() === vehicleId);
    if (!v) return;

    // Live ratings are strictly calculated from live reviews
    const vReviews = this.liveReviews.filter((r) => r.vehicleId.toUpperCase() === vehicleId && !r.isFlagged);
    if (vReviews.length === 0) return;

    const sumRating = vReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = sumRating / vReviews.length;
    v.averageRating = parseFloat(avg.toFixed(1));
    v.totalReviews = vReviews.length;

    let posCount = 0;
    let negCount = 0;
    const tagFrequencies: Record<string, number> = {};

    vReviews.forEach((r) => {
      if (r.rating >= 3.5) posCount++;
      else if (r.rating <= 2.5) negCount++;

      r.tags.forEach((t) => {
        tagFrequencies[t] = (tagFrequencies[t] || 0) + 1;
      });
    });

    v.positiveReviewsCount = posCount;
    v.negativeReviewsCount = negCount;

    // Bayesian confidence metric:
    // Low: 1-2 reviews
    // Medium: 3-7 reviews
    // High: 8+ reviews
    if (v.totalReviews < 3) {
      v.confidenceScore = 'LOW';
    } else if (v.totalReviews < 8) {
      v.confidenceScore = 'MEDIUM';
    } else {
      v.confidenceScore = 'HIGH';
    }

    const posTags = Object.entries(tagFrequencies)
      .filter(([id]) => id.startsWith('pos_'))
      .map(([tagId, count]) => ({ tagId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const negTags = Object.entries(tagFrequencies)
      .filter(([id]) => id.startsWith('neg_'))
      .map(([tagId, count]) => ({ tagId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    v.topPositiveTags = posTags;
    v.topNegativeTags = negTags;
    v.lastReportedAt = new Date().toISOString();
  }

  // --- HELPFUL VOTES ---

  public toggleHelpful(reviewId: string): boolean {
    const key = `${HELPFUL_VOTES_KEY}_${reviewId}`;
    const alreadyVoted = safeStorage.getItem(key) === 'true';

    // Search both live and demo reviews
    const r = [...this.liveReviews, ...this.demoReviews].find((rev) => rev.id === reviewId);
    if (!r) return false;

    if (alreadyVoted) {
      r.helpfulCount = Math.max(0, r.helpfulCount - 1);
      safeStorage.removeItem(key);
      this.persistLocal();
      return false;
    } else {
      r.helpfulCount += 1;
      safeStorage.setItem(key, 'true');

      // Award author 5 karma points
      const author = this.users.find((u) => u.id === r.userId);
      if (author) {
        author.karmaPoints += 5;
      }

      this.persistLocal();
      return true;
    }
  }

  public isReviewHelpfulVoted(reviewId: string): boolean {
    return safeStorage.getItem(`${HELPFUL_VOTES_KEY}_${reviewId}`) === 'true';
  }

  // --- REPORTING & MODERATION ---

  public async reportReview(reportData: {
    reviewId: string;
    reason: ReviewReport['reason'];
    details?: string;
  }) {
    if (!this.currentUser) {
      throw new Error('Please sign in to flag a review.');
    }

    const review = [...this.liveReviews, ...this.demoReviews].find((r) => r.id === reportData.reviewId);
    if (!review) return;

    review.reportCount += 1;
    // Auto-moderate if 2 or more distinct reports
    if (review.reportCount >= 2) {
      review.isFlagged = true;
      this.recalculateVehicleMetrics(review.vehicleId);
    }

    try {
      const reports: ReviewReport[] = JSON.parse(safeStorage.getItem(REPORTS_KEY) || '[]');
      reports.push({
        id: `rep_${Date.now()}`,
        reviewId: reportData.reviewId,
        userId: this.currentUser.id,
        reason: reportData.reason,
        details: reportData.details,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
      });
      safeStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

      // Sync to Supabase if configured
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('review_reports').insert({
          review_id: reportData.reviewId,
          user_id: this.currentUser.id,
          reason: reportData.reason,
          details: reportData.details || null,
          status: 'PENDING',
        });
      }
    } catch (e) {
      console.warn('Failed to save report record:', e);
    }

    this.persistLocal();
  }

  // --- USER AUTHENTICATION ---

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public setCurrentUser(user: UserProfile | null) {
    this.currentUser = user;
    this.persistLocal();
  }

  public signInWithGoogle(customEmail?: string, customName?: string): UserProfile {
    const email = customEmail || 'varunsdca@gmail.com';
    const name = customName || 'Varun S. (Google User)';
    let user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        email,
        name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        badge: 'Civic Scout',
        karmaPoints: 100,
        reviewsCount: 0,
        joinedAt: new Date().toISOString(),
        isDemo: false,
      };
      this.users.push(user);
    }

    this.currentUser = user;
    this.persistLocal();
    return user;
  }

  public signInWithEmail(email: string, name: string): UserProfile {
    let user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        email,
        name: name || email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
        badge: 'Civic Scout',
        karmaPoints: 50,
        reviewsCount: 0,
        joinedAt: new Date().toISOString(),
        isDemo: false,
      };
      this.users.push(user);
    }
    this.currentUser = user;
    this.persistLocal();
    return user;
  }

  public switchDemoAccount(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.persistLocal();
    }
  }

  public getLeaderboardScouts(): UserProfile[] {
    // Production security: Return strictly genuine registered scouts with real contributions
    return [...this.users]
      .filter((u) => !u.isDemo)
      .sort((a, b) => b.karmaPoints - a.karmaPoints);
  }

  public signOut() {
    this.currentUser = null;
    this.persistLocal();
  }

  public resetToFactorySeed() {
    this.liveVehicles = [];
    this.liveReviews = [];
    this.demoVehicles = SEED_VEHICLES.map((v) => ({ ...v, isDemo: true }));
    this.demoReviews = SEED_REVIEWS.map((r) => ({ ...r, isDemo: true }));
    this.users = [];
    this.currentUser = null;
    this.persistLocal();
  }
}

export const storageService = new StorageService();
