<div align="center">

# 🛠️ Support Team Manager

**A modern, real-time support scheduling app for teams.**

Built with Next.js 16 · Supabase · Tailwind CSS · PWA

[![Live Demo](https://img.shields.io/badge/Live-software--support--app.vercel.app-00a0e9?style=for-the-badge&logo=vercel&logoColor=white)](https://software-support-app.vercel.app)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📅 **Interactive Calendar** | Month-view calendar with day-level support assignments visible at a glance |
| 👥 **Team Roster** | Manage team members with roles (SW / QA), phone numbers & admin privileges |
| 🔒 **Admin-Only Editing** | Only users flagged as admin can assign shifts, add/edit/remove members |
| 📱 **Quick Contact** | One-tap call & WhatsApp buttons for each on-duty team member |
| 🔁 **Recurring Assignments** | Assign support for up to 12 weeks in a single action |
| 📲 **PWA / Installable** | Add to home screen on mobile — works offline with service worker caching |
| 🔐 **Row-Level Security** | Supabase RLS ensures data safety even if the client is tampered with |
| 🌗 **Responsive Design** | Polished UI that adapts seamlessly from mobile to desktop |

---

## 🖼️ Screenshots

| Calendar View | Support Cards |
|:---:|:---:|
| Browse the month, tap any day to see who's on duty | At-a-glance cards showing name, hours, call & WhatsApp |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| **Date Utilities** | [date-fns](https://date-fns.org/) |
| **Icons** | [react-icons](https://react-icons.github.io/react-icons/) (Font Awesome) |
| **Hosting** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider & PWA meta
│   ├── page.tsx            # Main page — calendar, cards, roster
│   └── globals.css         # Theme variables & global styles
├── components/
│   ├── Header.tsx          # Top bar with auth controls
│   ├── CalendarGrid.tsx    # Month calendar with availability dots
│   ├── TopSupportCards.tsx # Selected-day support member cards
│   ├── TeamRoster.tsx      # Full team list with quick actions
│   ├── AssignModal.tsx     # Assign members + repeat-weeks picker
│   ├── TeamMemberModal.tsx # Add / edit member form
│   ├── LoginModal.tsx      # Sign in / sign up modal
│   └── ServiceWorkerRegistrar.tsx
├── context/
│   └── AuthContext.tsx     # Auth state, role checks, sign-in/up/out
├── lib/
│   ├── supabase.ts         # Singleton Supabase client
│   └── calendar.ts         # Shared calendar range utility
└── types/
    └── index.ts            # TeamMember & DailyAvailability types
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- A **Supabase** project (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/software-support-app.git
cd software-support-app
npm install
```

### 2. Configure environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional — restrict signup to a specific email domain
# NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=yourcompany.com
```

### 3. Set up the database

Open the **Supabase SQL Editor** and run the contents of [`supabase-schema.sql`](supabase-schema.sql).  
This creates the tables, indexes, RLS policies, helper functions, and seeds the first admin user.

### 4. Run locally

```bash
npm run dev
```

Open **http://localhost:3000** — you're all set!

---

## 🔐 Security

The app is hardened for production use:

- **Content Security Policy** — restricts script/style/connect sources
- **HSTS** — enforces HTTPS with a 2-year max-age
- **X-Frame-Options: DENY** — prevents clickjacking
- **Row-Level Security** — Supabase RLS policies enforce admin-only writes at the database level
- **Service Worker hardening** — API/auth responses are never cached
- **Password policy** — minimum 8 characters with uppercase, lowercase & digit
- **Domain-restricted signup** — optional `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` env var
- **Mutation error handling** — all database writes surface errors to the user

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build locally |
| `npm run lint` | Run ESLint |

---

## 🌐 Deployment

The app is deployed on **Vercel** with zero configuration:

```bash
npx vercel --prod
```

Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) must be set in the Vercel project settings.

---

## 📄 License

This project is private and not licensed for redistribution.

---

<div align="center">

Made with ☕ and TypeScript

</div>
