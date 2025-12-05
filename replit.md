# NagarNeuron

## Overview

NagarNeuron is an AI-powered civic complaint management platform built as a React Native Expo mobile application for Android, targeting Bangalore's civic infrastructure issues. The app enables citizens to report and track civic complaints (potholes, garbage, streetlights, drainage) through a single-user utility interface without authentication requirements. The platform features AI-powered issue categorization, geolocation tracking, real-time status updates, and visual analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React Native 0.81.5 with Expo 54
- React 19.1.0 for UI components
- TypeScript for type safety
- React Navigation 7 for routing (native stack + bottom tabs)
- React Query (TanStack Query 5.90) for server state management
- Reanimated 4.1 for animations
- Expo modules for native capabilities (camera, location, image picker)

**Navigation Structure:**
- Root stack navigator containing main tab navigator and modal screens
- Bottom tab navigation with 4 tabs: Home, Map, Stats, Settings
- Floating Action Button (FAB) overlaying tab bar for complaint submission
- Modal presentations for Upload and Detail screens
- Each tab maintains its own navigation stack

**State Management:**
- React Query for API data caching and synchronization
- Local component state for UI interactions
- No global state management (Redux/MobX) - relying on React Query cache

**Design System:**
- Custom theme system with light/dark mode support
- Consistent color palette: Primary (#3b82f6), Success (#10b981), Warning (#f59e0b), Danger (#ef4444)
- Category-specific colors for visual differentiation
- Status badges with semantic color coding
- Reusable components: Button, Card, StatusBadge, CategoryBadge, ComplaintCard
- Typography system with predefined text styles (h1-h4, body, small, caption)

**UI/UX Patterns:**
- Card-based layouts with elevation shadows
- Spring animations for press interactions
- Blur effects for iOS header transparency
- Safe area handling for notched devices
- Keyboard-aware scrolling for form inputs

### Backend Architecture

**Technology Stack:**
- Express.js server (Node.js runtime)
- TypeScript for type safety
- Drizzle ORM for database interactions
- PostgreSQL as primary database (configured but may add later)

**API Structure:**
- RESTful endpoints under `/api` prefix
- GET `/api/complaints` - List complaints with optional category/status filters
- GET `/api/complaints/:id` - Single complaint details
- POST `/api/complaints` - Create new complaint with image and location
- PUT `/api/complaints/:id/status` - Update complaint status
- GET `/api/stats` - Aggregate statistics

**Data Storage:**
- In-memory storage implementation for demo purposes (server/storage.ts)
- Schema-first design using Zod validation
- Drizzle ORM configured for future PostgreSQL migration
- Image data stored as base64 strings in complaint records

**Data Models:**
- Complaint: Core entity with image, location, category, severity, status, description
- StatusHistoryEntry: Audit trail for status changes
- ComplaintStats: Aggregated metrics for analytics

**Error Handling:**
- Try-catch blocks with appropriate HTTP status codes
- Zod schema validation for request payloads
- Error boundaries in React components
- Graceful fallbacks for missing data

**CORS Configuration:**
- Dynamic origin whitelisting based on Replit environment variables
- Supports REPLIT_DEV_DOMAIN and REPLIT_DOMAINS
- Credentials enabled for cross-origin requests

### External Dependencies

**Third-Party Services:**
- Expo ecosystem for mobile development and native module access
- React Navigation for routing and navigation
- React Query for data fetching and caching
- Reanimated for performant animations

**Device Capabilities:**
- expo-camera: Camera access for capturing complaint images
- expo-image-picker: Gallery access for selecting existing images
- expo-location: GPS coordinates for geotagging complaints
- expo-haptics: Tactile feedback for user interactions

**Database:**
- PostgreSQL (configured via Drizzle but not yet provisioned)
- DATABASE_URL environment variable expected
- Migration scripts ready in drizzle.config.ts

**Development Tools:**
- Expo development server with hot reloading
- TypeScript compiler for type checking
- ESLint with Expo configuration
- Prettier for code formatting

**Build and Deployment:**
- Expo build pipeline for static assets
- esbuild for server bundling
- Custom build script (scripts/build.js) for Replit deployment
- Environment-based configuration (EXPO_PUBLIC_DOMAIN, REPLIT_DEV_DOMAIN)

**Styling and UI Libraries:**
- expo-blur: Glassmorphism effects for iOS
- expo-glass-effect: Liquid glass visual effects
- react-native-safe-area-context: Safe area handling
- @expo/vector-icons (MaterialIcons): Icon system
- expo-image: Optimized image rendering

**Map Integration:**
- react-native-maps for geographic complaint visualization
- Bangalore-centric default region (12.9716, 77.5946)
- Category-based marker coloring
- Web fallback message when maps unavailable