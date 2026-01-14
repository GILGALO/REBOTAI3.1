# AI M5 Trading Signal Bot

## Overview

A professional trading signal generator application that provides real-time buy/sell signals for forex pairs across Asian, London, and New York market sessions. The application features automatic and manual signal generation with 5-minute (M5) timeframe analysis, Telegram notifications, and a modern dashboard interface for monitoring trading signals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for smooth transitions
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints defined in shared route contracts (`shared/routes.ts`)
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - defines signals and settings tables
- **Migrations**: Drizzle Kit for schema push (`npm run db:push`)

### Key Design Patterns
1. **Shared Type Safety**: Schema and API route definitions in `shared/` directory are used by both frontend and backend
2. **Contract-First API**: Routes defined with Zod schemas for input/output validation
3. **Monorepo Structure**: Client code in `client/`, server in `server/`, shared types in `shared/`

### Application Features
- **Signal Generation**: Technical analysis on M5 timeframe using Finnhub market data
- **Market Sessions**: Supports Asian, London, and New York trading sessions
- **Auto/Manual Modes**: Configurable automatic signal generation or on-demand
- **Real-time Updates**: Frontend polls for new signals every 10 seconds

## External Dependencies

### Market Data
- **Finnhub API**: Real-time forex candle data for technical analysis
  - Requires `FINNHUB_API_KEY` environment variable
  - Fetches 5-minute candle data for signal generation

### Database
- **PostgreSQL**: Primary data store
  - Requires `DATABASE_URL` environment variable
  - Tables: `signals` (trading signals), `settings` (bot configuration)

### Optional Integrations
- **Telegram Bot API**: For sending signal notifications
  - Configurable via settings UI
  - Requires bot token and chat ID

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod`: Database ORM and schema validation
- `@tanstack/react-query`: Server state management
- `express` / `express-session`: HTTP server and sessions
- `zod`: Runtime type validation
- `date-fns`: Date formatting utilities
- `framer-motion`: Animation library