# Quick Start - Whacenter SaaS on Supabase

## 🚀 3-Minute Setup

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Save your database password!

### 2. Run SQL Script
1. Open **SQL Editor** in Supabase
2. Open file: [supabase_schema.sql](supabase_schema.sql)
3. Copy ALL content
4. Paste in SQL Editor
5. Click **Run**
6. ✅ 8 tables created!

### 3. Get Connection Strings
**Settings → Database → Connection String**

Copy these TWO strings:
- **Transaction mode** (port 6543)
- **Session mode** (port 5432)

### 4. Update .env
```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@...6543/postgres"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@...5432/postgres"
WHACENTER_API_KEY="your-api-key"
```

### 5. Install & Run
```bash
npm install
npx prisma generate
npm run dev
```

### 6. Open App
http://localhost:3000

**Register your account!**

---

## 📁 Files Overview

| File | Purpose |
|------|---------|
| **[supabase_schema.sql](supabase_schema.sql)** | Complete SQL to create all tables |
| **[SUPABASE_SQL_GUIDE.md](SUPABASE_SQL_GUIDE.md)** | Detailed SQL setup instructions |
| **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** | Step-by-step Supabase guide |
| **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** | Full deployment checklist |
| **[README.md](README.md)** | Main documentation |

---

## ✅ What You Get

**All Features Working:**
- ✅ Login/Register with JWT
- ✅ Dashboard with analytics
- ✅ Device management (WhatsApp pairing)
- ✅ Campaign broadcasting
- ✅ Campaign analytics
- ✅ Sequence automation
- ✅ Subscriber tracking

**Database:**
- ✅ 8 tables created
- ✅ All relationships configured
- ✅ Indexes for performance
- ✅ Auto-updating timestamps
- ✅ Cascade deletes

**Tech Stack:**
- Next.js 14 + TypeScript
- Supabase PostgreSQL
- Prisma ORM
- Tailwind CSS
- JWT Authentication
- Whacenter API

---

## 🎯 First Steps After Setup

1. **Register Account** → http://localhost:3000/login
2. **Add Device** → Devices page
3. **Create Campaign** → Campaigns page
4. **Build Sequence** → Sequences page
5. **View Analytics** → Dashboard

---

## 📊 Database Tables

1. **users** - Accounts
2. **devices** - WhatsApp devices
3. **campaigns** - Broadcast campaigns
4. **leads** - Campaign contacts
5. **messages** - Message queue
6. **sequences** - Automation sequences
7. **sequence_steps** - Sequence steps
8. **sequence_subscribers** - Enrolled users

---

## 🆘 Need Help?

**SQL Setup:** See [SUPABASE_SQL_GUIDE.md](SUPABASE_SQL_GUIDE.md)

**Full Setup:** See [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

**Deployment:** See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

**Issues:** https://github.com/aqilrvsb/whacenter-saas/issues

---

## 📍 Project Location

```
C:\Users\aqilz\Pictures\whacenter-saas
```

**GitHub:** https://github.com/aqilrvsb/whacenter-saas

---

Ready to broadcast! 🚀📱
