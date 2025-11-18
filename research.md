# Research

## Summary
The Medical-App currently has a minimal backend structure with basic server files but lacks a complete backend implementation. It has API integration patterns for external services like FDA and RxNorm, but missing core backend infrastructure including database setup, authentication system, and API server deployment.

## Repository: Medical-App

### Component: Backend Server Structure
**Location:** `Medical-App/src/server/`

**Key files**
- `Medical-App/src/server/routes/medicationRoutes.ts` - Express.js routes for medication management
- `Medical-App/src/server/models/MedicationRecord.ts` - Mongoose model for medication records
- `Medical-App/src/server/services/reminderService.ts` - Medication reminder scheduling service
- `Medical-App/src/server/services/notificationService.ts` - Empty notification service file

**How it works**
- Uses Express.js framework for routing
- Implements RESTful endpoints for medication CRUD operations
- Includes middleware for authentication (auth middleware referenced but not implemented)
- Uses Mongoose ODM for MongoDB data modeling
- Has placeholder for reminder/notification services

**Connections**
- References User model for user relationships
- Connects to frontend API client in `src/lib/api.ts`

### Component: Database Models
**Location:** `Medical-App/src/server/models/`

**Key files**
- `Medical-App/src/server/models/MedicationRecord.ts` - Medication record schema with user relationships

**How it works**
- Uses Mongoose with MongoDB
- Implements proper indexing for performance
- Includes timestamps and status tracking
- References User model (not found in codebase)

**Connections**
- Cross-references with User model for authentication
- Used by medication routes for data operations

### Component: External API Integrations
**Location:** `Medical-App/src/services/`

**Key files**
- `Medical-App/src/services/fdaApi.ts` - FDA drug database API integration
- `Medical-App/src/services/rxnormApi.ts` - RxNorm medication database with fallback mock data
- `Medical-App/src/services/medicationApi.ts` - Backend API client for medication operations
- `Medical-App/src/services/dietApi.ts` - Diet recommendation calculations
- `Medical-App/src/lib/api.ts` - Axios client configuration for API calls

**How it works**
- FDA API: Fetches drug information from openfda.gov drug labels database
- RxNorm API: Comprehensive medication database with mock fallback data for 12+ common medications
- Diet API: Calculates BMR/TDEE and generates meal plans locally (no external API)
- API Client: Configured with authentication interceptors and base URL from environment

**Connections**
- Frontend components use these services for data fetching
- Medication API connects to backend endpoints on localhost:8000

### Component: Dependencies and Configuration
**Location:** `Medical-App/package.json`

**Key dependencies**
- Frontend: React 18, Vite, TypeScript, Tailwind CSS, Radix UI components
- State Management: Redux Toolkit, React Query
- Authentication: @react-oauth/google, Firebase
- Backend: No backend dependencies (Express, MongoDB not installed)
- HTTP Client: Axios for API communication
- Mobile: Capacitor for iOS/Android deployment

**How it works**
- Pure frontend React application with Vite build system
- No backend server dependencies installed (Express, MongoDB missing)
- Authentication prepared for Google OAuth and Firebase
- API client configured but no actual backend server

**Connections**
- All services connect through axios client configuration
- Environment variables used for API URL configuration

## Missing Backend Infrastructure

### Core Backend Components
- **No Express.js server file** (server.js, app.js, or index.js)
- **No database connection configuration** (MongoDB connection string)
- **No authentication middleware implementation** (referenced but files don't exist)
- **No user model/schema** despite being referenced by MedicationRecord
- **No server startup configuration**

### API Endpoints
- **Partial API implementation**: Only medication routes exist
- **Missing user authentication endpoints**
- **Missing health data endpoints** (despite frontend having health features)
- **Missing notification system endpoints**

### Database Setup
- **No MongoDB/Mongoose installation** in dependencies
- **No database configuration files**
- **No user authentication models**
- **No data migration or seeding files**

### External Integrations
- **FDA API integration exists but may need configuration**
- **RxNorm API uses mock data (real API may need setup)**
- **Firebase authentication configured but backend integration missing**
- **Google OAuth prepared but backend endpoints missing**

### Deployment Infrastructure
- **No backend deployment configuration**
- **No environment variable setup for production**
- **No API server startup scripts**
- **No database hosting configuration**