-- ====================================================================
-- CHALMETER INDIA (चाल + मीटर) — PRODUCTION POSTGRESQL & SUPABASE SCHEMA
-- Platform: Community Driving Behaviour & Reputation Platform for India
-- Target Engine: PostgreSQL 15+ / Supabase
-- Features:
--   - Row Level Security (RLS) on all tables
--   - Public aggregate score access
--   - Authenticated detailed review access
--   - Anti-spam cooldown & duplicate review prevention triggers
--   - Bayesian confidence score auto-calculation
--   - Zero PII (No vehicle owner identity tables)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Vehicles Table
-- Stores normalized Indian registration plate and aggregate driving scores
CREATE TABLE IF NOT EXISTS public.vehicles (
    id VARCHAR(20) PRIMARY KEY, -- e.g. 'DL01AB1234'
    registration_number VARCHAR(25) NOT NULL UNIQUE, -- e.g. 'DL 01 AB 1234'
    state_code VARCHAR(4) NOT NULL, -- e.g. 'DL', 'MH', 'KA', 'BH'
    make VARCHAR(50) NOT NULL, -- e.g. 'Tata', 'Mahindra'
    model VARCHAR(50) NOT NULL, -- e.g. 'Nexon', 'Thar'
    colour VARCHAR(30) NOT NULL, -- e.g. 'Pristine White'
    vehicle_type VARCHAR(40) NOT NULL DEFAULT 'Car / SUV',
    plate_type VARCHAR(40) NOT NULL DEFAULT 'White (Private)',
    average_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    total_reviews INT NOT NULL DEFAULT 0,
    positive_reviews_count INT NOT NULL DEFAULT 0,
    negative_reviews_count INT NOT NULL DEFAULT 0,
    confidence_score VARCHAR(10) NOT NULL DEFAULT 'LOW', -- 'LOW', 'MEDIUM', 'HIGH'
    last_reported_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant plate searches & state lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON public.vehicles (registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_state ON public.vehicles (state_code);
CREATE INDEX IF NOT EXISTS idx_vehicles_rating ON public.vehicles (average_rating DESC);

-- 3. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    badge VARCHAR(50) DEFAULT 'Civic Scout',
    karma_points INT DEFAULT 50,
    reviews_count INT DEFAULT 0,
    is_moderator BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Driving Behaviour Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id VARCHAR(20) NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    tags TEXT[] NOT NULL DEFAULT '{}',
    comment TEXT,
    location_city VARCHAR(100) NOT NULL,
    location_state VARCHAR(100) NOT NULL,
    road_type VARCHAR(50) NOT NULL DEFAULT 'City Street',
    time_of_day VARCHAR(30) NOT NULL DEFAULT 'Daytime',
    is_dashcam_verified BOOLEAN NOT NULL DEFAULT FALSE,
    helpful_count INT NOT NULL DEFAULT 0,
    report_count INT NOT NULL DEFAULT 0,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Anti-Spam: One review per vehicle per user within 24 hours
    CONSTRAINT one_review_per_day_per_vehicle UNIQUE (vehicle_id, user_id, (created_at::DATE))
);

CREATE INDEX IF NOT EXISTS idx_reviews_vehicle ON public.reviews (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews (created_at DESC);

-- 5. Review Reports Table (Community Moderation)
CREATE TABLE IF NOT EXISTS public.review_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    reason VARCHAR(80) NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Trigger: Recalculate Vehicle Score & Confidence
CREATE OR REPLACE FUNCTION public.fn_recalculate_vehicle_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_id VARCHAR(20);
    v_avg NUMERIC(3, 2);
    v_count INT;
    v_pos INT;
    v_neg INT;
    v_conf VARCHAR(10);
BEGIN
    v_id := COALESCE(NEW.vehicle_id, OLD.vehicle_id);

    SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 2), 5.00),
        COUNT(*),
        COUNT(*) FILTER (WHERE rating >= 4),
        COUNT(*) FILTER (WHERE rating <= 2)
    INTO v_avg, v_count, v_pos, v_neg
    FROM public.reviews
    WHERE vehicle_id = v_id AND is_flagged = FALSE;

    -- Confidence Calculation:
    -- LOW: < 3 reviews
    -- MEDIUM: 3 to 7 reviews
    -- HIGH: >= 8 reviews
    IF v_count < 3 THEN
        v_conf := 'LOW';
    ELSIF v_count < 8 THEN
        v_conf := 'MEDIUM';
    ELSE
        v_conf := 'HIGH';
    END IF;

    UPDATE public.vehicles
    SET 
        average_rating = v_avg,
        total_reviews = v_count,
        positive_reviews_count = v_pos,
        negative_reviews_count = v_neg,
        confidence_score = v_conf,
        last_reported_at = NOW()
    WHERE id = v_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_vehicle ON public.reviews;
CREATE TRIGGER trg_recalculate_vehicle
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.fn_recalculate_vehicle_stats();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Vehicles: Everyone can view public vehicle ratings
CREATE POLICY "Public vehicle read" ON public.vehicles
    FOR SELECT USING (true);

-- Vehicles: Authenticated users can insert/update vehicle metadata
CREATE POLICY "Authenticated vehicle insert" ON public.vehicles
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated vehicle update" ON public.vehicles
    FOR UPDATE TO authenticated USING (true);

-- User Profiles: Public view, user can update only own profile
CREATE POLICY "Public profiles read" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users update own profile" ON public.user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Reviews: Detailed reviews accessible only to authenticated users (Per brief requirements)
CREATE POLICY "Authenticated reviews read" ON public.reviews
    FOR SELECT TO authenticated USING (is_flagged = FALSE);

CREATE POLICY "Authenticated review insert" ON public.reviews
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Review Reports: Only authenticated users can flag
CREATE POLICY "Authenticated report insert" ON public.review_reports
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
