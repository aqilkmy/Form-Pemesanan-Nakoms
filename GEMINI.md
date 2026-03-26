# Project Overview: Form Pemesanan Nakoms (Rizzmed)

**Form Pemesanan Nakoms** (also referred to as **Rizzmed**) is a centralized order management system for **BEM Unsoed 2026**. It allows various ministries (Kementerian) within the organization to request services such as graphic design, social media publication, website adjustments, technical assistance (podcasts, live streaming), and survey publications.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Radix UI (via Shadcn UI)
- **State & Forms:** React Hook Form + Zod (Validation)
- **Backend/Database:** Supabase (PostgreSQL)
- **Calendar:** FullCalendar
- **Icons:** Lucide React

## Project Structure
- `src/app/`: Contains the main application routes.
  - `/`: The public-facing multi-step order form.
  - `/admin/`: Admin login and management dashboard.
  - `/jadwal/`: Visual calendar view of scheduled publications and events.
  - `/monitoring/`: Real-time tracking of order statuses.
- `src/components/`:
  - `admin/`: Components for the administrative interface.
  - `form/`: Core form components (`OrderForm`, `MenuSelector`, `StepIdentity`, and specific menu forms).
  - `layout/`: Global layout components like `Navbar`.
  - `monitoring/`: Dashboard for tracking orders.
  - `schedule/`: Calendar components.
  - `ui/`: Reusable primitive components (Shadcn UI).
- `src/lib/`:
  - `constants.ts`: **Source of truth** for ministries, platform options, and Penanggung Jawab (PJ) mappings.
  - `schema.ts`: Zod validation schemas for all form types.
  - `supabase.ts`: Supabase client initialization.
- `supabase/`: Contains `schema.sql` for database setup.

## Key Logic: PJ Mapping
A significant part of the project's logic resides in `src/lib/constants.ts`. It maps specific ministries to their respective Penanggung Jawab (PJ) for different services (Design, Website, etc.). This mapping is used to determine who is responsible for a particular request.

## Building and Running
- **Development:** `npm run dev`
- **Production Build:** `npm run build`
- **Start Production:** `npm run start`
- **Linting:** `npm run lint`

## Development Conventions
- **Component Styling:** Use Tailwind CSS for all styling. Follow Shadcn UI patterns for new components.
- **Form Validation:** All new form fields must be added to the Zod schemas in `src/lib/schema.ts`.
- **Database:** Changes to the data model should be reflected in `supabase/schema.sql`. The `orders` table uses a `menu_type` discriminator to handle different types of requests in a single table.
- **Environment Variables:**
  - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous API key.
