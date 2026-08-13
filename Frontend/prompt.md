# React Native Mobile Application Development Prompt

You are a Senior React Native Architect and Full Stack Mobile Engineer.

Build a complete production-ready React Native mobile application from scratch for an **Oyster Mushroom Disease Detection System**.

The UI should closely match the attached design references while following modern mobile UI/UX principles.

This is NOT a UI-only project.
This is a fully functional mobile application integrated with backend APIs.

The AI disease prediction API is already implemented using FastAPI.

Do NOT generate placeholder screens or fake implementations.

The generated project must be production-ready, scalable, clean, modular, and maintainable.

----------------------------------------------------
TECH STACK
----------------------------------------------------

Use the following stack:

• React Native (Expo)
• TypeScript
• React Navigation v7
• React Native Paper
• NativeWind (Tailwind CSS)
• Zustand
• React Query (TanStack Query)
• Axios
• React Hook Form
• Zod
• Expo Camera
• Expo Image Picker
• Expo FileSystem
• Expo Sharing
• Expo Print
• FlashList
• React Native Reanimated
• AsyncStorage

----------------------------------------------------
PROJECT STRUCTURE
----------------------------------------------------

Use clean architecture.

src/
│
├── api/
├── assets/
├── components/
├── constants/
├── hooks/
├── navigation/
├── screens/
├── services/
├── store/
├── theme/
├── types/
├── utils/

Everything must be reusable.

No duplicated code.

----------------------------------------------------
APP THEME
----------------------------------------------------

Color Palette

Primary Green
#3E5D46

Background
#F7F8F5

Healthy
#5AA469

Green Mold
#F5A623

Black Mold
#9B2D2D

Warning
#F6C65B

Text
#2E2E2E

Use

• Rounded cards
• Soft shadows
• Smooth animations
• Modern clean design
• Material Design principles

----------------------------------------------------
BOTTOM NAVIGATION
----------------------------------------------------

Bottom Tabs

1. Capture

2. Tracking

3. History

----------------------------------------------------
SCREEN 1
Capture
----------------------------------------------------

Screen Title

Capture Image

Subtitle

Capture or Upload a Mushroom Bag Image

UI Components

• Image Preview
• Camera Button
• Gallery Button
• Rack ID Input
• Bag ID Input
• Notes Input
• Detection Result Card
• Submit Button

Buttons

Open Camera

Upload from Gallery

Submit for Detection

----------------------------------------------------
CAPTURE FLOW
----------------------------------------------------

User opens Camera

Take Picture

Preview Image

Retake or Use Image

OR

Upload Image from Gallery

Fill

Rack ID

Bag ID

Optional Notes

Click Submit

Upload image to API

POST

/predict

multipart/form-data

file=image

Receive

status

detections[]

confidence

bbox

class

Display

Healthy

Green Mold

Black Mold

Automatically call backend to save prediction after successful detection.

----------------------------------------------------
CURRENT API
----------------------------------------------------

Already Available

POST /predict

Returns

{
status,
detections[],
confidence,
bbox,
image_size,
inference_time_ms
}

----------------------------------------------------
NEW BACKEND APIs TO CREATE
----------------------------------------------------

1.

GET /racks

Returns

[
{
"id":1,
"name":"Rack A01"
}
]

----------------------------------------------------

2.

GET /rack/{rackId}

Returns

{
total_bags,
healthy,
green_mold,
black_mold,
bags:[]
}

----------------------------------------------------

3.

POST /bag

Save Prediction

Payload

{
rack_id,
bag_id,
notes,
prediction,
confidence,
image,
captured_at
}

----------------------------------------------------

4.

GET /history

Supports

Pagination

Search

Disease Filter

Rack Filter

Date Range

----------------------------------------------------

5.

GET /history/{id}

Single Report

----------------------------------------------------

6.

DELETE /history/{id}

----------------------------------------------------

7.

GET /reports/summary

Returns

{
total,
healthy,
green_mold,
black_mold,
today,
week,
month
}

----------------------------------------------------

8.

GET /reports/pdf

Download Report

----------------------------------------------------

9.

GET /reports/excel

Export Excel

----------------------------------------------------
TRACKING SCREEN
----------------------------------------------------

UI similar to provided design.

Contains

Rack Dropdown

Statistics Cards

Total Bags

Healthy Bags

Infected Bags

Grid Layout

Each Bag should display

Bag Number

Color

Healthy

Green Mold

Black Mold

Clicking a Bag opens Bottom Sheet.

Bottom Sheet contains

Bag ID

Rack ID

Captured Image

Prediction

Confidence

Detection Date

Notes

Legend

Healthy

Green Mold

Black Mold

----------------------------------------------------
HISTORY SCREEN
----------------------------------------------------

Contains

Search Bar

Search by

Rack ID

Bag ID

Disease

Filter Chips

All

Healthy

Green Mold

Black Mold

Date Filter

Infinite Scrolling

Each Card contains

Image

Prediction

Rack

Bag

Status Badge

Detection Time

Click Card

Open Detail Screen

----------------------------------------------------
DETAIL SCREEN
----------------------------------------------------

Show

Large Image

Prediction

Confidence

Bounding Box (if available)

Rack

Bag

Notes

Inference Time

Detection Time

Buttons

Export PDF

Share Report

Delete Record

----------------------------------------------------
PDF REPORT
----------------------------------------------------

Generate professional report

Include

Application Logo

Report Number

Captured Image

Rack

Bag

Prediction

Confidence

Detection Time

Inference Time

Recommendation

Footer

Generated by

Oyster Mushroom Disease Detection System

----------------------------------------------------
EXPORT FEATURES
----------------------------------------------------

Support

PDF

Excel

Print

Share

----------------------------------------------------
STATE MANAGEMENT
----------------------------------------------------

Use Zustand

Stores

AuthStore

PredictionStore

HistoryStore

RackStore

ThemeStore

----------------------------------------------------
API LAYER
----------------------------------------------------

Axios

Create

api.ts

prediction.api.ts

rack.api.ts

history.api.ts

report.api.ts

Use

Axios Interceptors

Global Error Handling

Token Ready

----------------------------------------------------
COMPONENTS
----------------------------------------------------

Create reusable components

PrimaryButton

SecondaryButton

AppInput

Dropdown

ImageUploader

PredictionCard

StatusBadge

RackGrid

BagCard

HistoryCard

SearchBar

FilterChip

StatisticsCard

LoadingOverlay

EmptyState

ErrorView

ConfirmationDialog

----------------------------------------------------
OFFLINE SUPPORT
----------------------------------------------------

Cache History

Retry Failed Uploads

Offline Queue

Auto Sync

----------------------------------------------------
LOADING STATES
----------------------------------------------------

Skeleton Loader

Progress Indicator

Image Loading

Button Loading

Pull To Refresh

----------------------------------------------------
ERROR HANDLING
----------------------------------------------------

Camera Permission

Gallery Permission

Large Image

Invalid Image

Network Failure

Timeout

Retry

Validation Errors

Offline Mode

----------------------------------------------------
ANIMATIONS
----------------------------------------------------

Smooth Screen Transitions

Fade Animations

Card Animations

Bottom Sheet

Image Loading

Pull To Refresh

----------------------------------------------------
ACCESSIBILITY
----------------------------------------------------

Screen Reader Support

Dynamic Font Sizes

Large Touch Targets

Dark Theme Ready

----------------------------------------------------
PERFORMANCE
----------------------------------------------------

FlashList

Memoization

Lazy Loading

Image Optimization

API Caching

Pagination

----------------------------------------------------
CODE QUALITY
----------------------------------------------------

Strict TypeScript

ESLint

Prettier

Clean Architecture

Reusable Components

Proper Interfaces

No Duplicate Code

Production-ready folder structure

Well documented code

----------------------------------------------------
DELIVERABLES
----------------------------------------------------

Generate the complete Expo React Native project including

✓ Folder Structure

✓ Navigation

✓ Theme

✓ API Layer

✓ Zustand Stores

✓ Screens

✓ Components

✓ Hooks

✓ Utilities

✓ Types

✓ Services

✓ API Integration

✓ PDF Export

✓ Excel Export

✓ Offline Queue

✓ Error Handling

✓ Loading States

✓ README.md

The generated project should run without placeholder code and should be scalable enough to support future features like Authentication, Push Notifications, Cloud Sync, User Management, and Analytics.