# Sistema de Reserva de Hoteles

Este es el proyecto frontend para el Sistema de Reserva de Hoteles, desarrollado utilizando Vue 3, TypeScript y Vite.

## 🚀 Cómo ejecutar este proyecto localmente

Sigue estos pasos para lanzar la aplicación en tu propio entorno de desarrollo.

### Requisitos previos

Asegúrate de tener instalado en tu computadora:
- **Node.js** (versión 16.0 o superior recomendada). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
- **npm** (viene instalado por defecto con Node.js).

### Instalación y configuración

1. **Clona este repositorio** (o descarga y extrae los archivos del proyecto):
   ```bash
   git clone <url-del-repositorio>
   cd reserva_hoteles
   ```

2. **Instala las dependencias** del proyecto:
   Abre una terminal en la carpeta raíz del proyecto y ejecuta:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:
   Una vez que las dependencias se hayan instalado, lanza la aplicación ejecutando:
   ```bash
   npm run dev
   ```

4. **Abre la aplicación en tu navegador**:
   En tu terminal verás una URL local (generalmente `http://localhost:5173/`). Haz clic o cópiala y pégala en tu navegador para ver la página en funcionamiento.


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
