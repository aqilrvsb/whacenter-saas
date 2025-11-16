-- =====================================================
-- Whacenter SaaS - Complete Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- 2. DEVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    "whacenterDeviceId" VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'disconnected',
    "qrCode" TEXT,
    "minDelaySeconds" INTEGER NOT NULL DEFAULT 3,
    "maxDelaySeconds" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_device_user FOREIGN KEY ("userId")
        REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_devices_userId ON devices("userId");
CREATE INDEX IF NOT EXISTS idx_devices_whacenterDeviceId ON devices("whacenterDeviceId");

-- =====================================================
-- 3. CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_campaign_user FOREIGN KEY ("userId")
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_campaign_device FOREIGN KEY ("deviceId")
        REFERENCES devices(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_userId ON campaigns("userId");
CREATE INDEX IF NOT EXISTS idx_campaigns_deviceId ON campaigns("deviceId");
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- =====================================================
-- 4. LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "campaignId" UUID NOT NULL,
    phone VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    data TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lead_campaign FOREIGN KEY ("campaignId")
        REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_campaignId ON leads("campaignId");
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);

-- =====================================================
-- 5. MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "deviceId" UUID NOT NULL,
    "campaignId" UUID,
    phone VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_message_device FOREIGN KEY ("deviceId")
        REFERENCES devices(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_campaign FOREIGN KEY ("campaignId")
        REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_deviceId ON messages("deviceId");
CREATE INDEX IF NOT EXISTS idx_messages_campaignId ON messages("campaignId");
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_phone ON messages(phone);

-- =====================================================
-- 6. SEQUENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sequence_user FOREIGN KEY ("userId")
        REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sequences_userId ON sequences("userId");
CREATE INDEX IF NOT EXISTS idx_sequences_status ON sequences(status);

-- =====================================================
-- 7. SEQUENCE_STEPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sequence_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sequenceId" UUID NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    message TEXT NOT NULL,
    "delayHours" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_step_sequence FOREIGN KEY ("sequenceId")
        REFERENCES sequences(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sequence_steps_sequenceId ON sequence_steps("sequenceId");
CREATE INDEX IF NOT EXISTS idx_sequence_steps_stepNumber ON sequence_steps("stepNumber");

-- =====================================================
-- 8. SEQUENCE_SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sequence_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sequenceId" UUID NOT NULL,
    phone VARCHAR(50) NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_subscriber_sequence FOREIGN KEY ("sequenceId")
        REFERENCES sequences(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sequence_subscribers_sequenceId ON sequence_subscribers("sequenceId");
CREATE INDEX IF NOT EXISTS idx_sequence_subscribers_phone ON sequence_subscribers(phone);
CREATE INDEX IF NOT EXISTS idx_sequence_subscribers_status ON sequence_subscribers(status);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON sequences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sequence_steps_updated_at BEFORE UPDATE ON sequence_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sequence_subscribers_updated_at BEFORE UPDATE ON sequence_subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count tables created
SELECT
    COUNT(*) as total_tables,
    STRING_AGG(tablename, ', ' ORDER BY tablename) as table_names
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'devices', 'campaigns', 'leads',
    'messages', 'sequences', 'sequence_steps', 'sequence_subscribers'
);

-- Show all tables with row counts
SELECT
    schemaname,
    tablename,
    (xpath('/row/cnt/text()',
        query_to_xml(format('select count(*) as cnt from %I.%I',
        schemaname, tablename), false, true, '')))[1]::text::int AS row_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'devices', 'campaigns', 'leads',
    'messages', 'sequences', 'sequence_steps', 'sequence_subscribers'
)
ORDER BY tablename;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Whacenter SaaS Database Setup Complete!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Tables Created:';
    RAISE NOTICE '  1. users';
    RAISE NOTICE '  2. devices';
    RAISE NOTICE '  3. campaigns';
    RAISE NOTICE '  4. leads';
    RAISE NOTICE '  5. messages';
    RAISE NOTICE '  6. sequences';
    RAISE NOTICE '  7. sequence_steps';
    RAISE NOTICE '  8. sequence_subscribers';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Update your .env with Supabase connection strings';
    RAISE NOTICE '  2. Run: npm install';
    RAISE NOTICE '  3. Run: npx prisma generate';
    RAISE NOTICE '  4. Run: npm run dev';
    RAISE NOTICE '  5. Visit: http://localhost:3000';
    RAISE NOTICE '================================================';
END $$;
