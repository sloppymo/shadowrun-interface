# DM Review Interface Design

## Overview

The DM Review Interface allows game masters to review, edit, or reject AI-generated responses before they are shown to players. This maintains the GM's narrative control while leveraging AI assistance.

## Core Components

### 1. Response Queue Panel

- Displays pending AI responses requiring review
- Sorted by priority (high, medium, low)
- Visual indicators for response type (general, combat, NPC interaction)
- Shows timestamp and waiting player name

### 2. Review and Edit Panel

- Side-by-side display of:
  - Original player query/action
  - Context information
  - AI-generated response
  - Editable response field
- Rich text editing capabilities
- Syntax highlighting for game mechanics

### 3. Context Display

- Character information for involved parties
- Recent conversation history
- Current scene details
- Active game state (combat rounds, skill checks, etc.)

### 4. Action Buttons

- Approve Original: Send AI response unchanged
- Approve Edited: Send modified response
- Reject: Discard AI response and handle manually
- Hold: Keep in queue for later review

## Component Integration

```tsx
// In pages/gm/review.tsx
import { DMReviewPanel } from '../../components/DMReviewPanel';
import { useSession } from '../../contexts/SessionContext';

export default function ReviewPage() {
  const { sessionId, theme } = useSession();
  
  return (
    <div className="min-h-screen">
      <h1 className="text-xl font-bold p-4">GM Review Queue</h1>
      <DMReviewPanel sessionId={sessionId} theme={theme} />
    </div>
  );
}
```

## Notification System Integration

- Browser notifications for new pending responses
- Sound alerts for high-priority items
- Status indicators in the main GM interface showing queue size
- Session timer showing how long players have been waiting

## Keyboard Shortcuts

| Key Combination | Action |
|----------------|--------|
| Alt+A | Approve Original |
| Alt+E | Approve Edited |
| Alt+R | Reject |
| Alt+H | Hold |
| Alt+N | Next Item |
| Alt+P | Previous Item |

## UX Workflow

1. AI generates response to player action
2. Response enters review queue with appropriate priority
3. GM receives notification of pending review
4. GM reviews context and AI response
5. GM approves, edits, or rejects response
6. System delivers approved response to player
7. Transaction is logged for future reference

## Mockup Design

```
+---------------------------------------+-------------------------------------------+
|                                       |                                           |
| PENDING REVIEWS                       | REVIEW PANEL                              |
|                                       |                                           |
| [H] Fixer: "What about the job?"      | PLAYER QUERY:                             |
|     2 min ago                         | Fixer asks: "What's the payout for        |
|                                       | the downtown extraction job?"             |
| [M] Decker: Matrix search             |                                           |
|     45 sec ago                        | CONTEXT:                                  |
|                                       | - Johnson meeting scene                   |
|                                       | - Corporate extraction job discussed      |
|                                       | - Previous mention: ¥20,000 per runner    |
|                                       |                                           |
|                                       | AI RESPONSE:                              |
|                                       | The Johnson leans forward, voice low:     |
|                                       | "Standard payout is ¥20,000 per runner,   |
|                                       | with a ¥10,000 bonus for clean extraction |
|                                       | without casualties."                      |
|                                       |                                           |
|                                       | EDIT RESPONSE:                            |
|                                       | +----------------------------------+      |
|                                       | | The Johnson leans forward,       |      |
|                                       | | voice low: "Standard payout is   |      |
|                                       | | ¥20,000 per runner, with a       |      |
|                                       | | ¥10,000 bonus for clean          |      |
|                                       | | extraction without casualties.    |      |
|                                       | | Plus expenses, of course."       |      |
|                                       | +----------------------------------+      |
|                                       |                                           |
|                                       | [Approve Original] [Approve Edit] [Reject]|
+---------------------------------------+-------------------------------------------+
```

## Mobile Responsiveness

On mobile devices:
- Collapsible sidebar for pending reviews
- Swipeable interface between reviews
- Simplified editing tools
- Voice dictation for response editing

## Terminal-Style Integration

To maintain the cyberpunk aesthetic:
- Monospaced font for all text
- Color scheme matching the selected Shadowrun theme
- Command-line style notification system
- ASCII art decorative elements
- Animation effects mimicking old CRT displays
