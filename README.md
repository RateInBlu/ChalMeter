# ChalMeter India (चाल + मीटर) — Community Driving Behaviour & Reputation Platform

**“Aapki Chal. Aapka Score.”** (Your Driving. Your Reputation.)

ChalMeter is an Indian community-powered vehicle driving behaviour and reputation platform, built as a mobile-first, installable Progressive Web Application (PWA) for Android and iPhone. It empowers citizens across India to scan Indian vehicle registration number plates, evaluate driving conduct, consult public safety scores, and foster safer roads.

---

## 🌟 Key Features

1. **High-Security Registration Plate (HSRP) Scanner**:
   - In-browser camera capture with plate alignment reticle.
   - Browser-side OCR heuristic parsing + Google Gemini Multimodal Vision API.
   - Normalization for standard Indian formats (e.g. `DL 01 AB 1234`, `MH 12 PQ 9999`) and Bharat Series (`22 BH 1842 AA`).
   - Supports White (Private), Yellow (Commercial taxi), Green (Electric EV), and Black (Self-drive) plate designations.

2. **Zero-PII & Privacy-First Architecture**:
   - **Zero Owner PII**: ChalMeter evaluates vehicular public driving behaviour only. In compliance with Indian privacy laws, no owner identity or VAHAN personal records are queried.
   - **Zero Photo Retention**: Photographs are processed in transient RAM for OCR and immediately destroyed.

3. **Driving Conduct Rating (1–5 Stars)**:
   - 8 positive categories (Courteous Merging, Safe Following Distance, Lane Discipline, Timely Indicators, Pedestrian Yielding, Gave Ambulance Way, Calm in Jams, Smooth Speed).
   - 8 negative categories (Rash Overtaking, Tailgating, Wrong-Side Driving, No Signal, Blinding High-Beam, Continuous Honking, Red Light Jumping, Blocking Emergency).

4. **Public Aggregate Scores with Bayesian Confidence Indicator**:
   - Public aggregate tachometer gauge (1.0 to 5.0).
   - Dynamic 3-tier confidence indicator (Low, Medium, High) weighted by review count, time distribution, and reviewer trust.

5. **Authenticated Incident Field Logs**:
   - Detailed incident locations, dashcam witness verification, and narratives are gated to authenticated citizens to prevent scraping.
   - Google Sign-In, Email registration, and one-click verified scout profiles.

6. **Anti-Spam & Community Moderation**:
   - 20-second submission cooldown.
   - 24-hour duplicate review limit on the same vehicle.
   - Citizen flag modal for spam, abusive language, or plate mismatch with automated moderation thresholds.

7. **Installable PWA**:
   - Web App Manifest compliant with Android and iOS Safari.
   - In-app install banner and step-by-step iOS Safari guide.
   - Offline service worker caching and connectivity status badge.

8. **Exportable PostgreSQL & Supabase Database**:
   - Production PostgreSQL DDL provided in `/supabase/schema.sql`.
   - Includes Row Level Security (RLS) policies, triggers, and indices.
   - Optional live Supabase project URL and anon key connector in Settings.

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ (tested with Node 20 & 22)
- npm or bun

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd chalmeter-india
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
- `GEMINI_API_KEY`: (Optional) For multimodal AI vehicle recognition. If omitted, ChalMeter automatically uses the built-in browser-side canvas OCR engine and preset samples.

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production & PWA Audit
```bash
npm run build
npm run preview
```

---

## 🗄️ Supabase / PostgreSQL Setup

To deploy the schema to your free Supabase instance:
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase dashboard.
3. Paste the contents of `/supabase/schema.sql` and click **Run**.
4. In the ChalMeter app, navigate to **Profile > Supabase Cloud Architecture**, enter your Supabase URL and Anon Key, and click **Save Cloud Config**.

---

## 📄 License
Apache-2.0
ChalMeter – Production deployment configuration update
