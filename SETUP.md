# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- MySQL server running
- Whacenter API credentials

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env` file with your settings:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/whacenter_saas"
JWT_SECRET="your-secret-key-here"
WHACENTER_API_KEY="your-whacenter-api-key"
```

### 3. Setup Database
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE whacenter_saas;"

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000 and register your first account!

## Production Build

```bash
npm run build
npm start
```

## Common Issues

**Database Connection Error:**
- Check MySQL is running
- Verify DATABASE_URL credentials
- Ensure database exists

**Whacenter API Error:**
- Verify API key is correct
- Check API URL is accessible

**Port Already in Use:**
```bash
# Use different port
PORT=3001 npm run dev
```

## Features Overview

1. **Login/Register** - Create your account at `/login`
2. **Dashboard** - View stats and quick actions
3. **Devices** - Add and manage WhatsApp devices
4. **Campaigns** - Create broadcast campaigns
5. **Sequences** - Build automated message flows
6. **Analytics** - Track performance metrics

## Next Steps

1. Register a new account
2. Add your first device
3. Pair with WhatsApp via QR code
4. Create a test campaign
5. Start broadcasting!

For detailed documentation, see [README.md](README.md)
