
# Hurtrock Music Store

## Overview

Hurtrock Music Store is a vintage rock-themed e-commerce platform specializing in musical instruments, vinyl records, and rock memorabilia. The application features a dark-mode aesthetic with vintage orange accents, drawing inspiration from classic rock venues and rockstar culture. Built as a full-stack web application, it provides product browsing, shopping cart functionality, comprehensive internationalization (Indonesian/English), automatic currency conversion (IDR/USD), admin category management, and integrated Midtrans payment processing for music enthusiasts and collectors.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with **React 18** and **TypeScript**, utilizing a component-based architecture with **Vite** as the build tool. The UI leverages **Shadcn/UI** components with **Tailwind CSS** for styling, implementing a custom design system based on vintage rock aesthetics. State management is handled through **TanStack Query** for server state and local React state for UI interactions. The application uses **Wouter** for client-side routing, providing a lightweight alternative to React Router. Authentication state is managed through a custom `useAuth` hook with context-based user session management.

### Backend Architecture
The server is an **Express.js** application written in TypeScript, following RESTful API patterns with comprehensive error handling and validation. It implements **Drizzle ORM** with **PostgreSQL** for persistent data storage, replacing the previous in-memory implementation. Session management uses **express-session** middleware with PostgreSQL session store for cart persistence and user state. The API provides endpoints for products, categories, cart management, contact form submissions, and Midtrans payment integration with proper webhook handling.

### Component Design System
The UI follows a comprehensive design system documented in `design_guidelines.md`, featuring:
- **Color Palette**: Dark charcoal backgrounds with vintage orange accents (25 85% 55%)
- **Typography**: Bebas Neue for headers, Inter for body text, Rock Salt for decorative elements
- **Layout System**: Tailwind spacing primitives with consistent 2, 4, 6, 8, 12, 16 units
- **Theme Support**: Dark mode optimized with CSS variables for dynamic theming
- **Responsive Design**: Mobile-first approach with breakpoint-specific optimizations

### Data Models
The application defines structured schemas using **Drizzle-zod** for validation:
- **Products**: Name, description, pricing, category relationships, stock management, multiple images
- **Categories**: Hierarchical organization with unique slugs for SEO-friendly URLs
- **Cart Items**: Session-based cart persistence with product associations and quantity management
- **Orders**: Midtrans integration with order tracking and status management
- **Contact Submissions**: Form data collection for customer inquiries with proper validation
- **User Sessions**: Authentication state management with admin role support

### Development Tools & Configuration
- **Build System**: Vite with React plugin, esbuild for server bundling
- **Type Safety**: TypeScript with strict configuration across client and server
- **Code Quality**: ESLint, Prettier, and path mapping for clean imports (`@/`, `@shared/`)
- **Development Experience**: Hot module replacement, error overlays, comprehensive error boundaries
- **Database Tools**: Drizzle Kit for migrations, PostgreSQL for production-ready persistence

## External Dependencies

### Database & ORM
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Neon Database**: Serverless PostgreSQL through `@neondatabase/serverless`
- **Database Migration**: Drizzle Kit for schema management and migrations
- **Session Store**: Connect PG Simple for PostgreSQL-backed session persistence

### UI & Styling Framework
- **Radix UI**: Headless component primitives for accessibility and behavior
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent visual elements
- **Class Variance Authority**: Type-safe component variant management
- **Embla Carousel**: Touch-friendly carousel components for product galleries

### State Management & API
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management with validation (planned)
- **Zod**: Runtime type validation and schema definition across the stack

### Payment & Integration
- **Midtrans**: Indonesian payment gateway with multiple payment methods
- **Crypto**: UUID generation for unique identifiers
- **Date-fns**: Date manipulation utilities for order management

### Development & Build Tools
- **Vite**: Fast development server and build tool with TypeScript support
- **ESBuild**: JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **TSX**: TypeScript execution for development server

## Recent Changes (September 2025)

### Authentication System Implementation
- **User Authentication**: Complete auth system with session management
- **Admin Panel**: ADMIN_KEY based authentication for secure admin access
- **Protected Routes**: Route protection with authentication state management
- **Session Persistence**: PostgreSQL-backed session store for cart and user state

### Enhanced E-commerce Features
- **Shopping Cart**: Session-based cart with persistent storage across page refreshes
- **Product Management**: Complete CRUD operations with image upload support
- **Category System**: Full category management with referential integrity
- **Payment Integration**: Midtrans payment gateway with webhook handling

### Internationalization & Localization
- **Multi-language Support**: Complete Indonesian/English translation system
- **Currency Conversion**: Automatic IDR/USD conversion based on user location
- **Geolocation Detection**: Smart language and currency selection
- **Localized Error Handling**: Proper error messages in user's preferred language

### Database Architecture Improvements
- **PostgreSQL Migration**: Complete migration from in-memory to persistent storage
- **Schema Optimization**: Enhanced database schema with proper constraints
- **Referential Integrity**: Foreign key relationships with cascade handling
- **Session Management**: PostgreSQL session store for scalability

### Advanced Analytics & Reporting System
- **Comprehensive Analytics Dashboard**: Real-time profit/loss analysis with interactive charts
- **Multi-format Reporting**: Export capabilities in CSV/Excel format with Indonesian headers
- **Daily Transaction Reports**: Detailed breakdown of daily sales with item-level analysis
- **Revenue Trend Analysis**: Monthly revenue visualization with order volume metrics
- **Top Products Analytics**: Best-selling items tracking with quantity and revenue metrics

### Enhanced Payment Processing
- **Robust Payment Callbacks**: Improved Midtrans integration with multiple success status handling
- **Fallback Mechanisms**: Auto-retry logic for payment completion with server-side validation
- **Error Recovery**: Comprehensive error handling for payment edge cases and status variations
- **Payment Status Tracking**: Enhanced order completion flow with webhook integration

### Professional PDF Generation
- **Indonesian-formatted Labels**: Professional order labels with proper Indonesian formatting
- **Structured Layout**: Branded headers, organized customer information, and detailed item breakdowns
- **Address Formatting**: Optimized Indonesian address display with bordered sections
- **Multi-page Support**: Automatic page breaks with consistent formatting throughout

### Technical Improvements
- **Error Boundaries**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Strict TypeScript implementation across the entire stack
- **API Design**: RESTful endpoints with proper HTTP status codes and validation
- **Performance Optimization**: Efficient queries, caching, and asset management
- **Data Accuracy**: Fixed date filtering and revenue calculation inconsistencies
- **Authentication Alignment**: Unified admin authentication across all endpoints

### Security & Development
- **Input Validation**: Comprehensive Zod schema validation for all endpoints
- **SQL Injection Prevention**: Drizzle ORM prepared statements
- **Session Security**: Secure session configuration with proper expiration
- **Admin Security**: Protected admin routes with proper authentication
- **Development Workflow**: Hot module replacement with error recovery

### Mobile Experience
- **Responsive Design**: Complete mobile-first responsive implementation
- **Touch Interactions**: Optimized touch targets and gesture support
- **Mobile Navigation**: Drawer-based navigation for mobile devices
- **Performance**: Optimized loading and rendering for mobile devices

## Architecture Evolution

### Storage Layer Evolution
- **Phase 1**: In-memory storage with IStorage interface for rapid prototyping
- **Phase 2**: PostgreSQL implementation with Drizzle ORM for production readiness
- **Phase 3**: Session-based persistence with PostgreSQL session store
- **Current**: Full-featured persistence with proper migrations and seeding

### Frontend Architecture Maturity
- **Component Library**: Comprehensive Shadcn/UI component system
- **State Management**: TanStack Query for server state, React Context for client state
- **Routing**: Wouter-based routing with protected route implementation
- **Internationalization**: Complete i18n system with automatic locale detection

### API Architecture Enhancement
- **RESTful Design**: Proper HTTP methods and status codes
- **Validation Layer**: Zod schema validation at API boundaries
- **Error Handling**: Structured error responses with internationalization
- **Authentication**: Session-based auth with admin role management
- **Payment Integration**: Secure Midtrans integration with webhook verification

## Development Workflow

### Local Development
```bash
npm install           # Install dependencies
npm run db:push      # Setup database schema
npm run db:seed      # Seed with sample data (optional)
npm run dev          # Start development server
```

### Production Deployment
```bash
npm run build        # Build production assets
npm start           # Start production server
```

### Database Management
```bash
npm run db:generate  # Generate migration files
npm run db:push     # Apply schema changes
npm run db:studio   # Open Drizzle Studio (development)
```

The application is designed for deployment on Replit with automatic PostgreSQL provisioning and environment variable management through Replit Secrets.
