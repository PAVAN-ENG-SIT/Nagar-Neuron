# NagarNeuron Design Guidelines

## App Overview
Android-first civic complaint management platform for Bangalore with AI-powered issue categorization. Single-user utility app—no authentication required.

## Navigation Structure

### Tab Navigation (4 tabs + FAB)
1. **Home**: Complaint feed with filters
2. **Map**: Geographic complaint view
3. **Stats**: Analytics dashboard
4. **Settings**: App info, version, privacy policy, terms, contact

**FAB**: Centered over tab bar, overlaps by 32px. Opens camera/upload flow for complaint submission.

**Navigation Flow**: Each tab maintains own stack. DetailScreen and UploadScreen open as modals.

---

## Color System

### Primary Palette
- **Primary**: `#3b82f6` (brand, headers, CTAs)
- **Success**: `#10b981` (resolved status)
- **Warning**: `#f59e0b` (in progress)
- **Danger**: `#ef4444` (critical issues)

### Category Colors
| Category | Color | HEX |
|----------|-------|-----|
| Pothole | Red | `#ef4444` |
| Garbage | Green | `#10b981` |
| Streetlight | Yellow | `#fbbf24` |
| Drainage | Blue | `#3b82f6` |
| Other | Gray | `#6b7280` |

### Status Badges
| Status | Background | Text |
|--------|------------|------|
| Reported | `#fef3c7` | `#92400e` |
| Assigned | `#dbeafe` | `#1e40af` |
| In Progress | `#fed7aa` | `#9a3412` |
| Resolved | `#d1fae5` | `#065f46` |

### Neutrals
- Background: `#ffffff`
- Cards: `#f9fafb`
- Borders: `#e5e7eb`
- Text: `#111827` / `#6b7280` / `#9ca3af`

---

## Typography
- **Headers**: Bold, 20-24px
- **Subheaders**: Semibold, 16-18px
- **Body**: Regular, 14-16px
- **Captions**: Regular, 12px
- **Badges**: Bold, uppercase, 10-12px

## Spacing Scale
`xs:4px | sm:8px | md:12px | lg:16px | xl:24px | 2xl:32px`

---

## Screen Specifications

### HomeScreen
**Layout**: Standard header + scrollable content
- Top inset: `xl`, Bottom inset: `tabBarHeight + xl`
- Pull-to-refresh enabled

**Components** (top to bottom):
1. **Stats Summary**: Horizontal scroll, 3 cards (Total/Open/Resolved complaints). Large number + icon, colored accent borders
2. **Category Filters**: Horizontal chips (All, Pothole, Garbage, Streetlight, Drainage, Other). Active: filled with category color, Inactive: gray outline
3. **Status Filters**: Horizontal chips (All, Reported, Assigned, In Progress, Resolved). Active: filled with status color
4. **Complaint List**: FlatList with ComplaintCard components
5. **Empty State**: Centered icon + "No complaints found" + subtext

**ComplaintCard Design**:
- 80x80px rounded thumbnail (left), content (right)
- Category badge (top right), severity dot, location (2 lines max), status badge, timestamp
- White bg, shadow `0px 2px 4px rgba(0,0,0,0.1)`, 12px corners, 12px bottom margin
- Press: scale 0.98

---

### UploadScreen (Modal)
**Layout**: Transparent header, scrollable form
- Header: "Report Complaint", Cancel (left)
- Top inset: `headerHeight + xl`, Bottom: `insets.bottom + xl`

**Components**:
1. **Image Picker**: Two full-width buttons (48px height)
   - "Take Photo" (camera icon)
   - "Choose from Gallery" (image icon)
2. **Image Preview**: 300x300px, rounded, Remove button (X, top-right overlay)
3. **Auto-Location**: Card showing GPS coordinates, location pin icon, gray bg
4. **Notes**: Multiline input (4 lines), placeholder: "Add any additional details..."
5. **Submit Button**: Full-width, 56px, primary blue, disabled when no image (gray, 50% opacity)

**Loading State**: Full-screen overlay, spinner + "Processing..." text

---

### MapScreen
**Layout**: Full-screen map, standard header
- Region: Bangalore (12.9716, 77.5946), delta: 0.1

**Components**:
1. **Markers**: Category-colored custom pins
2. **Callout** (on marker tap): 60x60px thumbnail, category, status, location, "View Details" button
3. **Legend**: Floating semi-transparent card (bottom), colored dots + category labels, 12px margin

---

### DetailScreen (Modal)
**Layout**: Header + ScrollView
- Top inset: `headerHeight + xl`, Bottom: `insets.bottom + xl`

**Components** (vertical stack):
1. **Hero Image**: Full-width, max 400px height, pinch-to-zoom
2. **Info Cards**: ID, Category+Severity, Status, Location (address+GPS), AI Description, Timestamps
3. **Status Timeline**: Vertical line, colored dots, chronological entries (status, time, notes)
4. **Admin Controls**: Status picker dropdown, notes input, "Update Status" button (full-width, primary)

---

### StatsScreen
**Layout**: Standard header, ScrollView with pull-to-refresh
- Top inset: `xl`, Bottom: `tabBarHeight + xl`

**Components**:
1. **Summary Cards**: 2-column grid (Total, Open, Resolved, Today's Reports). Large number, icon, colored accent
2. **Category Breakdown**: Horizontal bar chart, category colors, labels, counts
3. **Status Distribution**: Bar visualization with status colors
4. **Recent Activity**: Last 5 complaints (small thumbnail, category, location, timestamp)

---

## Component Library

### Status Badge
- Pill shape (99px radius), 12px horizontal padding, 4px vertical
- Uppercase bold text (10-12px), colors per Status Badges table

### Category Badge
- Horizontal: Icon + Text
- **Icons** (MaterialIcons): `report-problem`, `delete`, `lightbulb`, `water-damage`, `help-outline`
- Background: category color 20% opacity, 1px border (category color), 8px horizontal/4px vertical padding

### FAB
- **Size**: 64x64px circle, centered horizontally
- **Color**: Primary blue, white camera icon (32px)
- **Shadow**: `{offset: {width:0, height:2}, opacity:0.10, radius:2}`
- **Press**: Scale 0.95

### Buttons
- **Primary**: Blue bg, white text, 48-56px height
- **Secondary**: White bg, blue border/text
- **Outlined**: Transparent, colored border/text
- **Disabled**: Gray, 50% opacity
- All: 8px corners, press opacity 0.8

---

## Accessibility & UX

### Requirements
- Min tap target: 44x44px
- WCAG AA contrast ratios
- Support system font scaling
- Screen reader labels on all icons
- Clear loading/error states
- Inline form validation errors

### Visual Feedback
- Press states: opacity or scale change
- Loading: spinner or skeleton
- Success/Error: System Alerts with icons
- Pull-to-refresh: Native Android indicator

---

## Assets
1. **App Icon**: 512x512px NagarNeuron logo
2. **Splash**: Logo on primary blue
3. **Icons**: MaterialIcons from @expo/vector-icons
4. **Map Markers**: Custom colored pins per category

---

## Implementation Notes
- All screens handle safe area insets
- Camera permissions requested on UploadScreen mount
- Auto-extract GPS after image selection
- Map markers use category colors for instant recognition
- Status updates show confirmation, refresh data automatically