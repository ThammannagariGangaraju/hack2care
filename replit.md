# HACK2CARE - AI First-Responder Assistant

## Overview

HACK2CARE is a mobile-optimized emergency web application designed to help road accident bystanders provide immediate first aid. The app uses Google Gemini AI to provide contextual first aid guidance, with a panic-safe, zero-cognitive-load interface optimized for high-stress emergency situations.

The application follows a simple flow: no login required, a single "Report Accident" button leads to a 3-question decision tree (conscious, breathing, bleeding), then provides AI-generated first aid instructions, CPR guidance when needed, and emergency contact/location features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom emergency-themed color scheme (red, white, yellow for high visibility)
- **State Management**: React useState with TanStack React Query for server state
- **Design Philosophy**: Mobile-first, single-column layout with large touch targets (minimum 60px buttons), portrait orientation only

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **AI Integration**: Google Gemini API via Replit AI Integrations for first aid guidance
- **Build Process**: Custom build script using esbuild for server bundling, Vite for client

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains database models
- **Tables**: Users table and Emergencies table for logging incidents
- **Development Fallback**: In-memory storage (`MemStorage` class) when database unavailable

### Application Flow
1. Landing page with single "Report Accident" CTA
2. Decision tree: 3 yes/no questions in strict order
3. Results page with AI-generated first aid instructions
4. CPR animation component for unconscious/not-breathing cases
5. Emergency contacts and nearby hospital/pharmacy information

### Key Design Patterns
- **Offline Support**: Service worker caching with offline fallback first aid instructions
- **Path Aliases**: `@/` maps to client/src, `@shared/` maps to shared directory
- **Component Structure**: Pages in `client/src/pages/`, reusable components in `client/src/components/`

## External Dependencies

### AI Services
- **Google Gemini API**: Used for generating contextual first aid instructions based on patient assessment
- **Replit AI Integrations**: Provides Gemini API access via environment variables `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL`

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migration tool (`db:push` command)

### Third-Party UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, tooltips, etc.)
- **Lucide React**: Icon library
- **TanStack React Query**: Server state management
- **class-variance-authority**: Component variant management

### Planned Integrations (from requirements)
- **Google Maps API**: For location and nearby hospitals/medical shops
- **Firebase**: For emergency logging (placeholder implementation exists)