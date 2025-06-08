# Shadowrun GM Dashboard - Frontend Documentation

## Overview

The Shadowrun GM Dashboard frontend is a React/Next.js application that provides a comprehensive Game Master interface for managing Shadowrun 6th Edition campaigns. Built with TypeScript and Tailwind CSS, it offers real-time campaign management tools, AI integration, and seamless backend connectivity.

## Architecture

### Technology Stack
- **Framework**: Next.js 13+ with React 18
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Authentication**: Clerk for user management
- **State Management**: React hooks (useState, useEffect)
- **Real-time Updates**: Server-Sent Events (SSE)
- **Build Tool**: Vite for development and testing
- **Testing**: Jest and Vitest for unit/integration tests

### Project Structure
```
shadowrun-interface/
├── components/           # React components
│   ├── GMDashboard.tsx  # Main dashboard component
│   ├── DiceRoller.tsx   # 3D dice rolling interface
│   ├── CombatManager.tsx # Combat encounter management
│   ├── CharacterSheet.tsx # Character sheet viewer
│   ├── MatrixInterface.tsx # Matrix hacking interface
│   └── ...
├── pages/               # Next.js pages
├── src/                 # Source code
│   ├── components/      # Additional components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── styles/         # Global styles
├── tests/              # Test files
└── docs/               # Documentation
```

## Core Components

### GMDashboard.tsx

The main dashboard component that orchestrates all GM functionality through a tabbed interface.

#### Component Overview
```typescript
interface GMDashboardProps {
  sessionId: string;      // Current campaign session ID
  isVisible: boolean;     // Dashboard visibility state
  onClose: () => void;    // Close callback function
}
```

#### Key Features
- **12 Specialized Tabs**: Each focused on specific GM tasks
- **Real-time Updates**: Live data synchronization with backend
- **Responsive Design**: Adapts to different screen sizes
- **State Management**: Comprehensive state for all dashboard features
- **Error Handling**: Graceful error recovery and user feedback

#### Tab Structure
1. **📋 Review Queue** - AI response moderation
2. **🎭 Scene Control** - Narrative scene management
3. **👥 NPCs & Factions** - Character relationship tracking
4. **⚔️ Combat Manager** - Initiative and damage tracking
5. **🎯 Character Viewer** - Player character monitoring
6. **🔮 Matrix Dashboard** - Virtual reality operations
7. **📊 Session Analytics** - Performance metrics
8. **👁️ Live Monitoring** - Real-time player status
9. **📅 Campaign Timeline** - Story progression tracking
10. **🎲 Generators** - Random content creation
11. **🛠️ GM Tools** - Utility functions
12. **📨 Slack Controls** - Team communication

### State Management

#### Core Dashboard State
```typescript
// Primary navigation and loading states
const [activeTab, setActiveTab] = useState<string>('review');
const [isLoading, setIsLoading] = useState(false);
```

#### Review Queue State
```typescript
// AI response moderation system
const [pendingResponses, setPendingResponses] = useState<PendingResponse[]>([]);
const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
const [editingResponse, setEditingResponse] = useState<string | null>(null);
const [editText, setEditText] = useState('');
```

#### Scene Management State
```typescript
// Narrative scene orchestration
const [currentScene, setCurrentScene] = useState<Scene | null>(null);
const [newScene, setNewScene] = useState({
  name: '',
  description: '',
  location: '',
  tone: 'neutral',
  timeOfDay: 'day',
  tags: [] as string[]
});
```

#### Combat Management State
```typescript
// Shadowrun 6E combat tracking
const [combatants, setCombatants] = useState<Combatant[]>([]);
const [activeCombat, setActiveCombat] = useState<any>(null);
const [combatRound, setCombatRound] = useState(1);
const [activeInitiative, setActiveInitiative] = useState(0);
const [combatLog, setCombatLog] = useState<any[]>([]);
```

## TypeScript Interfaces

### PendingResponse
Represents AI-generated content awaiting GM review.

```typescript
interface PendingResponse {
  id: string;                    // Unique identifier
  session_id: string;           // Associated session
  user_id: string;              // Triggering player
  context: string;              // Original player input
  ai_response: string;          // Generated AI content
  response_type: string;        // Content category
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  dm_notes?: string;            // GM review notes
  final_response?: string;      // Edited content
  created_at: string;           // Creation timestamp
  priority: number;             // Queue priority (1-3)
}
```

### Combatant
Represents participants in Shadowrun 6E combat encounters.

```typescript
interface Combatant {
  id: string;                   // Unique identifier
  name: string;                 // Character/NPC name
  initiative: number;           // Initiative score
  edge: number;                 // Maximum Edge points
  currentEdge: number;          // Available Edge points
  status: string;               // Combat status
  type: 'player' | 'npc' | 'spirit' | 'drone';
  actions: number;              // Actions per turn
  physicalDamage: number;       // Physical damage taken
  stunDamage: number;           // Stun damage taken
  physicalMonitor: number;      // Physical condition monitor
  stunMonitor: number;          // Stun condition monitor
}
```

### Scene
Represents narrative scenes and locations.

```typescript
interface Scene {
  id: string;                   // Unique identifier
  name: string;                 // Scene title
  description: string;          // Detailed description
  location: string;             // Physical location
  tone: string;                 // Narrative mood
  timeOfDay: string;            // Time setting
  tags: string[];               // Categorization tags
  symbolism?: string[];         // Symbolic elements
}
```

### NPC
Represents Non-Player Characters and their relationships.

```typescript
interface NPC {
  id: string;                   // Unique identifier
  name: string;                 // Character name
  faction?: string;             // Corporate/gang affiliation
  motivation?: string;          // Primary goal
  mood: string;                 // Current attitude
  stats?: any;                  // Combat statistics
  allegiances: string[];        // Faction relationships
  status: 'active' | 'neutral' | 'hostile' | 'allied';
}
```

## Key Functions

### Data Fetching Functions

#### fetchPendingResponses()
```typescript
const fetchPendingResponses = async () => {
  try {
    const response = await fetch(`/api/session/${sessionId}/pending-responses`);
    const data = await response.json();
    setPendingResponses(data.items || []);
  } catch (error) {
    console.error('Failed to fetch pending responses:', error);
  }
};
```

#### fetchPlayerCharacters()
```typescript
const fetchPlayerCharacters = async () => {
  try {
    const response = await fetch(`/api/session/${sessionId}/characters`);
    const data = await response.json();
    setPlayerCharacters(data);
  } catch (error) {
    console.error('Failed to fetch player characters:', error);
  }
};
```

### Action Handlers

#### handleReviewResponse()
```typescript
const handleReviewResponse = async (
  responseId: string, 
  action: 'approve' | 'reject' | 'edit', 
  finalText?: string
) => {
  try {
    const response = await fetch(`/api/session/${sessionId}/pending-response/${responseId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user?.id,
        action,
        final_response: finalText,
        dm_notes: `${action} by GM`
      })
    });
    
    if (response.ok) {
      await fetchPendingResponses(); // Refresh the queue
    }
  } catch (error) {
    console.error('Failed to review response:', error);
  }
};
```

#### pushSceneToPlayers()
```typescript
const pushSceneToPlayers = async () => {
  if (!currentScene) return;
  
  try {
    const response = await fetch(`/api/session/${sessionId}/scene`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user?.id,
        summary: currentScene.description
      })
    });
    
    if (response.ok) {
      // Scene successfully pushed to players
      console.log('Scene pushed to players');
    }
  } catch (error) {
    console.error('Failed to push scene:', error);
  }
};
```

## Dashboard Tabs

### 1. Review Queue (📋)
**Purpose**: Moderate AI-generated responses before delivery to players.

**Features**:
- Priority-based queue sorting
- Bulk approval/rejection
- Inline editing capabilities
- Response type categorization
- GM notes and annotations

**Key Components**:
```typescript
// Response priority indicator
const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 3: return 'text-red-400';    // High priority
    case 2: return 'text-yellow-400'; // Medium priority
    default: return 'text-green-400'; // Low priority
  }
};

// Bulk action handler
const handleBulkAction = (action: string) => {
  selectedResponses.forEach(responseId => {
    handleReviewResponse(responseId, action as any);
  });
  setSelectedResponses(new Set());
};
```

### 2. Scene Control (🎭)
**Purpose**: Orchestrate narrative scenes and environmental storytelling.

**Features**:
- Scene creation and editing
- Environmental mood setting
- Time of day management
- Location tracking
- Tag-based organization

**Scene Creation Form**:
```typescript
const createScene = () => {
  const scene: Scene = {
    id: Date.now().toString(),
    name: newScene.name,
    description: newScene.description,
    location: newScene.location,
    tone: newScene.tone,
    timeOfDay: newScene.timeOfDay,
    tags: newScene.tags
  };
  setCurrentScene(scene);
};
```

### 3. NPCs & Factions (👥)
**Purpose**: Track Non-Player Characters and faction relationships.

**Features**:
- NPC creation and management
- Faction allegiance tracking
- Mood and motivation monitoring
- Relationship status updates
- Quick stat reference

**NPC Management**:
```typescript
const addNPC = () => {
  const npc: NPC = {
    id: Date.now().toString(),
    name: newNPC.name,
    faction: newNPC.faction,
    motivation: newNPC.motivation,
    mood: newNPC.mood,
    allegiances: newNPC.allegiances,
    status: 'neutral'
  };
  setNpcs([...npcs, npc]);
};
```

### 4. Combat Manager (⚔️)
**Purpose**: Track Shadowrun 6E combat encounters with full rule support.

**Features**:
- Initiative order management
- Damage tracking (Physical/Stun)
- Edge point monitoring
- Status effect tracking
- Action economy management
- Combat log recording

**Combat Functions**:
```typescript
// Apply damage to combatant
const applyDamage = (combatantId: string, damage: number, type: 'physical' | 'stun') => {
  setCombatants(prev => prev.map(c => {
    if (c.id === combatantId) {
      const newDamage = type === 'physical' 
        ? Math.min(c.physicalDamage + damage, c.physicalMonitor)
        : Math.min(c.stunDamage + damage, c.stunMonitor);
      
      return {
        ...c,
        [type === 'physical' ? 'physicalDamage' : 'stunDamage']: newDamage
      };
    }
    return c;
  }));
};

// Advance to next combatant
const nextInitiative = () => {
  setActiveInitiative(prev => {
    const next = (prev + 1) % combatants.length;
    if (next === 0) {
      setCombatRound(round => round + 1);
    }
    return next;
  });
};
```

### 5. Character Viewer (🎯)
**Purpose**: Monitor all player characters in real-time.

**Features**:
- Live character sheet viewing
- Attribute and skill monitoring
- Edge tracking
- Condition monitor overview
- Equipment status
- Character sheet integration

### 6. Matrix Dashboard (🔮)
**Purpose**: Visualize and manage Matrix operations.

**Features**:
- 3D Matrix grid visualization
- Node management
- ICE program tracking
- Overwatch Score monitoring
- Persona attribute display
- Matrix action logging

### 7. Session Analytics (📊)
**Purpose**: Track campaign performance and player engagement.

**Features**:
- Player action frequency
- Combat encounter statistics
- Session duration tracking
- Success/failure rates
- Engagement metrics
- Performance recommendations

### 8. Live Monitoring (👁️)
**Purpose**: Real-time player status and activity tracking.

**Features**:
- Active connection monitoring
- Current player actions
- Resource tracking
- Communication status
- Alert notifications

### 9. Campaign Timeline (📅)
**Purpose**: Track story progression and major events.

**Features**:
- Interactive timeline
- Event categorization
- Plot thread tracking
- NPC relationship mapping
- Story arc visualization

### 10. Random Generators (🎲)
**Purpose**: Generate content on-the-fly for dynamic gameplay.

**Features**:
- NPC generator with stats
- Location generator
- Corporate run generator
- Weather/environment
- Street rumors and news

### 11. GM Tools (🛠️)
**Purpose**: Utility functions for campaign management.

**Features**:
- Dice roller integration
- Rules reference
- Quick lookup tables
- Note-taking tools
- Session planning aids

### 12. Slack Controls (📨)
**Purpose**: Manage team communication and bot interactions.

**Features**:
- Channel management
- Bot command interface
- Notification settings
- Message broadcasting
- Integration status

## Styling and Theming

### Tailwind CSS Classes
The dashboard uses a consistent color scheme based on tab categories:

```typescript
const getTabColor = (color: string) => {
  const colors = {
    red: 'border-red-500 text-red-400',
    purple: 'border-purple-500 text-purple-400',
    blue: 'border-blue-500 text-blue-400',
    orange: 'border-orange-500 text-orange-400',
    green: 'border-green-500 text-green-400',
    cyan: 'border-cyan-500 text-cyan-400',
    // ... additional colors
  };
  return colors[color] || 'border-gray-500 text-gray-400';
};
```

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for medium screens
- **Desktop Enhanced**: Full feature set on large screens

### Dark Theme
- **Background**: Dark gray/black color scheme
- **Accent Colors**: Bright colors for important elements
- **Contrast**: High contrast for accessibility
- **Consistency**: Unified theme across all components

## Error Handling

### API Error Handling
```typescript
const handleApiError = (error: any, operation: string) => {
  console.error(`Failed to ${operation}:`, error);
  // Could integrate with toast notifications or error modal
  setIsLoading(false);
};
```

### Graceful Degradation
- **Offline Support**: Basic functionality when disconnected
- **Fallback Data**: Mock data when API unavailable
- **Error Boundaries**: React error boundaries for crash prevention
- **User Feedback**: Clear error messages and recovery options

## Performance Optimization

### State Management
- **Selective Updates**: Only update necessary state slices
- **Memoization**: Use React.memo for expensive components
- **Lazy Loading**: Load tab content on demand
- **Debouncing**: Debounce API calls for real-time features

### Network Optimization
- **Request Batching**: Combine multiple API calls
- **Caching**: Cache frequently accessed data
- **Compression**: Gzip compression for API responses
- **CDN**: Static asset delivery via CDN

## Testing Strategy

### Unit Tests
```typescript
// Example test for combat damage calculation
describe('Combat Manager', () => {
  test('applies physical damage correctly', () => {
    const combatant = {
      id: '1',
      physicalDamage: 2,
      physicalMonitor: 10
    };
    
    const result = applyDamage(combatant, 3, 'physical');
    expect(result.physicalDamage).toBe(5);
  });
});
```

### Integration Tests
- **API Integration**: Test backend connectivity
- **User Workflows**: Test complete user journeys
- **Cross-browser**: Ensure compatibility across browsers
- **Responsive**: Test on various screen sizes

### E2E Tests
- **Critical Paths**: Test main GM workflows
- **Error Scenarios**: Test error handling
- **Performance**: Test under load conditions

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality gates

### Git Workflow
- **Feature Branches**: Separate branches for features
- **Pull Requests**: Code review process
- **Semantic Commits**: Conventional commit messages
- **Automated Testing**: CI/CD pipeline integration

## Deployment

### Build Process
```bash
# Production build
npm run build

# Static export (if needed)
npm run export

# Start production server
npm start
```

### Environment Configuration
```typescript
// Environment variables
const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  environment: process.env.NODE_ENV || 'development'
};
```

### Hosting Options
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative static hosting
- **AWS**: Enterprise deployment option
- **Docker**: Containerized deployment

## Future Enhancements

### Planned Features
- **WebRTC**: Real-time voice/video integration
- **WebGL**: Enhanced 3D Matrix visualization
- **PWA**: Progressive Web App capabilities
- **Mobile App**: Native mobile application
- **VR Support**: Virtual reality GM interface

### Performance Improvements
- **Service Workers**: Offline functionality
- **Code Splitting**: Reduce initial bundle size
- **Tree Shaking**: Remove unused code
- **Image Optimization**: Automatic image optimization

### Accessibility
- **WCAG Compliance**: Web accessibility standards
- **Screen Reader**: Full screen reader support
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast**: Enhanced contrast modes 