# Reserva Hoteles

A small hotel reservation single-page application built with Vue 3, TypeScript and Vite.

## Table of Contents

- Installation
- Running
- Architecture
- Available Scripts
- Contributing

## Installation

Prerequisites

- Node.js 16 or later
- npm (or Yarn / pnpm)

Install local dependencies:

```bash
git clone <repo-url>
cd Reserva_Hoteles
npm install
# or: yarn install
# or: pnpm install
```

## Running (Development)

Start the dev server (Vite):

```bash
npm run dev
```

By default the dev server runs on http://localhost:5173.

## Build & Preview (Production)

Type-check and build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Note: `npm run build` runs `vue-tsc -b` before `vite build`, so it performs a full TypeScript check.

## Project Architecture

This project is a Vue 3 + TypeScript SPA using Vite as the build tool. Key folders and files:

- `src/` – Application source code
	- `main.ts` – App bootstrap (mounts App and installs router)
	- `App.vue` – Root component
	- `components/` – Reusable UI components (e.g. `BookingForm.vue`, `DateRangePicker.vue`, `GuestSelector.vue`, `HotelCard.vue`, `RoomCard.vue`, `RoomDetailsModal.vue`, `ReservationList.vue`)
	- `views/` – Route-level views (e.g. `HomeView.vue`, `HotelDetailView.vue`, `LoginView.vue`, `RegisterView.vue`, `ProfileView.vue`, `AdminView.vue`, `ReceptionistView.vue`)
	- `router/` – Vue Router setup (`index.ts`) with route guards that check authentication and roles
	- `store/` – Application state (`hotelStore.ts`): a small reactive store built with Vue's `reactive` and `watch`, persisted to `localStorage`
	- `assets/` & `public/` – Static styles and images

### State & Data Flow

- The app exposes `useHotelStore()` (in `src/store/hotelStore.ts`) which returns the reactive state and action methods. This is not Pinia/Vuex: it is a lightweight, project-scoped reactive store.
- The store persists to `localStorage` and contains seeded data (hotels, rooms, reservations, and sample users).
- Routing guards in `src/router/index.ts` use the store's `state.currentUser` to enforce `requiresAuth` and role-based access.

### Roles and Auth

- Roles defined: `client`, `receptionist`, `admin` (see `src/store/hotelStore.ts`).
- The repository contains example users seeded in the store for local development.

## Available Scripts

See `package.json` for full details. Important scripts:

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check (via `vue-tsc`) and build production bundle
- `npm run preview` — Preview the production build locally

## Contributing

- Please open issues or PRs for fixes and improvements.
- Keep changes focused and add small, reviewable commits.
