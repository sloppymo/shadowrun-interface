[![Docs](https://img.shields.io/badge/docs-online-blue)](#readme)
[![API Reference](https://img.shields.io/badge/docs-API%20Reference-green)](#api-reference)
[![Coverage](https://img.shields.io/badge/coverage-unknown-lightgrey)](https://github.com/comrade-morgy/CONCLAVE/actions)

# Shadowrun Interface (Frontend)

A modern, extensible multiplayer roleplaying terminal inspired by Shadowrun, built with React/Next.js and Tailwind CSS. Features a Matrix-style UI, real-time overlays, robust command parsing, and seamless AI integration for immersive collaborative storytelling.

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Setup & Usage](#setup--usage)
- [Theming](#theming)
- [Overlays](#overlays)
- [Command Parsing](#command-parsing)
- [Multiplayer & Sessions](#multiplayer--sessions)
- [Developer Notes](#developer-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contact](#contact)

---

## Overview

The Shadowrun Interface is the user-facing terminal for the Shadowrun Multiplayer Engine. It provides:
- A cyberpunk terminal UI with advanced command parsing
- Real-time overlays for scene, entities, and shared logs
- Multiplayer session support with role selection (Player, GM, Observer)
- Streaming AI responses for natural language and command input
- Full support for the "Shadowrun Barren" theme (dark, neon green, red accents)

---

## Key Features
- **Matrix Terminal UI:** Neon green prompt, red error highlights, and dark cyberpunk styling
- **Command Parsing:** Supports `/scene`, `/roll`, `/summon`, `/echo`, `/mark`, `/meta`, `/recall`, `/pulse`, and more
- **Natural Language AI:** Any non-command input is routed to the backend for AI-driven GM responses
- **Overlays:**
  - Scene Summary Panel
  - Active Entities Tracker
  - Shared Scene Log (planned)
- **Multiplayer Sessions:** Session tokens, persistent user roles, and real-time updates
- **Role System:** Select Player, GM, or Observer, with permission-based UI
- **Streaming Output:** Real-time AI responses via SSE/EventSource
- **Theming:** Easily switch themes with the `theme` command

---

## Architecture

```
shadowrun-interface/
├── src/
│   ├── pages/
│   │   └── index.tsx         # Main terminal & overlays
│   ├── components/           # (Optional) UI components
│   ├── styles/               # Tailwind & theme config
│   └── ...
├── tailwind.config.js        # Theme customization
├── README.md                 # This file
└── ...
```

---

## Setup & Usage

### Prerequisites
- Node.js 18+
- Backend API running (see main monorepo README)

### Install & Run
```sh
npm install
npm run dev
# Visit http://localhost:3000
```

### Environment
- Configured to connect to backend at `http://localhost:5000/api`
- Edit API base in `src/pages/index.tsx` if needed

---

## Theming
- **Default:** Shadowrun Barren (dark, neon green, red accents)
- **Switch Theme:** Use the `theme` or `skin` command in the terminal
- **Customization:** Modify `tailwind.config.js` for custom color palettes

---

## Overlays
- **Scene Summary Panel:** Displays and (if GM) edits the current scene
- **Active Entities Tracker:** Shows all active players, NPCs, spirits, etc.
- **Shared Scene Log:** (Planned) Real-time log of all actions and AI/GM outputs
- **Overlay Extensibility:** Add new overlays as React components and import into `index.tsx`

---

## Command Parsing
- Recognizes `/command` and natural language
- Supported commands:
  - `/scene` — Manage scene summary (GM only)
  - `/roll` — Themed dice rolls (coming soon)
  - `/summon` — Summon spirits/entities
  - `/echo`, `/mark`, `/meta`, `/recall`, `/pulse` — Shadowrun actions
  - `help` — Show available commands
  - `clear` — Clear terminal output
  - `theme` — Switch terminal theme
- All other input is routed to the backend for AI/GM response

---

## Multiplayer & Sessions
- **Session Tokens:** Each session has a unique ID
- **Role Selection:** Player, GM, Observer (with permissions)
- **Persistent State:** Scene, entities, and chat memory are session-scoped
- **Authentication:** Clerk integration planned for secure login and role assignment

---

## Developer Notes
- **Extending Commands:** Add new commands to the parser in `index.tsx`
- **Adding Overlays:** Create new components and import into the main page
- **Styling:** Uses Tailwind CSS for rapid theme and UI changes
- **Streaming:** Uses EventSource for real-time AI output
- **API Integration:** All backend calls are routed to Flask API endpoints

---

## Troubleshooting
- **CORS Issues:** Ensure backend allows requests from frontend origin
- **API Errors:** Check backend logs for 500/400 responses
- **Streaming Fails:** Ensure `/api/chat/stream-proxy` is accessible and backend is running
- **UI Not Updating:** Check browser console for React errors

---

## Roadmap
- Private messaging (`/whisper`)
- Advanced dice roll logic with Shadowrun glitches
- GM override panel for AI output injection
- Clerk authentication and persistent user linking
- More overlays and real-time shared logs

---

## Contact
- Project lead: [@comrade-morgy](https://github.com/comrade-morgy)
- Issues and PRs welcome!

### Health Check

**GET** `/api/ping`
- Returns `{ "status": "ok", "message": "Shadowrun backend is alive." }`

---

### Session Management

**POST** `/api/session`
- Create a new session.
- **Request JSON:**
  ```json
  { "name": "Session Name", "gm_user_id": "gm-user-id" }
  ```
- **Response:**
  ```json
  { "session_id": "...", "name": "Session Name", "gm_user_id": "gm-user-id" }
  ```
- **Errors:** `{ "error": "Missing required fields" }` (400)

**POST** `/api/session/<session_id>/join`
- Join a session as a user/role.
- **Request JSON:**
  ```json
  { "user_id": "user-id", "role": "player|gm|observer" }
  ```
- **Response:**
  ```json
  { "session_id": "...", "user_id": "user-id", "role": "player" }
  ```
- **Errors:** `{ "error": "Missing user_id" }` (400)

**GET** `/api/session/<session_id>/users`
- List users/roles in a session.
- **Response:**
  ```json
  [ { "user_id": "user-id", "role": "player" }, ... ]
  ```

---

### Scene Management

**POST** `/api/session/<session_id>/scene`
- Set or update the scene summary (GM only).
- **Request JSON:**
  ```json
  { "summary": "The rain-soaked streets...", "user_id": "gm-user-id" }
  ```
- **Response:**
  ```json
  { "session_id": "...", "summary": "The rain-soaked streets..." }
  ```
- **Errors:** `{ "error": "Only GM can update scene." }` (403)

**GET** `/api/session/<session_id>/scene`
- Get the current scene summary.
- **Response:**
  ```json
  { "session_id": "...", "summary": "The rain-soaked streets..." }
  ```

---

### Entity Management

**POST** `/api/session/<session_id>/entities`
- Add or update an entity (GM only).
- **Request JSON (add):**
  ```json
  { "name": "Deckard", "type": "Runner", "status": "active", "extra_data": {"edge":3}, "user_id": "gm-user-id" }
  ```
- **Request JSON (update):**
  ```json
  { "id": 1, "name": "Deckard", "type": "Runner", "status": "marked", "extra_data": {"edge":2}, "user_id": "gm-user-id" }
  ```
- **Response:**
  ```json
  { "id": 1, "name": "Deckard", "type": "Runner", "status": "active", "extra_data": {"edge":3} }
  ```
- **Errors:** `{ "error": "Only GM can modify entities." }` (403)

**GET** `/api/session/<session_id>/entities`
- List all entities in the session.
- **Response:**
  ```json
  [ { "id": 1, "name": "Deckard", "type": "Runner", "status": "active", "extra_data": {"edge":3} }, ... ]
  ```

**DELETE** `/api/session/<session_id>/entities/<entity_id>`
- Delete an entity (GM only).
- **Request JSON:**
  ```json
  { "user_id": "gm-user-id" }
  ```
- **Response:**
  ```json
  { "status": "deleted" }
  ```
- **Errors:** `{ "error": "Only GM can delete entities." }` (403), `{ "error": "Entity not found." }` (404)

---

### Command Routing (LLM Integration)

**POST** `/api/command`
- Route a command to the LLM and get a response.
- **Request JSON:**
  ```json
  { "command": "/roll 2d6", "session_id": "...", "user_id": "...", "model": "openai|anthropic|mistral|deepseek|openrouter", "model_name": "gpt-4o|..." }
  ```
- **Response:**
  ```json
  { "status": "success", "command": "/roll 2d6", "llm_response": "You rolled a 7." }
  ```
- **Errors:** `{ "status": "error", "error": "..." }` (500)

---

### LLM Streaming (AI Chat)

**POST** `/api/llm`
- Stream LLM (AI) chat responses via Server-Sent Events (SSE).
- **Request JSON:**
  ```json
  { "session_id": "...", "user_id": "...", "input": "Describe the scene.", "model": "openai|anthropic|mistral|deepseek|openrouter", "model_name": "gpt-4o|..." }
  ```
- **Response:**
  - SSE stream of JSON lines, e.g.:
    ```
    data: {"speaker": "AI", "content": "The alley glows with neon..."}
    ```
  - On error:
    ```
    data: {"error": "Upstream API error", "type": "http", "details": "401 Unauthorized: Invalid API key"}
    ```
- **Notes:** Always check for `error` fields in streamed data.

---

](#api-reference)
- [Project Structure](#project-structure)
- [Theming](#theming)
- [Versioning & Changelog](#versioning--changelog)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Project Overview

Shadowrun Multiplayer Engine transforms the classic Wren Terminal into a feature-rich, multiplayer Shadowrun roleplaying experience. It supports persistent sessions, real-time scene and entity management, and advanced AI-driven storytelling via OpenAI and other LLMs.

- **Backend:** Python 3.13, Flask, Flask-SQLAlchemy, SQLite, httpx for async LLM streaming.
- **Frontend:** React/Next.js, Tailwind CSS, custom Shadowrun Barren theme.
- **Persistent State:** Sessions, user roles, scenes, and entities stored in SQLite.
- **AI Integration:** Direct OpenAI API calls with robust error handling and streaming via SSE.

---
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
