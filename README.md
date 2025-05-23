# Personalized Chat

A chat application that uses the chat to know more about you and provide personalized responses. 
Built with Next.js, Supabase, and Tailwind CSS.

## Features
- User authentication (login & signup)
- Private, real-time chat experience
- Responsive dark theme UI
- Row Level Security (RLS) for user data privacy

## Tech Stack
- Next.js (App Router)
- React
- Supabase (Database & Auth)
- Tailwind CSS

## Getting Started
1. Clone the repository:
   ```powershell
   git clone <repo-url>
   cd personal-chat
   ```
2. Install dependencies:
   ```powershell
   pnpm install
   ```
3. Set up your Supabase project and environment variables (see `supabase/` and `.env.example`).
4. Run the development server:
   ```powershell
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure
- `src/app/` - Next.js app pages and layout
- `src/components/` - UI and chat components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Supabase client and utilities
- `supabase/` - Supabase functions, migrations, and config

