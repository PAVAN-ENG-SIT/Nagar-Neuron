# NagarNeuron

## Overview

NagarNeuron is an AI-powered civic complaint management platform built as a React Native Expo mobile application for Android and iOS, targeting Bangalore's civic infrastructure issues. The app enables citizens to report and track civic complaints (potholes, garbage, streetlights, drainage) with authentication, gamification, and community verification features. The platform features AI-powered issue categorization, geolocation tracking, real-time status updates, visual analytics, and a points/badges reward system.

## Recent Changes

**December 2025:**
- Implemented full authentication system with phone-based login using AsyncStorage for token persistence
- Added ProfileScreen with user stats, badges display, streak tracking, and logout functionality
- Created LeaderboardScreen showing top civic heroes with points and report counts
- Built BadgesScreen displaying earned and locked achievement badges with progress tracking
- Updated navigation to support auth flow with conditional screens (login vs. main app)
- Fixed MapScreen for web compatibility using dynamic require loading
- Seeded database with 30 sample complaints, 5 badges, and hotspot data
- Converted backend storage from in-memory to PostgreSQL using Drizzle ORM

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
- AsyncStorage for client-side token persistence

**Navigation Structure:**
- Root stack navigator with conditional auth flow
- LoginScreen shown when not authenticated
- Main tab navigator with 4 tabs: Home, Map, Stats, Profile
- Modal screens: Upload, Detail, Leaderboard, Badges
- Floating Action Button (FAB) for complaint submission

**Authentication Flow:**
- Phone-based registration/login via AuthContext
- User session persisted in AsyncStorage
- Auto-login on app restart if token exists
- User profile data fetched from API

**State Management:**
- React Query for API data caching and synchronization
- AuthContext for global authentication state
- Local component state for UI interactions

**Design System:**
- Custom theme system with light/dark mode support
- Consistent color palette: Primary (#3b82f6), Success (#10b981), Warning (#f59e0b), Danger (#ef4444)
- Category-specific colors for visual differentiation
- Status badges with semantic color coding
- Typography system with predefined text styles (h1-h4, body, small, caption)

**UI/UX Patterns:**
- Card-based layouts with elevation shadows
- Spring animations for press interactions
- Blur effects for iOS header transparency
- Safe area handling for notched devices
- Keyboard-aware scrolling for form inputs
- LinearGradient backgrounds for login/profile headers

### Backend Architecture

**Technology Stack:**
- Express.js server (Node.js runtime)
- TypeScript for type safety
- Drizzle ORM for database interactions
- PostgreSQL as primary database

**API Structure:**
- RESTful endpoints under `/api` prefix
- GET `/api/complaints` - List complaints with optional category/status filters
- GET `/api/complaints/:id` - Single complaint details
- POST `/api/complaints` - Create new complaint with image and location
- PUT `/api/complaints/:id/status` - Update complaint status
- GET `/api/stats` - Aggregate statistics
- POST `/api/auth/login` - User login/registration
- GET `/api/users/:id` - User profile with badges
- GET `/api/leaderboard` - Top users by points
- GET `/api/badges` - All available badges

**Database Schema:**
- Users: id, name, phone, points, totalReports, totalVerifications, streak, rank, language
- Complaints: id, image, location, category, severity, status, description, latitude, longitude, userId, createdAt
- Badges: id, name, description, icon, threshold
- UserBadges: userId, badgeId, earnedAt (many-to-many relationship)
- Hotspots: id, category, latitude, longitude, intensity, weekday, hour, predictions
- Verifications: id, complaintId, userId, verificationStatus, createdAt

**Data Seeding:**
- Automatic seeding on server startup
- 30 sample complaints across Bangalore locations
- 5 achievement badges (First Steps, Reporter, Civic Hero, Verifier, Guardian)
- Sample hotspot data with predicted patterns

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
- expo-linear-gradient: Gradient backgrounds

**Database:**
- PostgreSQL via Replit's native database support
- DATABASE_URL environment variable configured
- Drizzle ORM for type-safe queries

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
- expo-linear-gradient: Gradient backgrounds

**Map Integration:**
- react-native-maps for geographic complaint visualization (mobile only)
- Bangalore-centric default region (12.9716, 77.5946)
- Category-based marker coloring
- Web fallback UI when maps unavailable

## Key Files

**Backend:**
- `server/db/schema.ts` - Database schema definitions
- `server/db/seed.ts` - Sample data seeding
- `server/storage.ts` - Database access layer
- `server/routes.ts` - API endpoints

**Frontend:**
- `client/lib/auth-context.tsx` - Authentication state management
- `client/lib/api.ts` - API client with type definitions
- `client/navigation/RootStackNavigator.tsx` - Main navigation with auth flow
- `client/navigation/MainTabNavigator.tsx` - Bottom tab navigation
- `client/screens/LoginScreen.tsx` - Phone-based authentication
- `client/screens/ProfileScreen.tsx` - User profile and settings
- `client/screens/LeaderboardScreen.tsx` - Top users ranking
- `client/screens/BadgesScreen.tsx` - Achievement badges display

## Running the App

1. Start the development server: `npm run all:dev`
2. Scan the QR code with Expo Go (Android/iOS) to test on mobile
3. The Express server runs on port 5000 serving both API and Expo
4. Web preview shows Expo QR code; use mobile for full experience
