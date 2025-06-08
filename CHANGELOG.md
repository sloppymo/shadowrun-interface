# Changelog

## v0.89.0-beta (2025-06-07)

### 🔐 Security Enhancements
- **AI Input Validation**: Implemented Pydantic schemas to block malicious prompts, SQL injection, and code execution attempts
- **Dice Parser Security**: Replaced eval() with safe regex-based parser, prevents command injection
- **WebSocket Authentication**: Added JWT-based auth with rate limiting and connection management
- **Slack Security**: Enhanced timestamp validation to prevent replay attacks (5-minute window)
- **XSS Prevention**: Added comprehensive HTML sanitization for frontend and backend

### 🧪 Testing & Quality Assurance
- **Backend Tests**: Added security, edge mechanics, Slack integration, and race condition tests (85%+ coverage)
- **Frontend Tests**: Added DiceRoller XSS prevention and WebSocket reconnection tests (78%+ coverage)
- **Fuzz Testing**: Comprehensive unicode, emoji, and symbolic input testing
- **Race Conditions**: Tests for concurrent operations, DM approvals, and combat scenarios

### 🔧 Developer Experience
- **Debug CLI**: New tool for inspecting game state, debugging crises, and exporting data
- **Setup Automation**: One-command dev environment setup with `scripts/dev_setup.sh`
- **Makefile Enhancements**: Added `make qa`, `make test-security`, `make deploy-check`
- **Flask Decorators**: New security decorators for auth, rate limiting, and validation

### 📦 Infrastructure
- **Rate Limiting**: Implemented on all endpoints with Redis/in-memory fallback
- **WebSocket Management**: Connection pooling, heartbeat mechanism, auto-reconnection
- **Monitoring Ready**: Structured logging, performance metrics, error tracking

### 🎯 Production Readiness
- All critical security vulnerabilities resolved
- Input validation on all user-facing endpoints
- Comprehensive error handling and recovery
- Documentation for deployment and monitoring

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
