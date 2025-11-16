# Supabase Setup Guide for Whacenter SaaS

This guide will walk you through setting up your Whacenter SaaS application with Supabase PostgreSQL database.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - **Project Name**: whacenter-saas
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for it to finish (~2 minutes)

## Step 2: Get Database Connection Strings

1. In your Supabase project, go to **Settings** → **Database**
2. Scroll down to **Connection String** section
3. You need TWO connection strings:

### Transaction Mode (for DATABASE_URL):
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Session Mode (for DIRECT_URL):
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

## Step 3: Configure Environment Variables

1. Open `.env` file in your project root
2. Replace the connection strings with your actual Supabase URLs:

```env
# Supabase Database URLs
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# JWT Secret (keep as is or change)
JWT_SECRET="whacenter-saas-super-secret-jwt-key-2024-change-in-production"

# Whacenter API (get from your Whacenter account)
WHACENTER_API_URL="https://api.whacenter.com"
WHACENTER_API_KEY="your-actual-whacenter-api-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**IMPORTANT**: 
- Replace `[PROJECT-REF]`, `[PASSWORD]`, and `[REGION]` with your actual values
- Don't use quotes around special characters in password
- Keep `?pgbouncer=true` at the end of DATABASE_URL

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Generate Prisma Client

```bash
npx prisma generate
```

## Step 6: Push Database Schema

```bash
npx prisma db push
```

This will create all the tables in your Supabase database:
- users
- devices
- campaigns
- leads
- messages
- sequences
- sequence_steps
- sequence_subscribers

## Step 7: Verify Database Setup

1. Go to your Supabase project dashboard
2. Click on **Table Editor** (left sidebar)
3. You should see all 8 tables created!

## Step 8: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 9: Create Your First Account

1. Navigate to `/login`
2. Click "Register" tab
3. Enter your details:
   - Name
   - Email
   - Password
4. Click "Register"
5. You'll be automatically logged in to the dashboard!

## Database Schema Overview

### Tables:
1. **users** - User accounts and authentication
2. **devices** - WhatsApp devices connected via Whacenter
3. **campaigns** - Broadcast campaigns
4. **leads** - Campaign recipients/contacts
5. **messages** - Message queue and delivery tracking
6. **sequences** - Automated message sequences
7. **sequence_steps** - Individual steps in sequences
8. **sequence_subscribers** - Users enrolled in sequences

## Troubleshooting

### Error: "Can't reach database server"
- Check your DATABASE_URL is correct
- Verify password has no typos
- Ensure Supabase project is active

### Error: "relation does not exist"
- Run `npx prisma db push` again
- Check Supabase Table Editor to verify tables exist

### Error: "Invalid JWT"
- Clear browser localStorage
- Re-login to get a fresh token

### Connection Pool Errors
- Make sure DATABASE_URL uses port `6543` (Transaction mode)
- Make sure DIRECT_URL uses port `5432` (Session mode)

## Production Deployment

When deploying to production (Vercel, etc.):

1. Add all environment variables from `.env` to your hosting platform
2. Make sure to use the same Supabase connection strings
3. Change `NEXT_PUBLIC_APP_URL` to your production URL
4. Run `npx prisma generate` during build process
5. DO NOT run `npx prisma db push` in production (tables already exist)

## Supabase Dashboard Features

### View Data
- Go to **Table Editor** to see all your data
- Use **SQL Editor** to run custom queries

### Monitor Usage
- Go to **Reports** to see database usage
- Free tier: 500MB database, 2GB bandwidth

### Backups
- Supabase automatically backs up your database
- Point-in-time recovery available on paid plans

## Next Steps

1. ✅ Database setup complete
2. ✅ Tables created
3. ✅ App running
4. 🎯 Create your first device
5. 🎯 Create your first campaign
6. 🎯 Start broadcasting!

## Support

- Supabase Docs: https://supabase.com/docs
- Prisma Docs: https://www.prisma.io/docs
- GitHub Issues: https://github.com/aqilrvsb/whacenter-saas/issues

Happy broadcasting! 🚀
