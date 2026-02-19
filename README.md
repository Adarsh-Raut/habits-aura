# ⚛️ Habits Aura

> Build habits. Track consistency. Grow your aura.

Habits Aura is a gamified habit-tracking web application built with **Next.js (App Router)**, **Prisma**, **PostgreSQL (Neon)**, and **NextAuth (Google OAuth)**.

Users can:

- Create habits
- Track daily completion
- Earn aura points
- View streak statistics
- Compete on a leaderboard

---

# ✨ Features

- 🔐 Google Authentication (NextAuth)
- 📅 Daily Habit Tracking
- ⚡ Aura Points System
- 🔥 Current & Longest Streak Tracking
- 📊 GitHub-style Heatmap Calendar
- 🏆 Leaderboard Ranking
- 📱 Fully Responsive UI
- 🌙 Forced Dark Theme (DaisyUI)
- 🚀 Optimized Server Components

---

# 🛠 Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Framework  | Next.js 14 (App Router) |
| Auth       | NextAuth (Google OAuth) |
| Database   | PostgreSQL (Neon)       |
| ORM        | Prisma                  |
| Styling    | TailwindCSS + DaisyUI   |
| Animation  | Framer Motion           |
| Deployment | Vercel                  |

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

# 🧱 Project Structure

```
app/
 ├── api/
 │    ├── auth/
 │    ├── habit/
 │    ├── leaderboard/
 │
 ├── components/
 │    ├── HabitCard.tsx
 │    ├── HabitList.tsx
 │    ├── StatsView.tsx
 │    ├── Leaderboard.tsx
 │
 ├── layout.tsx
 ├── page.tsx
```

---

# 🧠 Architecture Overview

## Habit Completion Flow

1. User clicks habit
2. PATCH `/api/habit/[id]`
3. Server:
   - Updates `habitCompletion`
   - Updates user `auraPoints`
   - Revalidates:
     - `/`
     - `/leaderboard`
     - `/stats`
4. UI updates optimistically

---

## Aura System

- Completing habit → +AURA_DELTA
- Skipping → penalty
- Leaderboard sorted by `auraPoints`
- Streaks computed from `habitCompletion`

---

# 📦 Production Deployment

## Deploy to Vercel

1. Push project to GitHub
2. Import into Vercel
3. Add Environment Variables
4. Deploy

---

## Setup Neon Database

1. Go to https://neon.tech
2. Create project
3. Copy connection string
4. Add to `DATABASE_URL` in Vercel

---

# ⚡ Performance Optimizations

- Server Components for habit rendering
- Optimistic UI updates
- Prisma transactions
- Path revalidation instead of full reload
- Dark theme locked to prevent hydration issues

---

# 🧪 Useful Commands

Generate Prisma client:

```bash
npx prisma generate
```

Reset database:

```bash
npx prisma migrate reset
```

Build project:

```bash
npm run build
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
