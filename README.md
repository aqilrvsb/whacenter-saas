# Whacenter SaaS - WhatsApp Broadcasting Platform

A modern, full-stack WhatsApp broadcasting and automation platform built with Next.js 14, TypeScript, MySQL, and Prisma.

## Features

- **Device Management**: Connect and manage multiple WhatsApp devices via Whacenter API
- **Campaign Broadcasting**: Send bulk WhatsApp messages to leads with customizable delays
- **Automated Sequences**: Create multi-step message sequences with timed delivery
- **Real-time Analytics**: Track campaign performance, message delivery, and engagement
- **JWT Authentication**: Secure user authentication and authorization
- **Responsive UI**: Modern dashboard with WhatsApp-themed design

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **WhatsApp Integration**: Whacenter API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MySQL database server
- Whacenter API account and credentials

### Installation

1. **Clone the repository**
```bash
cd whacenter-saas
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/whacenter_saas"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Whacenter API
WHACENTER_API_URL="https://api.whacenter.com"
WHACENTER_API_KEY="your-whacenter-api-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Setup the database**

Create your MySQL database:
```bash
mysql -u root -p
CREATE DATABASE whacenter_saas;
exit;
```

Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Time Setup

1. Navigate to `/login` and create a new account
2. Login with your credentials
3. Add your first device via Whacenter pairing
4. Create campaigns and start broadcasting!

## Project Structure

```
whacenter-saas/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── devices/      # Device management
│   │   ├── campaigns/    # Campaign operations
│   │   ├── sequences/    # Sequence automation
│   │   └── dashboard/    # Analytics
│   ├── login/            # Login page
│   ├── dashboard/        # Main dashboard
│   ├── devices/          # Device management UI
│   ├── campaigns/        # Campaign management UI
│   ├── campaign-summary/ # Campaign analytics
│   ├── sequences/        # Sequence builder
│   └── sequence-summary/ # Sequence analytics
├── components/           # Reusable React components
├── lib/                  # Utilities and helpers
│   ├── prisma.ts        # Prisma client
│   ├── auth.ts          # Authentication utilities
│   ├── whacenter.ts     # Whacenter API client
│   └── api.ts           # Axios instance
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static files
```

## Database Schema

- **Users**: User accounts and authentication
- **Devices**: WhatsApp device connections
- **Campaigns**: Broadcast campaigns
- **Leads**: Campaign contacts
- **Messages**: Message queue and delivery tracking
- **Sequences**: Automated message sequences
- **SequenceSteps**: Individual sequence steps
- **SequenceSubscribers**: Sequence enrollment tracking

## API Documentation

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Devices
- `GET /api/devices` - List all devices
- `POST /api/devices` - Add new device
- `GET /api/devices/:id` - Get device details
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/start` - Start campaign broadcast

### Sequences
- `GET /api/sequences` - List all sequences
- `POST /api/sequences` - Create new sequence
- `GET /api/sequences/:id` - Get sequence details
- `PUT /api/sequences/:id` - Update sequence
- `DELETE /api/sequences/:id` - Delete sequence

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `WHACENTER_API_URL` | Whacenter API base URL | Yes |
| `WHACENTER_API_KEY` | Whacenter API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | No |

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Development

```bash
# Run development server
npm run dev

# Run linting
npm run lint

# Format Prisma schema
npx prisma format

# View database in Prisma Studio
npx prisma studio
```

## Features Breakdown

### 1. Device Management
- Pair WhatsApp devices via Whacenter API
- Monitor connection status in real-time
- Configure message delay intervals
- QR code pairing interface

### 2. Campaign Broadcasting
- Bulk message sending to lead lists
- CSV/text import for leads
- Randomized delays between messages
- Real-time progress tracking
- Delivery status monitoring

### 3. Sequence Automation
- Multi-step message sequences
- Configurable time delays between steps
- Subscriber management
- Progress tracking per subscriber

### 4. Analytics Dashboard
- Overview statistics
- Campaign performance metrics
- Message delivery rates
- Device connection status

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify DATABASE_URL is correct
- Check database user permissions

### Whacenter API Errors
- Verify API key is valid
- Check device connection status
- Ensure phone numbers are formatted correctly

### Build Errors
- Delete `.next` folder and rebuild
- Clear node_modules and reinstall
- Check Node.js version (18+ required)

## Security Considerations

- Change JWT_SECRET in production
- Use strong passwords for database
- Enable HTTPS in production
- Rotate API keys regularly
- Implement rate limiting for APIs

## License

Private - All rights reserved

## Support

For issues and questions, please contact the development team.
