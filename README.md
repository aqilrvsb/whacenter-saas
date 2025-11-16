# Whacenter SaaS - WhatsApp Broadcasting Platform

A modern, full-stack WhatsApp broadcasting and automation platform built with Next.js 14, TypeScript, **Supabase PostgreSQL**, and Prisma.

## Features

- Device Management - Connect and manage multiple WhatsApp devices via Whacenter API
- Campaign Broadcasting - Send bulk WhatsApp messages to leads with customizable delays
- Automated Sequences - Create multi-step message sequences with timed delivery
- Real-time Analytics - Track campaign performance, message delivery, and engagement
- JWT Authentication - Secure user authentication and authorization
- Responsive UI - Modern dashboard with WhatsApp-themed design

## Tech Stack

- Frontend: Next.js 14 (App Router), React 18, TypeScript
- Backend: Next.js API Routes
- Database: **Supabase PostgreSQL** with Prisma ORM
- Authentication: JWT with bcryptjs
- Styling: Tailwind CSS
- Icons: Lucide React
- WhatsApp Integration: Whacenter API

## Quick Start with Supabase

### 1. Clone and Install
```bash
git clone https://github.com/aqilrvsb/whacenter-saas.git
cd whacenter-saas
npm install
```

### 2. Setup Supabase
See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

Quick steps:
1. Create project at https://supabase.com
2. Get connection strings from Settings → Database
3. Update `.env` with your Supabase credentials

### 3. Configure Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run
```bash
npm run dev
```

Visit http://localhost:3000 and register your account!

## Project Structure
- `app/api/` - API routes (auth, devices, campaigns, sequences, dashboard)
- `app/` - Next.js pages (login, dashboard, devices, campaigns, sequences)
- `components/` - Reusable UI components
- `lib/` - Core utilities (prisma, auth, whacenter, middleware)
- `prisma/` - Database schema

## Environment Variables
```env
DATABASE_URL="postgresql://..." # Supabase Transaction mode (port 6543)
DIRECT_URL="postgresql://..."   # Supabase Session mode (port 5432)
JWT_SECRET="your-secret"
WHACENTER_API_URL="https://api.whacenter.com"
WHACENTER_API_KEY="your-key"
```

## Pages Overview

- **/login** - Authentication (register/login)
- **/dashboard** - Analytics and quick actions
- **/devices** - WhatsApp device management + QR pairing
- **/campaigns** - Create and manage broadcast campaigns
- **/campaign-summary** - Campaign performance analytics
- **/sequences** - Build automated message sequences
- **/sequence-summary** - Subscriber tracking

## API Endpoints

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

**Devices:** `GET|POST /api/devices`, `GET|PUT|DELETE /api/devices/:id`

**Campaigns:** `GET|POST /api/campaigns`, `GET|PUT|DELETE /api/campaigns/:id`, `POST /api/campaigns/:id/start`

**Sequences:** `GET|POST /api/sequences`, `GET|PUT|DELETE /api/sequences/:id`

**Dashboard:** `GET /api/dashboard/stats`

## Deployment

### Vercel
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

Build command: `npx prisma generate && npm run build`

## Documentation

- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Detailed Supabase setup guide
- [SETUP.md](SETUP.md) - Quick setup instructions

## Troubleshooting

**Database errors:** Verify Supabase connection strings, run `npx prisma db push`

**Build errors:** Delete `.next` and `node_modules`, reinstall and rebuild

## Support

GitHub Issues: https://github.com/aqilrvsb/whacenter-saas/issues

## License

Private - All rights reserved

Built with Next.js, Supabase, and Whacenter API
