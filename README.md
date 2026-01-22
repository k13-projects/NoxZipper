# NOXZIPPER Dashboard

Internal web dashboard for NOXZIPPER Kitchen Exhaust Hood Cleaning business. This MVP application helps manage customers, schedule jobs, track revenue splits, and handle service documentation.

## Features

- **Dashboard**: KPI cards showing customers, jobs, revenue, and split totals
- **Customer Management**: Full CRUD with auto-generated service schedules
- **Job Management**: Track jobs with status, pricing, and revenue splits (80/10/10)
- **Calendar View**: Month view of all scheduled jobs with color-coded statuses
- **File Attachments**: Upload before/after photos, invoices, and service reports
- **Calculator**: Revenue split calculator and annual projection tool
- **Email Integration**: Email customers directly with copy-to-clipboard fallback

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui patterns
- **Database**: SQLite + Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Calendar**: FullCalendar

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd NoxZipper
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env file is pre-configured for development
# Update these values for production:
# - NEXTAUTH_SECRET (generate a secure random string)
# - DATABASE_URL (path to SQLite database)
```

4. Initialize the database:
```bash
npm run db:migrate
```

5. Seed the database with demo data:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

- **Email**: `admin@noxzipper.com`
- **Password**: `admin123`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── customers/     # Customer CRUD
│   │   ├── jobs/          # Job CRUD
│   │   ├── schedule/      # Schedule generation
│   │   ├── stats/         # Dashboard statistics
│   │   └── upload/        # File uploads
│   ├── calendar/          # Calendar page
│   ├── calculator/        # Calculator tool
│   ├── customers/         # Customer pages
│   ├── jobs/              # Job pages
│   └── login/             # Auth page
├── components/            # React components
│   ├── forms/             # Form components
│   └── ui/                # UI components (shadcn-style)
└── lib/                   # Utilities and configuration
    ├── auth.ts            # NextAuth config
    ├── prisma.ts          # Prisma client
    ├── schedule-generator.ts  # Job scheduling logic
    ├── types.ts           # Type definitions
    └── utils.ts           # Helper functions

prisma/
├── schema.prisma          # Database schema
├── migrations/            # Database migrations
└── seed.ts               # Seed script

uploads/                   # Local file storage
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with demo data
npm run db:studio    # Open Prisma Studio
```

## Revenue Split Model

The business uses an 80/10/10 revenue split:
- **Operator (Baha)**: 80% - covers labor, chemicals, and operational expenses
- **Admin (Kazim)**: 10% - platform management and coordination
- **Sales (Eren)**: 10% - customer acquisition and relationship management

## Service Frequencies

- **Quarterly**: 4 services per year (every ~3 months)
- **Semiannual**: 2 services per year (every ~6 months)
- **Custom**: User-defined interval in days

## Database Schema

### Customer
- Restaurant name, address, contact info
- Hood length, service frequency
- Assigned operator and sales partner

### Job
- Scheduled date, status (Scheduled/Completed/Invoiced/Cancelled)
- Price with auto-calculated revenue splits
- Completion timestamp and notes

### Attachment
- Before/after photos
- Invoice PDFs
- Service report PDFs

## Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Admin credentials (for seeding)
ADMIN_EMAIL="admin@noxzipper.com"
ADMIN_PASSWORD="admin123"

# SMTP (optional)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM=""
```

## API Endpoints

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/:id` - Regenerate schedule

### Jobs
- `GET /api/jobs` - List jobs (with filters)
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Other
- `GET /api/stats` - Dashboard statistics
- `POST /api/schedule` - Generate schedules for all customers
- `POST /api/upload` - Upload file attachment
- `DELETE /api/upload/:id` - Delete attachment

## License

Private - Internal use only
