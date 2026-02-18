# CleanMap - Smart City Civic Reporting App

## Overview
CleanMap is a mobile civic reporting app built with Expo React Native. It features role-based navigation (Citizen, Cleaner, Admin), AI waste verification, credit rewards, task management, and admin analytics.

## Recent Changes (Feb 2026)
- **Admin Dashboard**: Added Resolution Rate card, Average Response Time, Live Activity Feed, critical alert banner (when >3 critical complaints), animated counters for KPIs
- **Complaint Management**: Added search bar (location/type/ID), sorting dropdown (Newest/Priority/Oldest), bulk select with checkboxes, bulk action buttons (Assign/Change Priority)
- **Assign Staff**: Added workload progress bars per staff, "Auto Assign Best Available" button (lowest workload + highest rating)
- **Analytics**: Added Monthly Trend line chart, Zone Performance bar chart, Export PDF/CSV buttons (UI placeholders)
- **Staff Management**: New screen with staff list, rating, workload bars, active/inactive status, performance summary
- **ReportsContext**: Extended StaffMember with `maxTasks`, `active` fields; added `bulkUpdateReports` and `getBestAvailableStaff` methods

## Architecture
- **Frontend**: Expo Router (file-based routing), React Native with TypeScript
- **Backend**: Express server on port 5000
- **State**: React Context + AsyncStorage persistence, React Query for server state
- **Design**: Civic blue theme (#1E3A8A primary), Inter font, liquid glass tabs (iOS 26+)

## Key Files
- `app/(admin)/` - Admin tabs: index, complaints, analytics, staff, settings
- `app/(citizen)/` - Citizen tabs: index, report, reports, map, profile
- `app/(cleaner)/` - Cleaner tabs: index, tasks, map, profile
- `app/assign-staff.tsx` - Staff assignment modal with auto-assign
- `contexts/ReportsContext.tsx` - Reports + staff data context
- `contexts/AuthContext.tsx` - Auth + credits context
- `components/` - Reusable: AnimatedCounter, CircularProgress, MiniTrendChart, Card, StatusBadge, AchievementBadge

## User Preferences
- Civic blue theme, enterprise-grade professional UI
- Minimal and professional with subtle animations only
- No emojis in UI
- Clean TypeScript, no unused code
