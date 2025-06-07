# Shadowrun Interface v2.0 Enhanced

A comprehensive Next.js-based platform for multiplayer Shadowrun RPG sessions, featuring advanced dice mechanics, real-time collaboration, character management, and AI-assisted gameplay.

## 🚀 New Features in v2.0

### 🖥️ Enhanced Console
- **Command History**: Navigate through previous commands with ↑↓ arrows
- **Auto-completion**: Tab completion for commands and parameters
- **Real-time Collaboration**: Live command execution sharing via WebSocket
- **Advanced Command System**: Extensible command registry with categories and help
- **Visual Feedback**: Enhanced themes, connection status, and error handling
- **Persistent Settings**: User preferences saved across sessions

### 🎲 Advanced Dice System
- **Shadowrun 5e/6e Mechanics**: Proper hit counting, glitch detection, and critical glitches
- **Edge Actions**: Reroll failures, exploding 6s, and push the limit
- **Visual Results**: Color-coded dice display with individual die results
- **Multiple Dice Types**: Shadowrun dice, standard dice (3d6), and initiative rolls
- **Dice Pool Calculator**: Automatic attribute + skill combinations

### 🎭 Character Management
- **Complete Character Sheets**: Full Shadowrun character creation and management
- **Attribute System**: All 9 core attributes with derived statistics
- **Skills Management**: Comprehensive skill list with specializations
- **Condition Monitors**: Visual damage tracking for Physical and Stun
- **Equipment Tracking**: Gear, weapons, and nuyen management
- **Character Persistence**: Cloud save with local backup

### 🎮 Session Management
- **Multiplayer Sessions**: Create and join sessions with up to 8 players
- **Role-based Access**: GM and Player roles with different permissions
- **Real-time Sync**: Live updates across all connected players
- **Session Browser**: Find and join active sessions
- **Password Protection**: Optional session security

### 🤖 Smart Command System
- **Context-aware Help**: Detailed help for each command with examples
- **Command Categories**: Organized by Basic, Game, Dice, Character, GM, and Matrix
- **Parameter Validation**: Real-time validation with helpful error messages
- **Command Aliases**: Shortened versions of common commands (`/r` for `/roll`)

## 🛠️ Technical Enhancements

### Architecture
- **Next.js 15.3.3** with TypeScript for type safety
- **WebSocket Integration** for real-time multiplayer features
- **Modular Component Design** for easy maintenance and extension
- **Comprehensive Error Handling** with user-friendly messages
- **Performance Optimizations** with lazy loading and memoization

### API Integration
- **Backend Ready**: Complete API wrapper for Flask backend integration
- **Offline Support**: Graceful degradation when backend unavailable
- **Retry Logic**: Automatic reconnection for WebSocket failures
- **Request Interceptors**: Authentication token management

### Data Management
- **Local Storage**: Settings, command history, and character backup
- **State Management**: Efficient React state with useCallback optimization
- **Data Validation**: TypeScript interfaces for type safety
- **Migration Support**: Backward compatibility with v1.0 data

## 📋 Available Commands

### Basic Commands
- `help [command]` - Show available commands or detailed help
- `clear` - Clear the console output
- `settings` - Open settings panel
- `theme <name>` - Change console theme

### Dice Commands
- `roll <dice>` - Roll Shadowrun or standard dice
  - `roll 12` - Roll 12 Shadowrun dice
  - `roll 12 limit 4` - Roll with limit
  - `roll 3d6+2` - Standard dice with modifier
  - `roll init 8` - Initiative roll
- `test <dice> <threshold>` - Make a skill test
- `edge <dice> <action>` - Spend edge on a roll

### Game Commands
- `echo <message>` - Broadcast message to all players
- `scene <description>` - Set scene (GM only)
- `summon <name>` - Summon NPC (GM only)
- `status` - Show current session and character status

### Character Commands
- `char` - Open character sheet
- `initiative` - Roll initiative
- `damage <type> <amount>` - Apply damage

## 🎨 Themes

Choose from multiple cyberpunk-inspired themes:
- **Shadowrun Barren**: Classic red/green terminal aesthetic
- **Matrix**: Green-on-black Matrix-inspired theme
- **Cyberpunk**: Purple and pink neon colors
- **Terminal**: Amber terminal colors

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Environment Setup
Copy `.env.local.example` to `.env.local` and configure:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_API_URL=http://localhost:5000  # Your backend URL
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 📱 Responsive Design

The interface works seamlessly across devices:
- **Desktop**: Full feature set with multi-panel layout
- **Tablet**: Optimized touch interface with collapsible panels
- **Mobile**: Streamlined experience with swipe navigation

## 🔌 Backend Integration

The frontend is designed to work with a Python Flask backend that provides:
- Session management and multiplayer coordination
- Command processing and validation
- AI-powered NPC responses and rule assistance
- Persistent data storage
- Real-time WebSocket communication

### API Endpoints
- `POST /sessions` - Create new session
- `GET /sessions` - List active sessions
- `POST /sessions/:id/join` - Join session
- `POST /sessions/:id/command` - Execute command
- `WebSocket /ws/:sessionId` - Real-time updates

## 🎯 Roadmap

### Phase 1: Core Enhancement (✅ Complete)
- Enhanced console with command history and auto-completion
- Advanced dice system with Shadowrun mechanics
- Character sheet management
- Session management and multiplayer support

### Phase 2: Advanced Features (In Progress)
- AI-powered NPC interactions
- Advanced GM tools (initiative tracker, scene management)
- Combat automation and damage calculation
- Equipment database and gear management

### Phase 3: Platform Features (Planned)
- Mobile app with native features
- Voice commands and speech-to-text
- Augmented reality dice rolling
- Community features and session sharing

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for:
- Code style and conventions
- Testing requirements
- Pull request process
- Issue reporting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Catalyst Game Labs for the Shadowrun RPG system
- The Shadowrun community for feedback and feature requests
- Open source contributors and maintainers

---

**Built for runners, by runners. Welcome to the 6th World, choom.**