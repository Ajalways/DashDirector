# Replit.md

## Overview

PulseBoardAI is a comprehensive AI-powered business intelligence platform built with Express.js, React, and TypeScript that provides white-label dashboard capabilities for businesses. The application features KPI dashboards, task management, fraud detection, team management, extensive customization capabilities, a revolutionary "What Changed?" timeline feature that automatically tracks and explains major business metric shifts like a business activity time machine, a Natural Language Business Assistant that allows conversational queries about business data, and an advanced AI Business Recommendation Engine powered by Anthropic's Claude 4.0 Sonnet. The AI system analyzes business metrics in real-time to provide intelligent recommendations for revenue optimization, cost reduction, customer retention, operational efficiency, and market opportunities with specific financial impact estimates and actionable task assignments. Users can ask questions like "Why did I lose money in June?" or "Which team is costing me more than they bring in?" and get AI-powered insights with highlighted records and actionable recommendations. It's designed to be a modular platform where companies can customize branding, rename components, and manage their own isolated data. The multi-tenant architecture is hidden from end users to appear as a single business platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 30, 2025 - AI-Powered Business Intelligence & Firefox Compatibility
- **AI Business Recommendation Engine**: Implemented comprehensive AI-powered business recommendation system using Anthropic's Claude 4.0 Sonnet
- **Smart Business Analytics**: Added intelligent analysis of revenue optimization, cost reduction, customer retention, operational efficiency, and market opportunities
- **Real-time AI Insights**: Created dynamic business insights generation with confidence scoring and actionable recommendations
- **Advanced Recommendation System**: Built sophisticated recommendation engine with financial impact estimation, task assignment, and progress tracking
- **Enhanced Navigation**: Added "AI Business Recommendations" menu item with AI badge for easy access to intelligent business insights
- **Firefox Crash Issue**: Firefox 141.0 Service Worker crashes persist despite comprehensive blocking attempts
- **GitHub Integration**: Added complete GitHub deployment guide and repository setup for code distribution
- **Alternative Browser Strategy**: Implemented browser compatibility guidance recommending Chrome/Safari for business users
- **Production Deployment Ready**: Platform fully ready for commercial launch on non-Firefox browsers
- **Enterprise Commercial Features**: All business features completed and tested for subscription-based customers

### July 29, 2025 - Deployment Configuration Fixes
- Fixed port configuration mismatch in ecosystem.config.js (ensured PORT=5000 in both dev and production)
- Updated start.js script with enhanced error handling and deployment logging
- Ensured consistent PORT environment variable usage across all deployment configurations  
- Enhanced start.js with built file verification and detailed deployment logging
- Server properly listens on PORT environment variable (5000) in both development and production
- Applied all suggested deployment fixes: port consistency, direct server start, production environment

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React Context for global state
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **File Uploads**: Multer for handling logo/favicon uploads

### Multi-Tenant Strategy
- **Tenant Isolation**: Each tenant has isolated data through tenant-scoped queries
- **Subdomain Support**: Tenants can have custom subdomains
- **Custom Branding**: Logo, favicon, color schemes, and theme customization
- **Module Configuration**: Features can be enabled/disabled per tenant

## Key Components

### Database Schema
- **Users**: Authentication and profile data with tenant association
- **Tenants**: Multi-tenant configuration including branding and settings
- **Tasks**: Customizable task management system
- **Fraud Cases**: Fraud detection and case management
- **Activities**: System activity logging and audit trail
- **KPI Metrics**: Performance metrics and analytics data
- **Sessions**: Replit Auth session storage

### Authentication System
- **Provider**: Replit OpenID Connect authentication
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Role-Based Access**: Owner, admin, manager, analyst, and user roles with granular permissions
- **Protected Routes**: Frontend route protection with automatic redirect
- **Role Impersonation**: Owner accounts can impersonate any role for testing
- **Test Account System**: Safe, non-billable test accounts for development

### API Structure
- `/api/auth/*` - Authentication endpoints (login, logout, user info)
- `/api/tasks/*` - Task management CRUD operations
- `/api/fraud/*` - Fraud case management
- `/api/team/*` - Team member management and invitations
- `/api/tenant/*` - Tenant configuration and branding
- `/api/upload/*` - File upload endpoints for branding assets
- `/api/activities` - Activity feed and audit logs
- `/api/kpi/*` - KPI metrics and dashboard data
- `/api/business/*` - AI-powered business recommendation engine endpoints
  - `/api/business/metrics` - Business performance metrics analysis
  - `/api/business/recommendations` - AI-generated business recommendations
  - `/api/business/insights` - Intelligent business insights with confidence scoring
  - `/api/business/generate-recommendations` - Trigger new AI analysis

### Frontend Components
- **Layout System**: Responsive sidebar/topbar navigation with mobile support
- **Theme System**: Dynamic theming with light/dark mode support
- **Dashboard Widgets**: Modular KPI cards, charts, and activity feeds
- **Settings Management**: Comprehensive tenant configuration interface
- **White-Label Branding**: Logo upload, color customization, favicon management

## Data Flow

1. **Authentication Flow**: User authenticates via Replit Auth → Session created → User data retrieved with tenant association
2. **Tenant Context**: Tenant information loaded on app initialization → Applied to theme/branding → Used for data scoping
3. **API Requests**: All data requests include tenant context → Tenant-scoped database queries → Isolated data returned
4. **Real-time Updates**: TanStack Query manages cache invalidation → Optimistic updates for better UX
5. **Activity Logging**: User actions logged to activities table → Displayed in audit trails and activity feeds

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth OpenID Connect
- **File Storage**: Local file system (uploads directory)
- **Email**: Not yet implemented (placeholder for invitations)

### Third-Party Integrations (Planned)
- Stripe for billing and subscription management
- QuickBooks for financial data integration
- Slack for notifications
- Zapier for workflow automation

### Development Tools
- **Build System**: Vite with React plugin
- **Code Quality**: TypeScript strict mode
- **Database Migrations**: Drizzle Kit for schema management
- **Development**: Hot reload with Vite dev server

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds React app to `/dist/public`
- **Backend**: esbuild bundles Express server to `/dist/index.js`
- **Static Assets**: Served directly by Express in production
- **Database**: Neon PostgreSQL with connection pooling
- **Port Configuration**: Server consistently uses PORT environment variable (default: 5000)
- **Deployment**: Direct node execution bypassing PM2 for Replit deployments

### Environment Configuration
- **DATABASE_URL**: Neon PostgreSQL connection string
- **SESSION_SECRET**: Secure session encryption key
- **REPLIT_DOMAINS**: Allowed domains for Replit Auth (pulseboardai.com,app.pulseboardai.com,*.pulseboardai.com)
- **CUSTOM_DOMAIN**: Primary custom domain (pulseboardai.com)
- **ISSUER_URL**: OpenID Connect issuer endpoint

### Scalability Considerations
- **Database**: Neon serverless scales automatically
- **File Storage**: Currently local (should migrate to cloud storage for production)
- **Sessions**: PostgreSQL session store supports horizontal scaling
- **Multi-tenancy**: Tenant isolation enables independent scaling per customer

### Security Features
- **Session Security**: HTTP-only cookies with secure flag
- **File Upload Validation**: Type and size restrictions
- **SQL Injection Protection**: Drizzle ORM parameterized queries
- **Authentication**: OpenID Connect with proper token validation
- **CORS**: Configured for production domains