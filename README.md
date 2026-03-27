# Komute - Smart Commuter Ride-Sharing Platform

<div align="center">
  <img src="/public/images/komute-image/komute-logo/komute-logo-trans.png" alt="Komute Logo" width="200"/>
  
  **Smart Journeys, Simplified.**

A modern ride-sharing platform for daily commuters in Lagos, Nigeria. Connect with verified drivers on your route, share rides, and save money.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue)](https://prisma.io)

</div>

---

## 🎯 Overview

Komute is a comprehensive ride-sharing platform designed for the Nigerian market, featuring:

- **Dual Payment System**: Integrated Paystack and Interswitch payment gateways for seamless transactions
- **Smart Booking System**: Real-time ride discovery with conflict detection to prevent double-bookings
- **Wallet System**: Full wallet functionality with fund, withdraw, transfer, and transaction history
- **Time-Based Refunds**: Automated refund calculations based on cancellation timing
- **Verification System**: NIN and driver verification for safety
- **Savings Tracker**: Analytics dashboard comparing costs vs traditional transport

---

## ✨ Features

### For Riders

- 🔍 **Ride Discovery**: Search and filter available rides by route and date
- 📱 **Easy Booking**: Book seats with secure payment integration
- 💰 **Savings Dashboard**: Track your savings compared to Bolt/taxi rides
- 👤 **Profile Management**: View your profile, ratings, and booking history
- 🔄 **Booking Cancellation**: Cancel bookings with automatic refund calculations

### For Drivers

- 🚗 **Ride Management**: Create, view, and manage your offered rides
- 💹 **Earnings Tracker**: Monitor your earnings and available balance
- 📊 **Dashboard**: Overview of active rides, bookings, and earnings
- 🛡️ **Verification**: Complete driver verification (license, vehicle, bank account)

### Payment & Wallet

- 💳 **Dual Payment Gateways**: Paystack and Interswitch inline checkout
- 👛 **Wallet System**:
  - Fund wallet via bank transfer or card
  - Withdraw to any Nigerian bank
  - Instant transfers to other Komute users
  - Complete transaction history with filters
- 💸 **Automatic Refunds**: Time-based refund policy on cancellations:
  - 24+ hours before: 100% refund
  - 6-24 hours: 75% refund
  - 2-6 hours: 50% refund
  - Under 2 hours: 25% refund

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16.2 (App Router)
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui + Radix UI primitives
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand
- **Maps**: Google Maps React

### Backend

- **API**: Next.js API Routes
- **Database**: PostgreSQL (Neon Database)
- **ORM**: Prisma
- **Authentication**: JWT (jose library) with session management

### Integrations

- **Payments**:
  - Paystack API
  - Interswitch WebPAY
- **OTP Delivery**:
  - Interswitch WhatsApp OTP
  - Nodemailer for email OTP

---

## 📁 Project Structure

```
komute/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication pages (login, OTP)
│   │   ├── (dashboard)/      # Dashboard pages
│   │   │   ├── driver/       # Driver dashboard
│   │   │   │   ├── earnings/
│   │   │   │   ├── profile/
│   │   │   │   └── rides/
│   │   │   └── rider/        # Rider dashboard
│   │   │       ├── bookings/
│   │   │       ├── profile/
│   │   │       └── savings/
│   │   ├── api/              # API routes
│   │   │   ├── auth/        # Authentication APIs
│   │   │   ├── banks/       # Bank list API
│   │   │   ├── bookings/     # Booking APIs
│   │   │   ├── rides/       # Ride APIs
│   │   │   └── wallet/       # Wallet APIs
│   │   ├── layout.tsx
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── bookings/         # Booking components
│   │   ├── home/            # Landing page components
│   │   ├── layout/          # Layout components
│   │   ├── payments/        # Payment button components
│   │   ├── profile/         # Profile components
│   │   └── wallet/          # Wallet dialog components
│   ├── lib/
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── email.ts         # Email OTP sender
│   │   ├── interswitch.ts   # Interswitch API helpers
│   │   ├── paystack.ts      # Paystack API helpers
│   │   ├── prisma.ts        # Prisma client
│   │   ├── utils.ts         # Utility functions
│   │   ├── validations/     # Zod schemas
│   │   ├── wallet.ts        # Wallet operations
│   │   ├── booking-conflicts.ts  # Booking conflict detection
│   │   └── refund-policy.ts     # Refund calculations
│   └── generated/           # Prisma generated types
├── public/
│   └── images/              # Static images
├── .env                     # Environment variables
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or cloud like Neon)
- Paystack account (for payment processing)
- Interswitch merchant account (for payment processing)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Interswitch Payment
CLIENT_ID="your_interswitch_client_id"
CLIENT_SECRET="your_interswitch_client_secret"
ISW_MERCHANT_CODE="your_merchant_code"
NEXT_PUBLIC_ISW_MERCHANT_CODE="your_merchant_code"
NEXT_PUBLIC_ISW_PAY_ITEM_ID="your_pay_item_id"

# Paystack Payment
PAYSTACK_SECRET_KEY="your_paystack_secret_key"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="your_paystack_public_key"

# Email (for OTP)
SMTP_EMAIL="your@email.com"
SMTP_PASSWORD="your_smtp_password"

# Authentication
NEXTAUTH_SECRET="your_jwt_secret"
```

### Installation

```bash
# Clone the repository
git clone https://github.com/crux-africa/komute.git
cd komute

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

```bash
# Push schema to database
npx prisma db push

# (Optional) Seed the database with sample data
npx prisma db seed
```

---

## 📱 User Flows

### Authentication

1. User enters phone number on login page
2. OTP is sent via WhatsApp (Interswitch) or Email (fallback)
3. User enters 6-digit OTP to verify
4. New users are redirected to onboarding

### Booking a Ride (Rider)

1. Search for rides by selecting pickup and destination areas
2. Browse available rides with driver info, price, and departure time
3. Select number of seats and proceed to payment
4. Choose payment method (Paystack or Interswitch)
5. Complete payment and receive booking confirmation
6. View booking in "My Bookings" with cancel option

### Creating a Ride (Driver)

1. Navigate to "Create Ride" from driver dashboard
2. Enter pickup and destination areas
3. Set departure time, vehicle type, and number of seats
4. Set price per seat (minimum ₦100)
5. Add optional notes about the ride
6. Publish ride for riders to discover

### Wallet Operations

1. **Fund Wallet**: Select amount → Choose Paystack/Interswitch → Complete payment
2. **Withdraw**: Enter amount → Select bank → Receive transfer
3. **Transfer**: Enter recipient's phone → Enter amount → Confirm transfer
4. **View History**: Filter transactions by type, status, or date range

---

## 🔒 Security Features

- JWT-based session authentication
- HTTP-only cookies for session storage
- Database session validation (revocable sessions)
- NIN verification for user identity
- Driver verification (license, vehicle, bank account)
- Payment verification on server-side
- Rate limiting on OTP requests (3 per 10 minutes)

---

## 💳 Payment Integration

### Paystack

- Inline checkout popup
- Server-side payment verification
- Support for all Nigerian banks
- Automatic bank list fetching with caching

### Interswitch WebPAY

- Inline checkout for Interswitch payments
- Server-side verification
- WhatsApp OTP delivery
- Transfer API for withdrawals

---

## 📊 API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP to phone/email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/logout` - Logout and clear session

### Rides

- `GET /api/rides` - List available rides
- `POST /api/rides` - Create new ride
- `GET /api/rides/[id]` - Get ride details

### Bookings

- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create booking
- `POST /api/bookings/[id]/cancel` - Cancel booking with refund

### Wallet

- `GET /api/wallet` - Get wallet and analytics
- `POST /api/wallet/fund` - Initiate wallet funding
- `POST /api/wallet/withdraw` - Withdraw to bank
- `POST /api/wallet/transfer` - Transfer to another user
- `GET /api/wallet/transactions` - Get transaction history

### Utilities

- `GET /api/banks` - Get Nigerian banks list

---

## 🎨 Design System

### Colors

- **Forest**: Primary brand color (#1B4332)
- **Amber**: Accent/CTA color (#F59E0B)
- **Terra**: Success/positive actions (#10B981)
- **Background**: Light mode (#FAFAF8) / Dark mode (#0A0A0A)

### Typography

- **Font**: Montserrat (Google Fonts)
- **Headings**: font-heading class
- **Body**: font-body class

---

**Tech Stack**:

- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Prisma](https://prisma.io)
- [Paystack](https://paystack.com)
- [Interswitch](https://interswitchgroup.com)

---

## 📄 License

This project is private and proprietary.

---

<div align="center">
  <p>Made with ❤️ for Komute</p>
  <p>© 2026 Komute. All rights reserved.</p>
</div>
