# 🏨 Reserva Hoteles — Frontend

> Vue.js 3 Single Page Application for the Hotel Reservation Platform.

## Overview

The frontend is a **Vue.js 3 SPA** built with Vite and TypeScript. It provides different views based on user roles (guest, user, receptionist, admin) and communicates with the backend exclusively through the API Gateway at `http://localhost:8080`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue.js 3 (Composition API) |
| Build Tool | Vite 8 |
| Language | TypeScript 6 |
| Routing | Vue Router 4 |
| Maps | Leaflet + Google Maps API |
| Payments | Stripe.js SDK |
| State | Custom reactive store (Composition API) |

## Architecture

```
src/
├── App.vue                 # Root component (navigation + router-view)
├── main.ts                 # App initialization
├── style.css               # Global styles
├── router/
│   └── index.ts            # Route definitions + auth guards
├── store/
│   └── hotelStore.ts       # Centralized state management
├── views/
│   ├── HomeView.vue        # Hotel browsing (guest/user)
│   ├── HotelDetailView.vue # Hotel detail + room listing
│   ├── MapView.vue         # Interactive map of hotels
│   ├── LoginView.vue       # Login form
│   ├── RegisterView.vue    # Registration form
│   ├── ProfileView.vue     # User profile management
│   ├── ReceptionistView.vue# Receptionist dashboard
│   └── AdminView.vue       # Admin dashboard (hotel/room management)
├── components/
│   ├── BookingForm.vue     # Reservation creation form
│   ├── DateRangePicker.vue # Check-in/check-out date picker
│   ├── GuestSelector.vue   # Guest count selector
│   ├── HotelCard.vue       # Hotel list card component
│   ├── RoomCard.vue        # Room type card component
│   ├── RoomDetailsModal.vue # Room detail modal
│   ├── ReservationList.vue # User's reservations list
│   ├── GoogleMap.vue       # Google Maps embed
│   ├── LocationPickerMap.vue # Admin location picker
│   ├── CustomDialog.vue    # Reusable dialog component
│   ├── SvgIcon.vue         # Dynamic SVG icon component
│   └── HelloWorld.vue      # Template component
└── assets/                 # Static assets
```

## Pages and Roles

| Route | View | Auth Required | Roles |
|---|---|---|---|
| `/` | HomeView | ❌ | Guest, User |
| `/hotel/:id` | HotelDetailView | ❌ | Guest, User |
| `/mapa` | MapView | ❌ | Guest, User |
| `/login` | LoginView | ❌ | Guest |
| `/register` | RegisterView | ❌ | Guest |
| `/profile` | ProfileView | ✅ | All authenticated |
| `/receptionist` | ReceptionistView | ✅ | Receptionist, Admin |
| `/admin` | AdminView | ✅ | Admin only |

## Route Guards

The router implements role-based access control:

1. Authenticated users cannot access `/login` or `/register` (redirected to their dashboard)
2. Protected routes redirect unauthenticated users to `/login`
3. **Admin** users are restricted to `/admin` and `/profile`
4. **Receptionist** users are restricted to `/receptionist` and `/profile`
5. Role-based routes check `currentUser.role` against `meta.roles`

## Running Locally

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
vue-tsc -b && vite build

# Preview production build
npm run preview
```
