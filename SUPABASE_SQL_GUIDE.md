# Supabase SQL Editor Setup Guide

## Quick Setup - Run SQL Directly in Supabase

Instead of using Prisma commands, you can create all tables directly in Supabase SQL Editor.

## Step-by-Step Instructions

### Step 1: Login to Supabase
1. Go to https://supabase.com
2. Login to your account
3. Select your project (or create a new one)

### Step 2: Open SQL Editor
1. In your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 3: Run the Schema
1. Open the file: `supabase_schema.sql`
2. Copy **ALL** the SQL code
3. Paste into the Supabase SQL Editor
4. Click **Run** button (or press Ctrl+Enter)

### Step 4: Verify Tables Created
After running the script, you should see:
```
Success. No rows returned
```

Then verify tables were created:
1. Click **Table Editor** in left sidebar
2. You should see 8 tables:
   - users
   - devices
   - campaigns
   - leads
   - messages
   - sequences
   - sequence_steps
   - sequence_subscribers

### Step 5: Get Connection Strings
1. Go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Copy **Transaction mode** (for DATABASE_URL)
4. Copy **Session mode** (for DIRECT_URL)

### Step 6: Update .env File
Open `.env` in your project and update:

```env
# Transaction mode (port 6543) - for connection pooling
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Session mode (port 5432) - for direct connections
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Keep as is
JWT_SECRET="whacenter-saas-super-secret-jwt-key-2024-change-in-production"

# Add your actual Whacenter API key
WHACENTER_API_URL="https://api.whacenter.com"
WHACENTER_API_KEY="your-actual-api-key"

# Keep as is for local development
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**IMPORTANT:**
- Replace `[PROJECT-REF]` with your actual project reference
- Replace `[YOUR-PASSWORD]` with your database password
- Replace `[REGION]` with your region (e.g., ap-southeast-1)
- Get these from Supabase Settings → Database → Connection String

### Step 7: Generate Prisma Client
Open terminal in your project folder:

```bash
# Generate Prisma client (connects to your Supabase database)
npx prisma generate
```

You should see:
```
✔ Generated Prisma Client to .\node_modules\@prisma\client in XXXms
```

**Note:** You do NOT need to run `npx prisma db push` because we already created tables via SQL!

### Step 8: Run the Application
```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

### Step 9: Test Everything
1. **Register Account:**
   - Go to http://localhost:3000/login
   - Click "Register" tab
   - Enter: Name, Email, Password
   - Click Register
   - ✅ Should redirect to dashboard

2. **Verify Database:**
   - Go back to Supabase Table Editor
   - Click on "users" table
   - ✅ You should see your newly registered user!

3. **Test All Pages:**
   - ✅ Dashboard - See stats
   - ✅ Devices - Add device
   - ✅ Campaigns - Create campaign
   - ✅ Campaign Summary - View analytics
   - ✅ Sequences - Build sequence
   - ✅ Sequence Summary - Track subscribers

## Database Schema Overview

### Tables Created:

**1. users** - User accounts
- id (UUID, Primary Key)
- email (unique)
- password (hashed)
- name
- createdAt, updatedAt

**2. devices** - WhatsApp devices
- id (UUID, Primary Key)
- userId (Foreign Key → users)
- whacenterDeviceId (unique)
- status (connected/disconnected/pairing)
- qrCode
- minDelaySeconds, maxDelaySeconds
- createdAt, updatedAt

**3. campaigns** - Broadcast campaigns
- id (UUID, Primary Key)
- userId (Foreign Key → users)
- deviceId (Foreign Key → devices)
- title, message
- status (draft/active/paused/completed)
- totalLeads, sentCount, failedCount
- createdAt, updatedAt

**4. leads** - Campaign contacts
- id (UUID, Primary Key)
- campaignId (Foreign Key → campaigns)
- phone, name
- data (JSON string)
- createdAt, updatedAt

**5. messages** - Message queue
- id (UUID, Primary Key)
- deviceId (Foreign Key → devices)
- campaignId (Foreign Key → campaigns, nullable)
- phone, message
- status (pending/sent/failed)
- error, sentAt
- createdAt, updatedAt

**6. sequences** - Automated sequences
- id (UUID, Primary Key)
- userId (Foreign Key → users)
- name, description
- status (draft/active/paused)
- createdAt, updatedAt

**7. sequence_steps** - Sequence steps
- id (UUID, Primary Key)
- sequenceId (Foreign Key → sequences)
- stepNumber
- message
- delayHours
- createdAt, updatedAt

**8. sequence_subscribers** - Sequence enrollment
- id (UUID, Primary Key)
- sequenceId (Foreign Key → sequences)
- phone
- currentStep
- status (active/paused/completed/unsubscribed)
- lastMessageAt
- createdAt, updatedAt

## Features Included

### Indexes for Performance:
- Email lookup (users)
- User relationships (devices, campaigns, sequences)
- Phone number searches (leads, messages, subscribers)
- Status filtering (campaigns, messages, sequences)

### Automatic Timestamps:
- All tables have triggers that automatically update `updatedAt`
- `createdAt` is set on insert

### Foreign Key Cascades:
- Delete user → deletes all devices, campaigns, sequences
- Delete device → deletes all messages, campaigns
- Delete campaign → deletes all leads, messages
- Delete sequence → deletes all steps, subscribers

### Constraints:
- Unique emails
- Unique device IDs
- Required fields enforced
- Data integrity maintained

## Troubleshooting

### Error: "Extension uuid-ossp does not exist"
**Solution:** The script creates it automatically. If error persists:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "Table already exists"
**Solution:** Tables are created with `IF NOT EXISTS`. If you want to start fresh:
```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS sequence_subscribers CASCADE;
DROP TABLE IF EXISTS sequence_steps CASCADE;
DROP TABLE IF EXISTS sequences CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then run supabase_schema.sql again
```

### Error: "Cannot connect to database"
**Solution:**
- Verify .env has correct connection strings
- Check Supabase project is active
- Ensure password has no typos

### Prisma Generate Fails
**Solution:**
```bash
# Delete generated client
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# Reinstall
npm install @prisma/client
npx prisma generate
```

## Verification Queries

Run these in Supabase SQL Editor to verify everything:

### Check all tables exist:
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'devices', 'campaigns', 'leads',
    'messages', 'sequences', 'sequence_steps', 'sequence_subscribers'
)
ORDER BY tablename;
```

Should return 8 rows.

### Count records in each table:
```sql
SELECT
    'users' as table_name, COUNT(*) as records FROM users
UNION ALL
SELECT 'devices', COUNT(*) FROM devices
UNION ALL
SELECT 'campaigns', COUNT(*) FROM campaigns
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'sequences', COUNT(*) FROM sequences
UNION ALL
SELECT 'sequence_steps', COUNT(*) FROM sequence_steps
UNION ALL
SELECT 'sequence_subscribers', COUNT(*) FROM sequence_subscribers;
```

### View all indexes:
```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Next Steps After Setup

1. ✅ Database tables created
2. ✅ Connection strings configured
3. ✅ Prisma client generated
4. ✅ App running
5. 🎯 Register your first account
6. 🎯 Add WhatsApp device
7. 🎯 Create first campaign
8. 🎯 Start broadcasting!

## Benefits of SQL Editor Method

✅ **Faster** - No need for Prisma migrations
✅ **Direct control** - See exactly what's created
✅ **Better for troubleshooting** - Can query directly
✅ **Supabase native** - Works perfectly with Supabase features
✅ **Idempotent** - Safe to run multiple times
✅ **Full control** - Add custom indexes, triggers, functions

## Production Deployment

Once tested locally, the same database works for production:

1. Push code to GitHub
2. Deploy to Vercel
3. Add same DATABASE_URL and DIRECT_URL to Vercel environment variables
4. Deploy!

The database is already set up - no need to run migrations in production!

## Support

- Supabase Docs: https://supabase.com/docs/guides/database
- GitHub: https://github.com/aqilrvsb/whacenter-saas
- SQL File: `supabase_schema.sql`

---

**You're all set!** 🚀 Your Whacenter SaaS is now running on Supabase PostgreSQL!
