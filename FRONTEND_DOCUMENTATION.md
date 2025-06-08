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

## Dashboard Tabs

### 1. Review Queue (📋)
**Purpose**: Moderate AI-generated responses before delivery to players.

**Features**:
- Priority-based queue sorting
- Bulk approval/rejection
- Inline editing capabilities
- Response type categorization
- GM notes and annotations

### 2. Scene Control (🎭)
**Purpose**: Orchestrate narrative scenes and environmental storytelling.

**Features**:
- Scene creation and editing
- Environmental mood setting
- Time of day management
- Location tracking
- Tag-based organization

### 3. Combat Manager (⚔️)
**Purpose**: Track Shadowrun 6E combat encounters with full rule support.

**Features**:
- Initiative order management
- Damage tracking (Physical/Stun)
- Edge point monitoring
- Status effect tracking
- Action economy management
- Combat log recording

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
    cyan: 'border-cyan-500 text-cyan-400'
  };
  return colors[color] || 'border-gray-500 text-gray-400';
};
```

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