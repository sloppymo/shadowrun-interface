# Shadowrun Interface

A Next.js frontend for the multiplayer Shadowrun roleplaying engine, featuring a terminal-inspired interface with specialized commands, role-based permissions, and AI-assisted gameplay.

## Project Overview

This project is a standalone frontend for the Shadowrun RPG engine, built with:
- Next.js with TypeScript
- Tailwind CSS for styling
- Clerk for authentication
- React Query for data fetching

## Features

- Command parsing for specialized Shadowrun commands
- Multiplayer session support with session tokens
- Role selection (Player, GM, Observer) with different permissions
- Themed terminal interface with customizable appearance
- Secure authentication via Clerk
- Responsive design for various device sizes

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Clerk account for authentication

### Local Development

1. Clone this repository
2. Copy `.env.local.example` to `.env.local` and add your Clerk API keys
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

This project is configured for easy deployment to Vercel:

1. Create a new GitHub repository
2. Push this project to the repository
3. Create a new project in Vercel and connect it to your GitHub repo
4. Add the required environment variables in Vercel:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. Deploy

## Backend Integration

This frontend is designed to work with a Python Flask backend that handles:
- Command routing API
- Session management
- AI interaction
- Multiuser coordination

The backend repository is separate and should be deployed independently.
