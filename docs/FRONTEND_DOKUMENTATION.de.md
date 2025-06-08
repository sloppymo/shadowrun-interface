# Shadowrun Interface - Frontend-Dokumentation

## Überblick

Das Shadowrun Interface ist eine React/Next.js-Anwendung, die eine umfassende Benutzeroberfläche für Multiplayer-Shadowrun-6E-Sitzungen bereitstellt. Es integriert sich nahtlos mit dem Backend und bietet sowohl Spieler- als auch GM-Funktionalitäten.

## Technologie-Stack

### Kern-Technologien
- **Next.js 15.3.3** - React-Framework mit Server-Side Rendering
- **React 18** - Benutzeroberflächen-Bibliothek
- **TypeScript** - Typisiertes JavaScript
- **Tailwind CSS** - Utility-First CSS-Framework
- **Clerk** - Authentifizierung und Benutzerverwaltung

### Zusätzliche Bibliotheken
- **Three.js** - 3D-Grafiken für Matrix-Visualisierung
- **Chart.js** - Diagramme und Analytik
- **React Konva** - 2D-Canvas-Rendering für Kampfkarten
- **Socket.io Client** - WebSocket-Kommunikation
- **Framer Motion** - Animationen und Übergänge

## Projektstruktur

```
shadowrun-interface/
├── components/                 # React-Komponenten
│   ├── character/             # Charaktererstellung/-management
│   │   └── steps/            # Charaktererstellungsschritte
│   ├── ui/                   # Wiederverwendbare UI-Komponenten
│   └── GMDashboard.tsx       # Haupt-GM-Dashboard
├── pages/                    # Next.js-Seiten
│   ├── _app.tsx             # App-Wrapper
│   ├── index.tsx            # Startseite
│   ├── console.tsx          # Terminal-Interface
│   ├── dashboard.tsx        # GM-Dashboard
│   └── dice-roller.tsx      # Würfel-Tool
├── src/                     # Zusätzliche Quellcode-Ordner
│   ├── components/          # Geteilte Komponenten
│   ├── hooks/              # Custom React Hooks
│   ├── utils/              # Hilfsfunktionen
│   └── styles/             # Globale Styles
├── utils/                  # Allgemeine Hilfsfunktionen
├── styles/                 # CSS-Dateien
└── public/                # Statische Assets
```

## Kernkomponenten

### GMDashboard.tsx - Haupt-Dashboard

Das GM-Dashboard ist die zentrale Komponente mit 12 funktionalen Tabs:

#### 1. Review Queue (📋)
- Verwaltung ausstehender KI-Antworten
- Genehmigen, Ablehnen oder Bearbeiten von Inhalten
- Prioritätssortierung nach Dringlichkeit

```typescript
interface PendingResponse {
  id: string;
  user_id: string;
  context: string;
  ai_response: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  priority: number;
  created_at: string;
  response_type: string;
}
```

#### 2. Scene Manager (🎬)
- Szenenbeschreibungen erstellen und verwalten
- Szenen-Bibliothek mit Vorlagen
- Echtzeit-Szenen-Push an alle Spieler

```typescript
interface Scene {
  id: string;
  title: string;
  description: string;
  environment: string;
  npcs: string[];
  threats: string[];
  opportunities: string[];
}
```

#### 3. NPC & Factions (👥)
- NPC-Datenbank mit KI-generierten Profilen
- Fraktionsverwaltung und Beziehungsnetze
- Dynamische NPC-Generierung

```typescript
interface NPC {
  id: string;
  name: string;
  role: string;
  disposition: 'friendly' | 'neutral' | 'hostile';
  corporation?: string;
  skills: string[];
  description: string;
  notes: string;
}
```

#### 4. Combat Manager (⚔️)
- Initiative-Tracking mit Drag-&-Drop-Sortierung
- Gesundheits- und Schadensverfolgung
- Statuseffekte und Zustandsmonitore
- Automatische Rundenverwaltung

```typescript
interface Combatant {
  id: string;
  name: string;
  initiative: number;
  physicalDamage: number;
  stunDamage: number;
  status: string[];
  edge: number;
  currentEdge: number;
  type: 'player' | 'npc' | 'drone' | 'spirit';
}
```

#### 5. Character Viewer (🎯)
- Live-Charakterbögen aller Spieler
- Attributs- und Fertigkeitsüberwachung
- Edge-Pool-Tracking
- Karma-Punkteverwaltung

#### 6. Matrix Dashboard (🔮)
- Interaktives Matrix-Grid mit Knotenvisualisierung
- ICE-Programmverwaltung
- Überwatch-Score-Monitoring
- Matrix-Persona-Tracking

```typescript
interface MatrixNode {
  id: string;
  name: string;
  type: 'host' | 'device' | 'persona' | 'file';
  security: number;
  discovered: boolean;
  compromised: boolean;
  position_x: number;
  position_y: number;
}
```

#### 7. Session Analytics (📊)
- Spielerengagement-Metriken
- Kampfstatistiken
- Aktionsverteilungsdiagramme
- Sitzungstempoanalyse

#### 8. Live Monitoring (👁️)
- Echtzeit-Spielerstatus
- Verbindungsüberwachung
- Ressourcenverfolgung (Munition, Zauber, Edge)
- Aktuelle Aktionen-Feed

#### 9. Campaign Timeline (📅)
- Kampagnen-Zeitlinie mit wichtigen Ereignissen
- Plot-Thread-Verfolgung
- NPC-Beziehungsmanagement
- Sitzungsnotizen

#### 10. Random Generators (🎲)
- NPC-Generator mit Statistiken/Hintergründen
- Ort-Generator
- Corporate-Run-Generator
- Wetter-/Umgebungsgenerator

#### 11. Image Generation (🎨)
- KI-gestützte Bildgenerierung (DALL-E)
- Stil-Auswahl und Vorlagen
- Bildgalerie und -verwaltung
- Sofortgenerierung für Szenen

#### 12. Slack Integration (💬)
- Broadcast-Kontrollen für Team-Kommunikation
- Automatische Benachrichtigungen
- Charakterbogen-Synchronisation
- Kommando-Integration

## Charaktererstellungssystem

### CharacterCreation.tsx

Umfassendes Charaktererstellungsinterface mit SR6E-Regeln:

#### Schritte der Charaktererstellung:

1. **Grundlagen (BasicsStep.tsx)**
   - Name, Geschlecht, Pronomen
   - Metatyp-Auswahl
   - Hintergrund-Archetyp

2. **Attribute (AttributesStep.tsx)**
   - Attributsverteilung nach Prioritätsmethode
   - Metatyp-Modifikatoren
   - Attributskosten-Berechnung

3. **Fertigkeiten (SkillsStep.tsx)**
   - Fertigkeitsauswahl und -verteilung
   - Spezialisierungen
   - Wissensfertigkeiten

4. **Qualitäten (QualitiesStep.tsx)**
   - Positive und negative Qualitäten
   - Karma-Kosten-Berechnung
   - Regelkonformitätsprüfung

5. **Ressourcen (ResourcesStep.tsx)**
   - Ausrüstung und Cyberware
   - Nuyen-Budget-Verwaltung
   - Verfügbarkeitsprüfungen

6. **Magie/Technomancer (MagicStep.tsx)**
   - Zauber-/Programm-Auswahl
   - Geister-/Sprite-Bindung
   - Traditionen und Streams

7. **Zusammenfassung (SummaryStep.tsx)**
   - Charakterübersicht
   - Regelvalidierung
   - Export-Optionen

### Validierungssystem

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  ruleReference: string;
}
```

## UI-Komponenten

### Shadowrun-spezifische Komponenten

#### DiceRoller.tsx
- Shadowrun 6E Würfelmechanik
- Edge-Integration
- Initiative-Würfe
- Limit-Berechnungen

```typescript
interface DiceResult {
  total: number;
  hits: number;
  ones: number;
  limit?: number;
  edge_used: boolean;
  dice_results: number[];
}
```

#### ShadowrunConsole.tsx
- Terminal-ähnliches Interface
- Cyberpunk-Ästhetik
- Themen-System mit verschiedenen Matrix-Stilen

```typescript
interface Theme {
  name: string;
  background: string;
  text: string;
  secondaryText: string;
  accent: string;
  prompt: string;
  input: string;
  inputText: string;
  secondaryBackground: string;
}
```

#### HealthBar.tsx
- Zustandsmonitor-Visualisierung
- Physischer und Betäubungsschaden
- Modifikator-Anzeige

#### InitiativeTracker.tsx
- Initiative-Reihenfolge-Management
- Drag-&-Drop-Sortierung
- Automatische Rundenerkennung

## State Management

### React State mit Hooks

Das Frontend verwendet hauptsächlich React Hooks für State Management:

```typescript
// Haupt-Dashboard-State
const [activeTab, setActiveTab] = useState<string>('review');
const [sessionId] = useState<string>('default-session');

// Review Queue State
const [pendingResponses, setPendingResponses] = useState<PendingResponse[]>([]);
const [selectedResponse, setSelectedResponse] = useState<PendingResponse | null>(null);

// Combat State
const [combatActive, setCombatActive] = useState<boolean>(false);
const [combatants, setCombatants] = useState<Combatant[]>([]);
const [currentRound, setCurrentRound] = useState<number>(1);

// Character State
const [characters, setCharacters] = useState<Character[]>([]);
const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
```

### Custom Hooks

#### useWebSocket
```typescript
const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  useEffect(() => {
    const ws = new WebSocket(url);
    setSocket(ws);
    
    ws.onmessage = (event) => {
      setLastMessage(JSON.parse(event.data));
    };
    
    return () => ws.close();
  }, [url]);
  
  return { socket, lastMessage };
};
```

#### usePolling
```typescript
const usePolling = (fetchFn: () => Promise<any>, interval: number) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const poll = async () => {
      setIsLoading(true);
      try {
        const result = await fetchFn();
        setData(result);
      } catch (error) {
        console.error('Polling error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    poll(); // Initial fetch
    const intervalId = setInterval(poll, interval);
    
    return () => clearInterval(intervalId);
  }, [fetchFn, interval]);
  
  return { data, isLoading };
};
```

## API-Integration

### HTTP Client

```typescript
class ShadowrunAPI {
  private baseURL: string;
  
  constructor(baseURL: string = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }
  
  // Session Management
  async createSession(name: string, gmUserId: string) {
    return this.post('/session', { name, gm_user_id: gmUserId });
  }
  
  // Character Management
  async getCharacters(sessionId: string) {
    return this.get(`/session/${sessionId}/characters`);
  }
  
  // Combat Management
  async getCombatStatus(sessionId: string) {
    return this.get(`/session/${sessionId}/combat/status`);
  }
  
  // Review System
  async getPendingResponses(sessionId: string, userId: string) {
    return this.get(`/session/${sessionId}/pending-responses?user_id=${userId}`);
  }
}
```

### Server-Sent Events für Streaming

```typescript
const useLLMStream = (endpoint: string) => {
  const [response, setResponse] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  
  const startStream = async (data: any) => {
    setIsStreaming(true);
    setResponse('');
    
    const eventSource = new EventSource(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    eventSource.onmessage = (event) => {
      const chunk = JSON.parse(event.data);
      setResponse(prev => prev + chunk.content);
    };
    
    eventSource.onerror = () => {
      setIsStreaming(false);
      eventSource.close();
    };
    
    eventSource.addEventListener('end', () => {
      setIsStreaming(false);
      eventSource.close();
    });
  };
  
  return { response, isStreaming, startStream };
};
```

## Styling und Design

### Tailwind CSS-Konfiguration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'sr-dark': '#0a0a0a',
        'sr-neon-green': '#00ff41',
        'sr-neon-blue': '#00b4ff',
        'sr-neon-red': '#ff0040',
        'sr-matrix': '#00ff00',
        'sr-chrome': '#c0c0c0'
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'cyberpunk': ['Orbitron', 'sans-serif']
      },
      animation: {
        'matrix-scroll': 'matrix-scroll 20s linear infinite',
        'neon-glow': 'neon-glow 2s ease-in-out infinite alternate'
      }
    }
  },
  plugins: []
};
```

### CSS Custom Properties

```css
/* Shadowrun-spezifische CSS-Variablen */
:root {
  --sr-primary-bg: #0f1419;
  --sr-secondary-bg: #1a1f2e;
  --sr-accent-green: #00ff41;
  --sr-accent-red: #ff0040;
  --sr-accent-blue: #00b4ff;
  --sr-text-primary: #e6e6e6;
  --sr-text-secondary: #b3b3b3;
  --sr-border: #333;
  --sr-glow: 0 0 10px var(--sr-accent-green);
}

/* Matrix-Effekte */
@keyframes matrix-scroll {
  0% { transform: translateY(-100vh); }
  100% { transform: translateY(100vh); }
}

@keyframes neon-glow {
  from { text-shadow: 0 0 5px currentColor; }
  to { text-shadow: 0 0 20px currentColor; }
}

/* Cyberpunk-Stile */
.cyberpunk-border {
  border: 1px solid var(--sr-accent-green);
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.matrix-grid {
  background-image: 
    linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

## Entwicklungsworkflow

### Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Build für Produktion
npm run build

# Tests ausführen
npm test

# Linting
npm run lint

# Type-Checking
npm run type-check
```

### Code-Generierung

```bash
# Neue Komponente erstellen
npm run generate:component MyComponent

# Neue Seite erstellen
npm run generate:page my-page

# Custom Hook erstellen
npm run generate:hook useMyHook
```

### Testing

#### Unit Tests mit Jest

```typescript
// __tests__/DiceRoller.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import DiceRoller from '../components/DiceRoller';

describe('DiceRoller', () => {
  test('renders dice input', () => {
    render(<DiceRoller />);
    expect(screen.getByPlaceholderText(/enter dice command/i)).toBeInTheDocument();
  });
  
  test('rolls dice correctly', () => {
    render(<DiceRoller />);
    const input = screen.getByRole('textbox');
    const rollButton = screen.getByText('Roll');
    
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.click(rollButton);
    
    expect(screen.getByText(/total:/i)).toBeInTheDocument();
  });
});
```

#### E2E Tests mit Playwright

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('GM Dashboard functionality', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Test tab navigation
  await page.click('[data-testid="combat-tab"]');
  await expect(page.locator('[data-testid="combat-manager"]')).toBeVisible();
  
  // Test character creation
  await page.click('[data-testid="add-character"]');
  await page.fill('[data-testid="character-name"]', 'Test Runner');
  await page.click('[data-testid="save-character"]');
  
  await expect(page.locator('text=Test Runner')).toBeVisible();
});
```

## Deployment

### Vercel-Konfiguration

```json
// vercel.json
{
  "name": "shadowrun-interface",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.shadowrun.com",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk-key"
  }
}
```

### Netlify-Konfiguration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend.herokuapp.com/api/:splat"
  status = 200
```

### Docker-Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Performance-Optimierung

### Code Splitting

```typescript
// Lazy Loading für große Komponenten
import dynamic from 'next/dynamic';

const GMDashboard = dynamic(() => import('../components/GMDashboard'), {
  loading: () => <div>Loading Dashboard...</div>,
  ssr: false
});

const CharacterCreation = dynamic(() => import('../components/CharacterCreation'), {
  loading: () => <div>Loading Character Creator...</div>
});
```

### Memoization

```typescript
// React.memo für Performance-kritische Komponenten
export const CombatTracker = React.memo(({ combatants }: CombatTrackerProps) => {
  return (
    <div>
      {combatants.map(combatant => (
        <CombatantCard key={combatant.id} combatant={combatant} />
      ))}
    </div>
  );
});

// useMemo für aufwendige Berechnungen
const characterStats = useMemo(() => {
  return calculateDerivedStats(character.attributes, character.skills);
}, [character.attributes, character.skills]);
```

### Bundle-Analyse

```bash
# Bundle-Größe analysieren
npm run analyze

# Performance-Profiling
npm run lighthouse
```

## Internationalisierung

### i18n-Setup

```typescript
// i18n/config.ts
export const i18n = {
  defaultLocale: 'de',
  locales: ['de', 'en', 'fr', 'es'],
} as const;

// Übersetzungen
export const translations = {
  de: {
    dashboard: {
      title: 'GM Dashboard',
      combat: 'Kampf-Manager',
      characters: 'Charakteransicht',
      matrix: 'Matrix-Dashboard'
    }
  },
  en: {
    dashboard: {
      title: 'GM Dashboard',
      combat: 'Combat Manager',
      characters: 'Character Viewer',
      matrix: 'Matrix Dashboard'
    }
  }
};
```

## Fehlerbehebung

### Häufige Probleme

#### Build-Fehler
```bash
# ESLint-Probleme beheben
npm run lint:fix

# Type-Fehler prüfen
npm run type-check

# Cache leeren
rm -rf .next node_modules package-lock.json
npm install
```

#### Runtime-Fehler
```typescript
// Error Boundary für React-Komponenten
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Etwas ist schiefgelaufen.</h1>;
    }
    
    return this.props.children;
  }
}
```

### Debug-Tools

```typescript
// Development-Tools
if (process.env.NODE_ENV === 'development') {
  // React DevTools
  // Redux DevTools (falls verwendet)
  // Whyframe für Komponenten-Debugging
}

// Performance-Monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Best Practices

### Code-Organisation
1. **Komponentenstruktur:** Kleine, wiederverwendbare Komponenten
2. **Type Safety:** Vollständige TypeScript-Nutzung
3. **Performance:** Memoization und Lazy Loading
4. **Accessibility:** ARIA-Labels und Keyboard-Navigation
5. **Testing:** Umfassende Test-Coverage

### Shadowrun-spezifische Richtlinien
1. **SR6E-Regelkonformität:** Immer offizielle Regeln befolgen
2. **Immersion:** Cyberpunk-Ästhetik beibehalten
3. **GM-Workflows:** GM-zentrierte UX-Entscheidungen
4. **Echtzeit-Updates:** Responsive Multiplayer-Erfahrung
5. **Erweiterbarkeit:** Modular für neue Features

## Weiterführende Ressourcen

- **Next.js Dokumentation:** https://nextjs.org/docs
- **React Dokumentation:** https://react.dev/
- **TypeScript Handbuch:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Shadowrun 6E Regeln:** Offizielle Catalyst Game Labs Materialien 