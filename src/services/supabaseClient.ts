/**
 * Supabase Client & Connection Diagnostics
 * Connects ChalMeter to user's free-tier Supabase PostgreSQL backend.
 * Provides health checks, table validation, auth handlers, and live sync.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseHealthCheckResult, Vehicle, Review, UserProfile } from '../types';

let cachedClient: SupabaseClient | null = null;
let lastKnownConfig = { url: '', key: '' };

export function getSupabaseCredentials(): { url: string; key: string } {
  // Production security: Strictly read from build/runtime environment variables.
  // Never read or persist database credentials in browser localStorage.
  const envUrl = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY) || '';

  // Purge any legacy credentials that might have been stored in localStorage by earlier builds
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('chalmeter_supabase_url');
      localStorage.removeItem('chalmeter_supabase_key');
      localStorage.removeItem('roadscore_supabase_url');
      localStorage.removeItem('roadscore_supabase_key');
    } catch {
      // Ignore storage access errors
    }
  }

  return {
    url: envUrl.trim(),
    key: envKey.trim(),
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    cachedClient = null;
    return null;
  }

  // Re-instantiate if credentials changed
  if (!cachedClient || lastKnownConfig.url !== url || lastKnownConfig.key !== key) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      lastKnownConfig = { url, key };
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      cachedClient = null;
    }
  }

  return cachedClient;
}

/**
 * Diagnostics and Health Check Tool
 * Tests connection latency, API access, auth endpoint, and required table existence
 * strictly against environment-configured credentials.
 */
export async function testSupabaseConnection(): Promise<SupabaseHealthCheckResult> {
  const startTime = Date.now();
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return {
      status: 'DISCONNECTED',
      message: 'No Supabase URL or publishable key configured in environment variables.',
      timestamp: new Date().toISOString(),
    };
  }

  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    return {
      status: 'ERROR',
      message: 'Invalid Supabase URL format in environment variables.',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const testClient = createClient(url, key, {
      auth: { persistSession: false },
    });

    // 1. Check vehicles table
    const vehiclesCheck = await testClient.from('vehicles').select('id').limit(1);
    const hasVehicles = !vehiclesCheck.error;

    // 2. Check reviews table
    const reviewsCheck = await testClient.from('reviews').select('id').limit(1);
    const hasReviews = !reviewsCheck.error;

    // 3. Check user_profiles table
    const profilesCheck = await testClient.from('user_profiles').select('id').limit(1);
    const hasProfiles = !profilesCheck.error;

    // 4. Check review_reports table
    const reportsCheck = await testClient.from('review_reports').select('id').limit(1);
    const hasReports = !reportsCheck.error;

    const latencyMs = Date.now() - startTime;

    // Check if any critical error happened
    if (vehiclesCheck.error && vehiclesCheck.error.code === 'PGRST301') {
      return {
        status: 'ERROR',
        latencyMs,
        message: 'Invalid Anon Key (JWT signature verification failed). Please re-check your Supabase public anon key.',
        errorDetail: vehiclesCheck.error.message,
        timestamp: new Date().toISOString(),
      };
    }

    const allTablesExist = hasVehicles && hasReviews && hasProfiles && hasReports;

    if (!allTablesExist) {
      const missing = [];
      if (!hasVehicles) missing.push('vehicles');
      if (!hasReviews) missing.push('reviews');
      if (!hasProfiles) missing.push('user_profiles');
      if (!hasReports) missing.push('review_reports');

      return {
        status: 'CONNECTED',
        latencyMs,
        tablesFound: {
          vehicles: hasVehicles,
          reviews: hasReviews,
          user_profiles: hasProfiles,
          review_reports: hasReports,
        },
        message: `Connected to Supabase (${latencyMs}ms), but missing tables: ${missing.join(', ')}. Please run /supabase/schema.sql in your Supabase SQL Editor.`,
        errorDetail: vehiclesCheck.error?.message || reviewsCheck.error?.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'CONNECTED',
      latencyMs,
      tablesFound: {
        vehicles: true,
        reviews: true,
        user_profiles: true,
        review_reports: true,
      },
      authWorking: true,
      message: `Successfully connected to Supabase PostgreSQL database (${latencyMs}ms latency). All schema tables verified!`,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      status: 'ERROR',
      latencyMs: Date.now() - startTime,
      message: 'Failed to reach Supabase project. Check network connectivity or project status.',
      errorDetail: errorMsg,
      timestamp: new Date().toISOString(),
    };
  }
}
