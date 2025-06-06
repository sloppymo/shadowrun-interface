# Changelog

## v.65a (2025-06-04)
### Backend
- Switched to Python Flask backend for compatibility with Python 3.13
- Implemented persistent session, scene, and entity models using SQLite
- Added robust API endpoints for session management, scene summary, and entity CRUD (create, read, update, delete)
- Integrated OpenAI LLM streaming endpoint using httpx (async, SSE pattern)
- Role-based permissions: only GMs can edit scene/entities
- Improved error handling for LLM streaming and all endpoints
- Added comprehensive PowerShell test scripts for end-to-end backend verification

### Frontend
- Minimal React/Next.js interface scaffolded for Shadowrun multiplayer engine
- Role selector (Player, GM, Observer) with local state
- Scene Summary overlay: viewable by all, editable by GM
- Active Entities Tracker: lists all entities for the session
- Shadowrun Barren theme: dark background, neon green prompt, red accents, terminal font
- Copyright footer and version display
- Welcome message updated to "welcome back, anon"

### Project Structure & Tooling
- Modularized frontend with hooks and components directories
- Placeholder files for future features (chat/terminal, overlays)
- CHANGELOG.md and src/version.ts for version tracking

### Known Issues / Next Steps
- Chat/terminal (LLM streaming UI) not yet implemented
- No authentication or real session/user logic in frontend
- Dice roller, private messaging, and logs to be added in future versions
