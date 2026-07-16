# ⚛️ Habits Aura

> Build habits. Track consistency. Grow your aura.

Habits Aura is a gamified habit-tracking web application built with **Next.js 14 (App Router)**, **Prisma**, **PostgreSQL (Neon)**, and **NextAuth (Google OAuth)**.

---

# ✨ Features

- 🔐 Google Authentication (NextAuth v4)
- 📅 Create habits with custom day schedules (SUN–SAT)
- 🔄 3-state daily toggle: NONE → COMPLETED → SKIPPED → NONE
- ⚡ Aura Points System (+10 on complete, –10 on skip)
- 🔥 Current & Longest Streak Tracking (based on scheduled days)
- 📊 GitHub-style Yearly Heatmap Calendar per habit
- 🏆 Leaderboard Ranking (paginated, sorted by aura points)
- ✨ Confetti animation on habit creation
- 🔔 Sound effect on habit completion
- ✏️ Edit habit title & schedule after creation
- 🗑️ Delete habit (deducts earned aura points)
- 🔄 Optimistic UI updates with automatic rollback on failure
- 🚦 Rate limiting (Upstash) on toggle, create, and delete
- 💡 Habit suggestions in create form
- 👤 User profile dropdown with avatar
- 📱 Fully responsive with mobile drawer navigation
- 🌙 Forced dark theme (DaisyUI)
- ⚡ Hybrid RSC/RCC for fast loads and interactivity

---

# 🛠 Tech Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| Framework     | Next.js 14 (App Router)             |
| Language      | TypeScript                          |
| Auth          | NextAuth v4 (Google OAuth)          |
| Database      | PostgreSQL (Neon)                   |
| ORM           | Prisma                              |
| Styling       | TailwindCSS + DaisyUI               |
| Animation     | Framer Motion (LazyMotion)          |
| Icons         | react-icons                         |
| Notifications | sonner (toast notifications)        |
| Confetti      | canvas-confetti                     |
| Rate Limiting | @upstash/ratelimit + @upstash/redis |
| Deployment    | Vercel                              |

---

# 🚀 Getting Started

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Adarsh-Raut/habits-aura.git
cd habits-aura
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

UPSTASH_REDIS_REST_URL="your-upstash-redis-rest-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"
```

---

## 4️⃣ Setup Prisma

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

(Optional) Seed the database with sample data:

```bash
npm run seed
```

(Optional) Open Prisma Studio:

```bash
npx prisma studio
```

---

## 5️⃣ Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🔐 Google OAuth Setup

1. Go to Google Cloud Console  
   https://console.cloud.google.com

2. Create OAuth 2.0 Credentials

3. Add Authorized Redirect URI:

```
http://localhost:3000/api/auth/callback/google
```

For production:

```
https://your-domain.vercel.app/api/auth/callback/google
```

4. Add Authorized JavaScript Origins:

```
http://localhost:3000
https://your-domain.vercel.app
```

---

# 🚦 Rate Limiting Setup

Rate limiting uses **Upstash** (Redis-based sliding window).

1. Go to https://upstash.com
2. Create a Redis database (free tier)
3. Copy the REST URL and REST Token
4. Add them to your `.env` as `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

| Action | Limit |
| ------ | ----- |
| Habit toggle | 30 per minute |
| Habit create | 10 per minute |
| Habit delete | 10 per minute |

---

# 🧱 Project Structure

```
app/
├── (app)/                          # Authenticated route group
│   ├── layout.tsx                  # Auth guard + Navbar + Sidebar + Drawer
│   ├── loading.tsx                 # Loading skeleton
│   ├── error.tsx                   # Error boundary
│   ├── page.tsx                    # Home page (habit list, server component)
│   ├── create/
│   │   └── page.tsx                # Create habit page
│   ├── habit/
│   │   └── [id]/
│   │       └── edit/
│   │           ├── page.tsx        # Edit habit page
│   │           └── error.tsx
│   ├── leaderboard/
│   │   ├── page.tsx                # Leaderboard (paginated, raw SQL)
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── stats/
│   │   ├── page.tsx                # Stats dashboard
│   │   ├── loading.tsx
│   │   └── error.tsx
│   └── components/
│       ├── AuthBackground.tsx      # Animated gradient for auth pages
│       ├── Avatar.tsx              # User avatar with initials fallback
│       ├── CreateHabitForm.tsx     # Create/Edit form with confetti
│       ├── EmptyState.tsx          # Empty state for no habits
│       ├── HabitCard.tsx           # Single habit card with 3-state toggle
│       ├── HabitHeatmap.tsx        # GitHub-style yearly heatmap
│       ├── HabitList.tsx           # Habits grid with context menu
│       ├── HabitSkeleton.tsx       # Skeleton loader for habit cards
│       ├── HabitsStoreProvider.tsx # Client store (optimistic + dirty tracking)
│       ├── LeaderBoard.tsx         # Leaderboard table with medals
│       ├── LogoutButton.tsx        # Sign out button
│       ├── Navbar.tsx              # Top navigation bar
│       ├── Portal.tsx              # React portal utility
│       ├── Sidebar.tsx             # Side navigation drawer
│       ├── StatsView.tsx           # Stats dashboard with streak cards
│       └── UserProfile.tsx         # User dropdown (avatar, name, logout)
│
├── (auth)/                         # Unauthenticated route group
│   ├── layout.tsx                  # Redirects authenticated users away
│   └── signin/
│       └── page.tsx                # Landing / sign-in page
│
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts            # NextAuth catch-all handler
│   ├── habit/
│   │   ├── route.ts                # POST /api/habit (create)
│   │   └── [id]/
│   │       ├── route.ts            # PATCH (toggle), PUT (edit), DELETE
│   │       └── stats/
│   │           └── route.ts        # GET /api/habit/[id]/stats (heatmap+streaks)
│
├── fonts/
│   ├── GeistVF.woff
│   └── GeistMonoVF.woff
│
├── types/
│   └── habit.ts                    # Habit, HabitStatus, DbHabit types
│
├── globals.css                     # Tailwind + custom dark styles
├── layout.tsx                      # Root layout (fonts, metadata, Toaster)
├── sitemap.ts                      # Dynamic sitemap
└── robots.ts                       # Robots.txt config

lib/
├── auth.ts                         # NextAuth config (Google OAuth, JWT, callbacks)
├── prisma.ts                       # Prisma client singleton
├── date.ts                         # Date utilities (day keys, today, next day)
├── aura.ts                         # AURA_DELTA constant (= 10)
├── ratelimit.ts                    # Upstash rate limiters
└── audio.ts                        # Audio preload / play for completion sound

prisma/
├── schema.prisma                   # Database schema (User, Habit, HabitCompletion)
├── seed.ts                         # Seed script (6 users + habits + completions)
└── migrations/                     # SQL migrations

public/
└── audio/
    └── completed-sound.mp3         # Completion sound effect
```

---

# 🧠 Architecture

## Habit Toggle Flow (3-State Cycle)

```
NONE ──click──▶ COMPLETED (+10 aura, +1 streak)
COMPLETED ──click──▶ SKIPPED (-10 aura, streak resets)
SKIPPED ──click──▶ NONE (no aura change, streak stays 0)
```

1. User clicks the toggle on a **HabitCard**
2. `HabitList.toggleHabit()` fires — updates store optimistically, plays sound
3. `PATCH /api/habit/[id]` is called
4. Server runs a **Prisma transaction**:
   - Checks for existing `HabitCompletion` on today's `dateKey`
   - Creates/updates/deletes the completion row
   - Adjusts aura points via `applyAuraDelta()`
   - Recalculates streaks based on consecutive completions on scheduled days
   - Calls `revalidatePath()` for `/`, `/leaderboard`, `/stats`, `/habit/[id]/edit`
5. On success: updates streak from response, calls `router.refresh()`
6. On failure: restores previous state via `restoreHabit()`, shows error toast

## Optimistic Updates

The `HabitsStoreProvider` maintains a local state of all habits. On any toggle:
- The UI updates **immediately** (optimistic)
- The change is tracked in a "dirty habits" map
- On server response: reconcile with fresh data
- On error: **rollback** to the previous state

## Aura System

- Every new user starts with **100 aura points**
- **+10** for each habit completion
- **–10** for skipping a completed habit
- Deleting a habit deducts all aura earned from its completions
- Leaderboard is sorted by `auraPoints` descending

## Streak Calculation

- Streaks are based on **scheduled habit days only** (not calendar days)
- `currentStreak`: consecutive completions ending with the latest scheduled day
- `longestStreak`: highest streak ever achieved
- Skipping a completion resets `currentStreak` to 0

---

# 📦 Production Deployment

## Deploy to Vercel

1. Push project to GitHub
2. Import into Vercel
3. Add Environment Variables (same as `.env`)
4. Deploy

## Setup Neon Database

1. Go to https://neon.tech
2. Create project
3. Copy connection string
4. Add to `DATABASE_URL` in Vercel

---

# ⚡ Performance Optimizations

- Server Components for habit rendering (RSC)
- Optimistic UI updates with dirty tracking & rollback
- Prisma transactions for atomic operations
- Path revalidation instead of full page reload
- Dark theme locked to prevent hydration issues
- LazyMotion for reduced bundle size (Framer Motion)

---

# 🧪 Useful Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database (drops all data)
npx prisma migrate reset

# Seed database with sample data
npm run seed

# Open Prisma Studio
npx prisma studio

# Lint
npm run lint

# Build
npm run build

# Development
npm run dev
```

---

# 🔮 Future Improvements

- 🏅 Aura Level System (Beginner → Elite)
- 🎮 Gamification Badges
- 📊 Analytics Dashboard
- 🌓 Theme Switching
- 📱 PWA Support

---

# 👨‍💻 Author

Adarsh Raut  
Full Stack Developer (MERN + Next.js + Prisma)

---

# 📄 License

MIT License
