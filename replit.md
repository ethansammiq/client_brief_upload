# RFP Media Planning Application

## Overview

This is a full-stack TypeScript application for managing RFP (Request for Proposal) responses and media planning. The application allows users to create and manage RFP responses, build media plans with different versions, and manage product libraries for media planning campaigns.

## Recent Changes

- **July 10, 2025**: Enhanced media plan table with detailed product information
  - Line items now default to placement names instead of generic campaign names
  - Added targeting details and ad sizes columns to media plan display
  - Improved table layout with better column spacing and readability
  - Fixed React Query cache invalidation for real-time updates when adding products
  - Added MiQ-style top navigation with Intelligence, Audiences, Creatives, Campaigns, Reports, and Plan buttons
  - Integrated professional header matching main MiQ system design with user avatar and sub-navigation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with JSON responses
- **Development**: Hot module replacement with Vite integration

### Project Structure
- `client/` - Frontend React application
- `server/` - Backend Express.js application
- `shared/` - Shared TypeScript schemas and types
- `migrations/` - Database migration files

## Key Components

### Database Schema
The application uses four main entities:
- **Products**: Media products with targeting details, pricing models, and placement information
- **RFP Responses**: Main RFP containers with client information and due dates
- **Media Plan Versions**: Different versions of media plans for each RFP
- **Media Plan Line Items**: Individual line items within media plan versions

### API Endpoints
- Product management (`/api/products`)
- RFP response management (`/api/rfp-responses`)
- Media plan version management (`/api/media-plan-versions`)
- Media plan line item management (`/api/line-items`)

### Frontend Components
- **Dashboard**: Main application interface
- **Sidebar**: Navigation component
- **Product Library**: Browse and search products
- **Media Plan Builder**: Create and manage media plans
- **UI Components**: Comprehensive component library based on Radix UI

## Data Flow

1. **Product Management**: Users can search and filter products by category
2. **RFP Creation**: Users create RFP responses with client details and deadlines
3. **Media Plan Building**: Users create multiple versions of media plans for each RFP
4. **Line Item Management**: Users add products to media plans as line items with custom pricing and impression targets
5. **Export/Save**: Users can export media plans and save RFP responses

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- UI components (Radix UI primitives, Lucide React icons)
- Form handling (React Hook Form, Hookform Resolvers)
- Data fetching (TanStack React Query)
- Styling (Tailwind CSS, Class Variance Authority)
- Utilities (Date-fns, clsx, cmdk)

### Backend Dependencies
- Express.js for web server
- Drizzle ORM for database operations
- Neon Database serverless driver
- PostgreSQL session store
- Zod for validation

### Development Dependencies
- Vite for build tooling
- TypeScript for type safety
- ESBuild for server bundling
- Replit-specific plugins for development environment

## Deployment Strategy

### Development Mode
- Frontend: Vite dev server with HMR
- Backend: tsx for TypeScript execution with auto-restart
- Database: Connected to Neon serverless PostgreSQL

### Production Build
- Frontend: Vite builds static assets to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Database: Drizzle migrations applied via `db:push` command

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Development vs production mode controlled by `NODE_ENV`
- Replit-specific optimizations for cloud development environment

The application follows a monorepo structure with shared types and schemas, enabling type safety across the full stack. The architecture prioritizes developer experience with hot reloading, type safety, and modern tooling while maintaining a clean separation between frontend and backend concerns.