# RFP Media Planning Application

## Overview

This is a full-stack TypeScript application for managing RFP (Request for Proposal) responses and media planning. The application allows users to create and manage RFP responses, build media plans with different versions, and manage product libraries for media planning campaigns.

## Recent Changes

- **July 11, 2025**: Database Implementation and Campaign Date Integration
  - Successfully migrated from in-memory storage to PostgreSQL database for persistent data storage
  - Created DatabaseStorage class implementing all CRUD operations using Drizzle ORM
  - Seeded database with 10 sample media products across different categories (Display, Video, Audio, Search, Social)
  - Added sample RFP response with media plan version for testing and demonstration
  - All RFP responses, media plans, and line items now persist between sessions
  - Maintained backward compatibility with existing frontend components
  - Database schema includes proper relationships and constraints for data integrity
  - Implemented automatic calculation of media plan version totals (budget, impressions, CPM)
  - Fixed issue where media plan versions showed incorrect totals when line items were added
  - Added real-time recalculation of totals when line items are created, updated, or deleted
  - Campaign Date Integration, Enhanced User Experience, and Duplicate Plan Functionality
  - Added campaign start and end date fields to RFP response schema and create/edit forms
  - Updated campaign header to display campaign duration prominently alongside client and due date information
  - Enhanced add product modal to automatically populate campaign dates as default values for line items
  - Streamlined campaign creation workflow with start/end dates displayed in three-column layout
  - Updated sample data to include campaign dates for better demonstration
  - Improved data flow between campaign creation and media plan building processes
  - Fixed campaign date population in add product modal using useEffect and setValue
  - Enhanced ad sizes display formatting in media plan table with organized platform groupings
  - Transformed ad sizes from text block to structured tags grouped by Desktop, Tablet, Mobile platforms
  - Added proper spacing and visual hierarchy for ad sizes with individual size badges
  - Fixed ad sizes formatting to handle both platform-specific and non-platform formats (audio/video durations)
  - Removed extra colons from audio/video ad sizes display for cleaner presentation
  - Updated top navigation with official MiQ white logo replacing previous placeholder
  - Removed "Click to add" text from product library cards for cleaner interface
  - Maintained existing expanded media plan chart structure with all comprehensive fields
  - Enhanced ProductLibrary component to pass campaign context to product addition modal
  - Ensured consistent date formatting and display across all components
  - Implemented duplicate plan functionality to create version copies with all line items
  - Added proper loading states and validation for duplicate plan feature
  - Fixed media products page scrolling issue with proper overflow handling
  - Added delete version functionality with proper validation and automatic version switching
  - Delete button only appears when multiple versions exist to prevent deletion of last version
  - Added duplicate/copy button for individual line items in media plan table
  - Implemented line item duplication with automatic "(Copy)" suffix for names and placements
  - Green copy icon button positioned between edit and delete buttons in actions column
  - Automatic totals recalculation when line items are duplicated maintains data integrity
  - **YouTube Package Hierarchical Display Implementation**
    - Successfully implemented YouTube package hierarchical display structure with parent rows and child placements
    - YouTube packages display as parent rows (e.g., "MiQ_YouTube_Reach_Package") with shared targeting, dates, rates, and totals
    - Child placement rows appear underneath each package (MiQ_YT_Shorts, MiQ_YT_Skippable In-Stream, MiQ_YT_NonSkip In-Stream)
    - Individual non-YouTube products remain as separate rows
    - Updated YouTube package targeting details with official package descriptions and targeting strategies
    - Fixed React Query data loading issues that prevented line items from displaying in table
    - Packages group correctly by extracting package names from line item naming pattern "YouTube - [Package Type] - [Placement]"
  - **Enhanced Media Products Manager with Package Support**
    - Added comprehensive package product creation and editing functionality
    - Package toggle switch to differentiate between regular products and packages
    - Dynamic placement management for packages with add/remove functionality
    - Package placements include name, ad sizes, and optional targeting details
    - Updated product table to display package indicators and type badges
    - Wider dialog modals to accommodate package placement management
    - Enhanced targeting details formatting with ** notice text ** highlighting
    - Package products support hierarchical display in media plan builder
  - **YouTube Category Organization**
    - Added dedicated "YouTube" category for better organization of YouTube products
    - All YouTube packages (Reach, Relevance, TV Extension) moved to YouTube category
    - Updated category colors with distinct red styling for YouTube products
    - Enhanced product filtering and organization across all components
    - Dynamic category generation ensures YouTube appears in all filter dropdowns
  - **Excel Export Functionality - COMPLETED**
    - Successfully implemented comprehensive Excel export feature for media plans
    - Creates workbook with summary sheet plus worksheet per media plan version
    - Exports all line item details: budgets, impressions, CPM, dates, targeting
    - Automatic file naming with campaign title and date
    - Proper column widths and formatting for professional presentation
    - Fixed field mapping issues to match database schema (version.title, lineItemName, totalCost, cpmRate)
    - Robust error handling with fallback worksheets for failed versions
    - Clean export structure with professional formatting suitable for client delivery
  - **Date Format Standardization - COMPLETED**
    - Updated all date displays throughout the application to use MM-DD-YY format
    - Campaign header now shows due date and campaign dates in MM-DD-YY format
    - Media plan table displays start/end dates in MM-DD-YY format
    - Media plans library cards show due dates in MM-DD-YY format
    - Excel export includes all dates formatted as MM-DD-YY for consistency
    - Maintained date input functionality while standardizing display format
  - **Package Line Item Editing - COMPLETED**
    - Successfully implemented comprehensive editing functionality for YouTube package line items
    - Package parent rows now have edit buttons that enable editing of package-level fields directly
    - Package-level editing allows modification of targeting details, start/end dates, rate models, and CPM rates
    - Changes to package-level fields automatically apply to all child placements in that package
    - Individual child placements maintain separate editing capabilities for placement-specific details
    - Edit buttons change to "Save" when in edit mode for clear user feedback
    - Professional table design with scrollable content cells and proper visual hierarchy maintained
  - **Plan Version Name Editing - COMPLETED**
    - Added comprehensive version name editing functionality with multiple access points
    - Edit buttons available in both version selector area and table header for convenience
    - Inline editing with input field, Save/Cancel buttons, and keyboard shortcuts (Enter/Escape)
    - Real-time updates across all UI components including dropdown and table header
    - Input validation prevents saving empty or whitespace-only names
    - Fixed server-side PATCH route handling for proper database updates
    - Seamless user experience with immediate visual feedback and data persistence

- **July 10, 2025**: Complete Media Planner redesign with card-based layout
  - Redesigned entire Media Planner tab with modern card-based layout inspired by MiQ platform
  - Repositioned product catalog above media plan section in separate card container
  - Transformed product library from sidebar to responsive grid layout (1-3 columns)
  - Added colorful summary metric cards displaying Budget, Impressions, and CPM
  - Implemented horizontal search bar with category filtering for products
  - Enhanced product cards with detailed targeting, placement, and ad size information
  - Added campaign performance forecast section with reach, frequency, CTR, and completion metrics
  - Improved overall visual hierarchy with proper spacing and professional styling
  - Updated sub-navigation styling with black text and yellow underline for active tabs
  - Removed purple hover effects in favor of clean bold text interactions
  - Maintained comprehensive Media Products Manager with full CRUD operations
  - Fixed React Query cache invalidation for real-time updates when adding products

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