import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * GMDashboard Component
 * 
 * Comprehensive Game Master dashboard for Shadowrun 6E campaigns.
 * Provides real-time campaign management tools including:
 * - AI response review and approval system
 * - Scene orchestration and environment management
 * - NPC and faction relationship tracking
 * - Combat initiative and damage tracking
 * - Character sheet monitoring and integration
 * - Matrix operations visualization
 * - Session analytics and performance metrics
 * - Live player monitoring and status tracking
 * - Campaign timeline and plot thread management
 * - Random content generators for on-the-fly creation
 * - GM automation tools and utilities
 * - Slack integration for team communication
 * 
 * @component
 * @author WREN AI System
 * @version 2.0.0
 * @since 1.0.0
 */

// TypeScript interfaces for type safety and documentation
// These define the data structures used throughout the dashboard
/**
 * PendingResponse Interface
 * 
 * Represents an AI-generated response awaiting GM review.
 * Part of the DM review system that ensures GM control over AI content.
 * 
 * @interface PendingResponse
 */
interface PendingResponse {
  /** Unique identifier for the pending response */
  id: string;
  /** Session this response belongs to */
  session_id: string;
  /** Player who triggered the AI response */
  user_id: string;
  /** Original player input that prompted the AI response */
  context: string;
  /** AI-generated response text awaiting review */
  ai_response: string;
  /** Type of response (narrative, combat, magic, dialogue, etc.) */
  response_type: string;
  /** Current review status */
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  /** Optional GM notes about the review decision */
  dm_notes?: string;
  /** Final response after GM editing (if status is 'edited') */
  final_response?: string;
  /** Timestamp when the response was created */
  created_at: string;
  /** Priority level (1=low, 2=medium, 3=high) for queue ordering */
  priority: number;
}

/**
 * NPC Interface
 * 
 * Represents a Non-Player Character in the campaign.
 * Used for faction tracking, relationship management, and narrative continuity.
 * 
 * @interface NPC
 */
interface NPC {
  /** Unique identifier for the NPC */
  id: string;
  /** NPC's name */
  name: string;
  /** Corporate or gang faction (optional) */
  faction?: string;
  /** NPC's primary motivation or goal (optional) */
  motivation?: string;
  /** Current emotional state/attitude */
  mood: string;
  /** Combat and skill statistics (optional) */
  stats?: any;
  /** List of faction allegiances */
  allegiances: string[];
  /** Relationship status with the player party */
  status: 'active' | 'neutral' | 'hostile' | 'allied';
}

/**
 * Scene Interface
 * 
 * Represents a narrative scene or location in the campaign.
 * Used for scene orchestration and environmental storytelling.
 * 
 * @interface Scene
 */
interface Scene {
  /** Unique identifier for the scene */
  id: string;
  /** Scene title/name */
  name: string;
  /** Detailed scene description */
  description: string;
  /** Physical location (district, building, etc.) */
  location: string;
  /** Narrative tone (tense, mysterious, combat, social, etc.) */
  tone: string;
  /** Time of day setting */
  timeOfDay: string;
  /** Scene tags for categorization and searching */
  tags: string[];
  /** Optional symbolic elements for deeper narrative meaning */
  symbolism?: string[];
}

/**
 * Combatant Interface
 * 
 * Represents a participant in Shadowrun 6E combat.
 * Tracks initiative, damage, and status according to SR6E rules.
 * 
 * @interface Combatant
 */
interface Combatant {
  /** Unique identifier for the combatant */
  id: string;
  /** Combatant's name */
  name: string;
  /** Initiative score for turn order */
  initiative: number;
  /** Legacy damage field (use physicalDamage/stunDamage instead) */
  damage: number;
  /** Maximum Edge points */
  edge: number;
  /** Current available Edge points */
  currentEdge: number;
  /** Combat status (active, unconscious, dead, etc.) */
  status: string;
  /** Type of combatant for different rule applications */
  type: 'player' | 'npc' | 'spirit' | 'drone';
  /** Number of actions available per turn */
  actions: number;
  /** Current Physical damage boxes filled */
  physicalDamage: number;
  /** Current Stun damage boxes filled */
  stunDamage: number;
  /** Total Physical condition monitor boxes */
  physicalMonitor: number;
  /** Total Stun condition monitor boxes */
  stunMonitor: number;
}

/**
 * SymbolicElement Interface
 * 
 * Represents symbolic narrative elements for deeper storytelling.
 * Used to track recurring themes, artifacts, and omens throughout the campaign.
 * 
 * @interface SymbolicElement
 */
interface SymbolicElement {
  /** Unique identifier for the symbolic element */
  id: string;
  /** Type of symbolic element */
  type: 'glyph' | 'artifact' | 'omen' | 'theme';
  /** Name or title of the element */
  name: string;
  /** Detailed description of the element's meaning */
  description: string;
  /** When this element was first introduced in the campaign */
  introduced_at: string;
  /** Optional notes about how this element paid off narratively */
  payoff_notes?: string;
}

/**
 * GMDashboardProps Interface
 * 
 * Props for the GMDashboard component.
 * 
 * @interface GMDashboardProps
 */
interface GMDashboardProps {
  /** The session ID this dashboard is managing */
  sessionId: string;
  /** Whether the dashboard modal is visible */
  isVisible: boolean;
  /** Callback function to close the dashboard */
  onClose: () => void;
}

/**
 * GMDashboard Component
 * 
 * Main component function that renders the complete GM dashboard interface.
 * Manages all state for the 12 dashboard tabs and provides comprehensive
 * campaign management functionality.
 * 
 * @param {GMDashboardProps} props - Component props
 * @returns {JSX.Element | null} The dashboard UI or null if not visible
 */
export default function GMDashboard({ sessionId, isVisible, onClose }: GMDashboardProps) {
  // Get current user information from Clerk authentication
  const { user } = useUser();
  
  // === CORE DASHBOARD STATE ===
  /** Currently active tab in the dashboard */
  const [activeTab, setActiveTab] = useState<string>('review');
  /** Loading state for async operations */
  const [isLoading, setIsLoading] = useState(false);
  
  // === REVIEW QUEUE STATE ===
  /** AI responses awaiting GM review */
  const [pendingResponses, setPendingResponses] = useState<PendingResponse[]>([]);
  /** Set of selected response IDs for bulk operations */
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  /** ID of response currently being edited */
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  /** Text content for editing responses */
  const [editText, setEditText] = useState('');
  
  // === SCENE MANAGEMENT STATE ===
  /** Current active scene in the campaign */
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  /** Form data for creating new scenes */
  const [newScene, setNewScene] = useState({
    name: '',
    description: '',
    location: '',
    tone: 'neutral',
    timeOfDay: 'day',
    tags: [] as string[]
  });
  
  // === NPC & FACTION STATE ===
  /** All NPCs in the current session */
  const [npcs, setNpcs] = useState<NPC[]>([]);
  /** Form data for creating new NPCs */
  const [newNPC, setNewNPC] = useState({
    name: '',
    faction: '',
    motivation: '',
    mood: 'neutral',
    allegiances: [] as string[]
  });
  
  // === NARRATIVE TRACKING STATE ===
  /** Symbolic elements for deeper storytelling */
  const [symbolicElements, setSymbolicElements] = useState<SymbolicElement[]>([]);
  /** Player action logs for session tracking */
  const [playerLogs, setPlayerLogs] = useState<any[]>([]);

  // === COMBAT MANAGEMENT STATE ===
  /** All combatants in the current combat encounter */
  const [combatants, setCombatants] = useState<Combatant[]>([]);

  /** Current active combat encounter */
  const [activeCombat, setActiveCombat] = useState<any>(null);
  /** Current combat round number */
  const [combatRound, setCombatRound] = useState(1);
  /** Index of the currently active combatant */
  const [activeInitiative, setActiveInitiative] = useState(0);
  /** Log of all combat actions and events */
  const [combatLog, setCombatLog] = useState<any[]>([]);

  // === CHARACTER MANAGEMENT STATE ===
  /** All player characters in the current session */
  const [playerCharacters, setPlayerCharacters] = useState<any[]>([]);
  /** Currently selected character for detailed viewing */
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);

  // === CHARACTER SHEET INTEGRATION STATE ===
  /** Character sheets discovered from external sources (Google Docs, Slack) */
  const [discoveredSheets, setDiscoveredSheets] = useState<any>({});
  /** Status of various character sheet integrations */
  const [integrationStatus, setIntegrationStatus] = useState<any>({});
  /** Whether the import modal is currently visible */
  const [showImportModal, setShowImportModal] = useState(false);
  /** Currently selected sheet for import */
  const [selectedImportSheet, setSelectedImportSheet] = useState<any>(null);

  // === MATRIX DASHBOARD STATE ===
  /** Current Matrix grid configuration */
  const [matrixGrid, setMatrixGrid] = useState<any>(null);
  /** All nodes in the Matrix grid */
  const [matrixNodes, setMatrixNodes] = useState<any[]>([]);
  /** Active ICE programs in the Matrix */
  const [icePrograms, setIcePrograms] = useState<any[]>([]);
  /** Current Overwatch Score accumulation */
  const [overwatchLevel, setOverwatchLevel] = useState(0);

  // === SESSION ANALYTICS STATE ===
  /** Overall session statistics and metrics */
  const [sessionStats, setSessionStats] = useState<any>({});
  /** Player engagement tracking data */
  const [playerEngagement, setPlayerEngagement] = useState<any[]>([]);
  /** Combat-specific metrics and analysis */
  const [combatMetrics, setCombatMetrics] = useState<any>({});

  // === CAMPAIGN TIMELINE STATE ===
  /** Major campaign events for timeline display */
  const [campaignEvents, setCampaignEvents] = useState<any[]>([]);
  /** Active plot threads and their status */
  const [plotThreads, setPlotThreads] = useState<any[]>([]);
  /** NPC relationship network data */
  const [npcRelationships, setNpcRelationships] = useState<any[]>([]);

  // === LIVE MONITORING STATE ===
  /** Real-time player status and activity */
  const [livePlayerStatus, setLivePlayerStatus] = useState<any[]>([]);
  /** Number of currently connected players */
  const [activeConnections, setActiveConnections] = useState<number>(0);

  // === IMAGE GENERATION STATE ===
  /** Text prompt for AI image generation */
  const [imagePrompt, setImagePrompt] = useState('');
  /** Selected art style for image generation */
  const [imageStyle, setImageStyle] = useState('noir');

  // === DASHBOARD CONFIGURATION ===
  /**
   * Dashboard tab configuration
   * Each tab has an ID, label, and color theme for visual organization
   */
  const tabs = [
    { id: 'review', label: '📋 Review Queue', color: 'red' },
    { id: 'scene', label: '🎭 Scene Control', color: 'purple' },
    { id: 'npcs', label: '👥 NPCs & Factions', color: 'blue' },
    { id: 'combat', label: '⚔️ Combat Manager', color: 'orange' },
    { id: 'players', label: '🎯 Character Viewer', color: 'green' },
    { id: 'matrix', label: '🔮 Matrix Dashboard', color: 'cyan' },
    { id: 'analytics', label: '📊 Session Analytics', color: 'indigo' },
    { id: 'monitoring', label: '👁️ Live Monitoring', color: 'yellow' },
    { id: 'timeline', label: '📅 Campaign Timeline', color: 'pink' },
    { id: 'generators', label: '🎲 Generators', color: 'emerald' },
    { id: 'tools', label: '🛠️ GM Tools', color: 'gray' },
    { id: 'slack', label: '📨 Slack Controls', color: 'violet' }
  ];

  // === DATA FETCHING FUNCTIONS ===
  /**
   * Fetch pending AI responses awaiting GM review
   * 
   * Retrieves all AI-generated responses that need GM approval before
   * being sent to players. Handles error cases gracefully.
   * 
   * @async
   * @function fetchPendingResponses
   * @returns {Promise<void>}
   */
  const fetchPendingResponses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/pending-responses`);
      const data = await response.json();
      setPendingResponses(data.items || []);
    } catch (error) {
      console.error('Failed to fetch pending responses:', error);
    }
  };

  /**
   * Fetch recent player action logs
   * 
   * Retrieves a chronological list of player actions for session monitoring.
   * Currently uses mock data; would connect to backend logging system.
   * 
   * @async
   * @function fetchPlayerLogs
   * @returns {Promise<void>}
   * @todo Connect to actual backend logging API
   */
  const fetchPlayerLogs = async () => {
    // This would fetch player action logs from the backend
    // For now, using mock data
    setPlayerLogs([
      { id: 1, player: 'Morgan', action: 'Edge spent on dice roll', timestamp: '2 minutes ago', type: 'edge' },
      { id: 2, player: 'Alex', action: 'Cast spell: Fireball', timestamp: '5 minutes ago', type: 'magic' },
      { id: 3, player: 'Jordan', action: 'Interaction with NPC: DocWagon Medic', timestamp: '8 minutes ago', type: 'npc' }
    ]);
  };

  /**
   * Fetch all player characters for the current session
   * 
   * Retrieves character data including attributes, skills, gear, and status.
   * Used by the Character Viewer tab for real-time monitoring.
   * 
   * @async
   * @function fetchPlayerCharacters
   * @returns {Promise<void>}
   */
  const fetchPlayerCharacters = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/characters`);
      const data = await response.json();
      setPlayerCharacters(data);
    } catch (error) {
      console.error('Failed to fetch player characters:', error);
    }
  };

  const fetchCombatStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/combat/status`);
      if (response.ok) {
        const data = await response.json();
        setActiveCombat(data.combat);
        setCombatants(data.combatants || []);
        setCombatRound(data.round || 1);
        setActiveInitiative(data.activeIndex || 0);
      }
    } catch (error) {
      console.error('Failed to fetch combat status:', error);
    }
  };

  const fetchMatrixData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/matrix/grid`);
      if (response.ok) {
        const data = await response.json();
        setMatrixGrid(data.grid);
        setMatrixNodes(data.nodes || []);
        setIcePrograms(data.ice || []);
        setOverwatchLevel(data.overwatch || 0);
      }
    } catch (error) {
      console.error('Failed to fetch matrix data:', error);
    }
  };

  const fetchSessionAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/analytics/summary`);
      if (response.ok) {
        const data = await response.json();
        setSessionStats(data.stats);
        setPlayerEngagement(data.engagement);
        setCombatMetrics(data.combat);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchCampaignTimeline = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/timeline/events`);
      if (response.ok) {
        const data = await response.json();
        setCampaignEvents(data.events);
        setPlotThreads(data.threads);
        setNpcRelationships(data.relationships);
      }
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    }
  };

  const fetchLiveMonitoring = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/monitoring/live`);
      if (response.ok) {
        const data = await response.json();
        setLivePlayerStatus(data.players);
        setActiveConnections(data.connections);
      }
    } catch (error) {
      console.error('Failed to fetch live monitoring:', error);
    }
  };

  const fetchDiscoveredSheets = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/character-sheets/discover?user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setDiscoveredSheets(data.discovered_sheets);
      }
    } catch (error) {
      console.error('Failed to fetch discovered sheets:', error);
    }
  };

  const fetchIntegrationStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/character-sheet/integration-status`);
      if (response.ok) {
        const data = await response.json();
        setIntegrationStatus(data.integrations);
      }
    } catch (error) {
      console.error('Failed to fetch integration status:', error);
    }
  };

  const importCharacterSheet = async (sourceType: string, sourceReference: any) => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/character-sheets/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          source_type: sourceType,
          source_reference: sourceReference
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Refresh character list
        fetchPlayerCharacters();
        // Close import modal
        setShowImportModal(false);
        setSelectedImportSheet(null);
        return data;
      }
    } catch (error) {
      console.error('Failed to import character sheet:', error);
    }
  };

  const syncAllCharacterSheets = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/character-sheets/sync-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Refresh character list
        fetchPlayerCharacters();
        return data;
      }
    } catch (error) {
      console.error('Failed to sync character sheets:', error);
    }
  };

  const createWrenManagedCopy = async (characterId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/character/${characterId}/create-wren-copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Failed to create WREN managed copy:', error);
    }
  };

  useEffect(() => {
    if (isVisible && sessionId) {
      fetchPendingResponses();
      fetchPlayerLogs();
      fetchPlayerCharacters();
      fetchCombatStatus();
      fetchMatrixData();
      fetchSessionAnalytics();
      fetchCampaignTimeline();
      fetchLiveMonitoring();
      fetchDiscoveredSheets();
      fetchIntegrationStatus();
    }
  }, [isVisible, sessionId]);

  // Polling for live updates
  useEffect(() => {
    if (!isVisible || !sessionId) return;
    
    const interval = setInterval(() => {
      if (activeTab === 'monitoring') {
        fetchLiveMonitoring();
      }
      if (activeTab === 'combat' && activeCombat) {
        fetchCombatStatus();
      }
      if (activeTab === 'matrix') {
        fetchMatrixData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, sessionId, activeTab, activeCombat]);

  // Review Queue Actions
  const handleReviewResponse = async (responseId: string, action: 'approve' | 'reject' | 'edit', finalText?: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/pending-response/${responseId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          dm_notes: 'Reviewed by GM',
          final_response: finalText
        })
      });
      
      if (response.ok) {
        fetchPendingResponses();
        setEditingResponse(null);
        setEditText('');
      }
    } catch (error) {
      console.error('Failed to review response:', error);
    }
  };

  // Scene Management
  const pushSceneToPlayers = async () => {
    try {
      await fetch(`http://localhost:5000/api/session/${sessionId}/scene`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScene)
      });
      
      setCurrentScene(newScene as Scene);
      setNewScene({
        name: '',
        description: '',
        location: '',
        tone: 'neutral',
        timeOfDay: 'day',
        tags: []
      });
    } catch (error) {
      console.error('Failed to push scene:', error);
    }
  };

  // NPC Management
  const addNPC = () => {
    const npc: NPC = {
      id: Date.now().toString(),
      ...newNPC,
      status: 'neutral'
    };
    setNpcs([...npcs, npc]);
    setNewNPC({
      name: '',
      faction: '',
      motivation: '',
      mood: 'neutral',
      allegiances: []
    });
  };

  // Image Generation
  const generateImage = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/session/${sessionId}/generate-image-instant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          style: imageStyle,
          user_id: user?.id
        })
      });
      
      if (response.ok) {
        // Handle successful image generation
        setImagePrompt('');
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-green-500 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-green-400">GM CONTROL</h2>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 text-xl"
          >
            ✕
          </button>
        </div>
        
        <nav className="space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                activeTab === tab.id
                  ? `bg-${tab.color}-700 text-${tab.color}-100`
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Session Info */}
        <div className="mt-8 p-3 bg-gray-800 rounded">
          <h3 className="text-green-400 font-semibold mb-2">Session Status</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <div>ID: {sessionId}</div>
            <div>Active Players: {combatants.filter(c => c.type === 'player').length}</div>
            <div>Pending Reviews: {pendingResponses.length}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'review' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-red-400 mb-6">📋 Review Queue Manager</h3>
            
            <div className="mb-4 flex gap-2">
              <button className="px-3 py-1 bg-green-700 text-green-100 rounded text-sm">
                All ({pendingResponses.length})
              </button>
              <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                Combat ({pendingResponses.filter(r => r.response_type === 'combat').length})
              </button>
              <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                Dialogue ({pendingResponses.filter(r => r.response_type === 'dialogue').length})
              </button>
              <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                Magic ({pendingResponses.filter(r => r.response_type === 'magic').length})
              </button>
            </div>

            <div className="space-y-4">
              {pendingResponses.map(response => (
                <div key={response.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        response.priority === 3 ? 'bg-red-700 text-red-100' :
                        response.priority === 2 ? 'bg-yellow-700 text-yellow-100' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        Priority {response.priority}
                      </span>
                      <span className="text-gray-400 text-sm">{response.response_type}</span>
                      <span className="text-gray-500 text-xs">{response.created_at}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedResponses.has(response.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedResponses);
                        if (e.target.checked) {
                          newSelected.add(response.id);
                        } else {
                          newSelected.delete(response.id);
                        }
                        setSelectedResponses(newSelected);
                      }}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm text-gray-400 mb-1">Player Context:</div>
                    <div className="text-gray-200 bg-gray-900 p-2 rounded">{response.context}</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">AI Response:</div>
                    {editingResponse === response.id ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full h-24 bg-gray-900 text-gray-200 p-2 rounded border border-gray-600"
                      />
                    ) : (
                      <div className="text-gray-200 bg-gray-900 p-2 rounded">{response.ai_response}</div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {editingResponse === response.id ? (
                      <>
                        <button
                          onClick={() => handleReviewResponse(response.id, 'edit', editText)}
                          className="px-3 py-1 bg-green-700 text-green-100 rounded text-sm"
                        >
                          Save & Approve
                        </button>
                        <button
                          onClick={() => {
                            setEditingResponse(null);
                            setEditText('');
                          }}
                          className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleReviewResponse(response.id, 'approve')}
                          className="px-3 py-1 bg-green-700 text-green-100 rounded text-sm"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => {
                            setEditingResponse(response.id);
                            setEditText(response.ai_response);
                          }}
                          className="px-3 py-1 bg-blue-700 text-blue-100 rounded text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleReviewResponse(response.id, 'reject')}
                          className="px-3 py-1 bg-red-700 text-red-100 rounded text-sm"
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {pendingResponses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pending responses to review
                </div>
              )}
            </div>

            {selectedResponses.size > 0 && (
              <div className="fixed bottom-4 right-4 bg-gray-800 border border-green-500 rounded-lg p-4">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-700 text-green-100 rounded">
                    Bulk Approve ({selectedResponses.size})
                  </button>
                  <button className="px-4 py-2 bg-red-700 text-red-100 rounded">
                    Bulk Reject ({selectedResponses.size})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scene' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-purple-400 mb-6">🎭 Scene Orchestration</h3>
            
            {currentScene && (
              <div className="mb-6 bg-gray-800 border border-purple-500 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-purple-300 mb-2">Current Scene</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">Name:</span> {currentScene.name}</div>
                  <div><span className="text-gray-400">Location:</span> {currentScene.location}</div>
                  <div><span className="text-gray-400">Tone:</span> {currentScene.tone}</div>
                  <div><span className="text-gray-400">Time:</span> {currentScene.timeOfDay}</div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-400">Description:</span>
                  <div className="text-gray-200 mt-1">{currentScene.description}</div>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-purple-300 mb-4">Create New Scene</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 mb-1">Scene Name</label>
                  <input
                    type="text"
                    value={newScene.name}
                    onChange={(e) => setNewScene({...newScene, name: e.target.value})}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                    placeholder="The Neon Market"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={newScene.location}
                    onChange={(e) => setNewScene({...newScene, location: e.target.value})}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                    placeholder="Downtown Seattle, Sector 7"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Tone</label>
                  <select
                    value={newScene.tone}
                    onChange={(e) => setNewScene({...newScene, tone: e.target.value})}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="tense">Tense</option>
                    <option value="mysterious">Mysterious</option>
                    <option value="combat">Combat Ready</option>
                    <option value="social">Social</option>
                    <option value="infiltration">Infiltration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Time of Day</label>
                  <select
                    value={newScene.timeOfDay}
                    onChange={(e) => setNewScene({...newScene, timeOfDay: e.target.value})}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                  >
                    <option value="dawn">Dawn</option>
                    <option value="day">Day</option>
                    <option value="dusk">Dusk</option>
                    <option value="night">Night</option>
                    <option value="midnight">Midnight</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Scene Description</label>
                <textarea
                  value={newScene.description}
                  onChange={(e) => setNewScene({...newScene, description: e.target.value})}
                  className="w-full h-24 p-2 bg-gray-700 text-white rounded border border-gray-600"
                  placeholder="The market buzzes with digital energy. Holographic vendors hawk their wares while corporate security drones patrol overhead..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={pushSceneToPlayers}
                  className="px-4 py-2 bg-purple-700 text-purple-100 rounded hover:bg-purple-600"
                >
                  🚀 Push Scene to Players
                </button>
                <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                  💾 Save as Template
                </button>
              </div>

              <div className="mt-6">
                <h5 className="text-md font-semibold text-purple-300 mb-2">Quick Scene Templates</h5>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Combat Setup', tone: 'combat', desc: 'Initiative and positioning matter here.' },
                    { name: 'Matrix Dive', tone: 'mysterious', desc: 'The digital realm awaits your intrusion.' },
                    { name: 'Social Encounter', tone: 'social', desc: 'Words and reputation carry weight.' },
                    { name: 'Investigation', tone: 'mysterious', desc: 'Clues and secrets hide in plain sight.' },
                    { name: 'Chase Scene', tone: 'tense', desc: 'Speed and quick thinking are essential.' },
                    { name: 'Infiltration', tone: 'infiltration', desc: 'Silence and subtlety are your allies.' }
                  ].map(template => (
                    <button
                      key={template.name}
                      onClick={() => setNewScene({
                        ...newScene,
                        name: template.name,
                        tone: template.tone,
                        description: template.desc
                      })}
                      className="p-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'npcs' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-blue-400 mb-6">👥 NPCs & Faction Tracker</h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* NPC List */}
              <div>
                <h4 className="text-lg font-semibold text-blue-300 mb-4">Active NPCs</h4>
                <div className="space-y-3">
                  {npcs.map(npc => (
                    <div key={npc.id} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-white">{npc.name}</h5>
                        <span className={`px-2 py-1 rounded text-xs ${
                          npc.status === 'allied' ? 'bg-green-700 text-green-100' :
                          npc.status === 'hostile' ? 'bg-red-700 text-red-100' :
                          npc.status === 'neutral' ? 'bg-gray-700 text-gray-300' : 'bg-blue-700 text-blue-100'
                        }`}>
                          {npc.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        {npc.faction && <div><span className="text-gray-400">Faction:</span> {npc.faction}</div>}
                        {npc.motivation && <div><span className="text-gray-400">Goal:</span> {npc.motivation}</div>}
                        <div><span className="text-gray-400">Mood:</span> {npc.mood}</div>
                      </div>
                      <div className="mt-2 flex gap-1">
                        <button className="px-2 py-1 bg-blue-700 text-blue-100 rounded text-xs">Edit</button>
                        <button className="px-2 py-1 bg-red-700 text-red-100 rounded text-xs">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add NPC Form */}
              <div>
                <h4 className="text-lg font-semibold text-blue-300 mb-4">Add New NPC</h4>
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <input
                    type="text"
                    value={newNPC.name}
                    onChange={(e) => setNewNPC({...newNPC, name: e.target.value})}
                    placeholder="NPC Name"
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    value={newNPC.faction}
                    onChange={(e) => setNewNPC({...newNPC, faction: e.target.value})}
                    placeholder="Faction (optional)"
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    value={newNPC.motivation}
                    onChange={(e) => setNewNPC({...newNPC, motivation: e.target.value})}
                    placeholder="Motivation/Goal"
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                  <select
                    value={newNPC.mood}
                    onChange={(e) => setNewNPC({...newNPC, mood: e.target.value})}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="friendly">Friendly</option>
                    <option value="suspicious">Suspicious</option>
                    <option value="hostile">Hostile</option>
                    <option value="fearful">Fearful</option>
                    <option value="confident">Confident</option>
                  </select>
                  <button
                    onClick={addNPC}
                    disabled={!newNPC.name}
                    className="w-full px-4 py-2 bg-blue-700 text-blue-100 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Add NPC
                  </button>
                </div>

                {/* Faction Relationship Map */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-blue-300 mb-4">Faction Relations</h4>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-300">
                      <div className="mb-2"><span className="text-green-400">●</span> Ares Macrotechnology - Allied</div>
                      <div className="mb-2"><span className="text-yellow-400">●</span> Horizon Group - Neutral</div>
                      <div className="mb-2"><span className="text-red-400">●</span> Aztechnology - Hostile</div>
                      <div className="mb-2"><span className="text-blue-400">●</span> DocWagon - Contracted</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'combat' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-orange-400 mb-6">⚔️ Combat Manager</h3>
            
            <div className="grid grid-cols-12 gap-6">
              {/* Combat Controls */}
              <div className="col-span-3 space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-300 mb-3">Combat Status</h4>
                  {activeCombat ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Encounter:</span>
                        <span className="text-orange-400">{activeCombat.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Round:</span>
                        <span className="text-orange-400">{combatRound}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400">{activeCombat.status}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No active combat</div>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <button className="w-full px-3 py-2 bg-orange-700 text-orange-100 rounded text-sm">
                      🎲 Roll Initiative
                    </button>
                    <button className="w-full px-3 py-2 bg-red-700 text-red-100 rounded text-sm">
                      ⚔️ Start Combat
                    </button>
                    <button className="w-full px-3 py-2 bg-yellow-700 text-yellow-100 rounded text-sm">
                      ⏸️ Pause Combat
                    </button>
                    <button className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded text-sm">
                      🛑 End Combat
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-300 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 bg-green-700 text-green-100 rounded text-sm">
                      ➕ Add Combatant
                    </button>
                    <button className="w-full px-3 py-2 bg-blue-700 text-blue-100 rounded text-sm">
                      🎯 Apply Damage
                    </button>
                    <button className="w-full px-3 py-2 bg-purple-700 text-purple-100 rounded text-sm">
                      ✨ Add Status Effect
                    </button>
                    <button className="w-full px-3 py-2 bg-indigo-700 text-indigo-100 rounded text-sm">
                      🔄 Next Turn
                    </button>
                  </div>
                </div>
              </div>

              {/* Initiative Tracker */}
              <div className="col-span-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-300 mb-3">Initiative Order</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {combatants.sort((a, b) => b.initiative - a.initiative).map((combatant, index) => (
                      <div key={combatant.id} className={`p-3 rounded border ${
                        index === activeInitiative ? 'border-orange-400 bg-orange-900/20' : 'border-gray-600'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              combatant.status === 'active' ? 'bg-green-400' :
                              combatant.status === 'unconscious' ? 'bg-yellow-400' :
                              combatant.status === 'dead' ? 'bg-red-400' : 'bg-gray-400'
                            }`} />
                            <div>
                              <div className="font-semibold text-white">{combatant.name}</div>
                              <div className="text-sm text-gray-400">
                                {combatant.type} • Initiative: {combatant.initiative}
                              </div>
                            </div>
                          </div>
                                                     <div className="text-right text-sm">
                             <div className="text-gray-400">Actions: {(combatant as any).actions || 1}</div>
                             <div className="text-gray-400">Edge: {(combatant as any).currentEdge || combatant.edge}</div>
                           </div>
                        </div>
                        
                        {/* Health Bars */}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-12">Physical:</span>
                            <div className="flex-1 bg-gray-700 rounded h-2">
                                                             <div 
                                 className="bg-red-500 h-2 rounded" 
                                 style={{ width: `${((combatant as any).physicalDamage / (combatant as any).physicalMonitor) * 100}%` }}
                               />
                             </div>
                             <span className="text-xs text-gray-400">
                               {(combatant as any).physicalDamage || 0}/{(combatant as any).physicalMonitor || 10}
                             </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-12">Stun:</span>
                            <div className="flex-1 bg-gray-700 rounded h-2">
                                                             <div 
                                 className="bg-yellow-500 h-2 rounded" 
                                 style={{ width: `${((combatant as any).stunDamage / (combatant as any).stunMonitor) * 100}%` }}
                               />
                             </div>
                             <span className="text-xs text-gray-400">
                               {(combatant as any).stunDamage || 0}/{(combatant as any).stunMonitor || 10}
                             </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Combat Log */}
              <div className="col-span-3">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-300 mb-3">Combat Log</h4>
                  <div className="space-y-1 max-h-96 overflow-y-auto text-sm font-mono">
                    {combatLog.map((entry, index) => (
                      <div key={index} className="text-gray-300">
                        <span className="text-gray-500">[{entry.timestamp}]</span> {entry.message}
                      </div>
                    ))}
                    {combatLog.length === 0 && (
                      <div className="text-gray-500">No combat actions recorded</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-green-400 mb-6">🎯 Character Viewer</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {playerCharacters.map(character => (
                <div key={character.id} className="bg-gray-800 border border-green-500 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-green-400">{character.name}</h4>
                      <div className="text-sm text-gray-400">{character.handle}</div>
                      <div className="text-sm text-gray-400">{character.archetype}</div>
                    </div>
                    <button 
                      onClick={() => setSelectedCharacter(character)}
                      className="px-2 py-1 bg-green-700 text-green-100 rounded text-sm"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Attributes */}
                  {character.attributes && (
                    <div className="mb-4">
                      <h5 className="text-green-300 font-semibold mb-2">Attributes</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(JSON.parse(character.attributes)).map(([attr, value]) => (
                          <div key={attr} className="flex justify-between">
                            <span className="text-gray-400 capitalize">{attr}:</span>
                            <span className="text-green-400">{value as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Condition Monitors */}
                  <div className="mb-4">
                    <h5 className="text-green-300 font-semibold mb-2">Condition</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-16">Physical:</span>
                        <div className="flex-1 bg-gray-700 rounded h-2">
                          <div className="bg-red-500 h-2 rounded" style={{ width: '20%' }} />
                        </div>
                        <span className="text-xs text-gray-400">2/10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-16">Stun:</span>
                        <div className="flex-1 bg-gray-700 rounded h-2">
                          <div className="bg-yellow-500 h-2 rounded" style={{ width: '0%' }} />
                        </div>
                        <span className="text-xs text-gray-400">0/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Edge */}
                  <div className="mb-4">
                    <h5 className="text-green-300 font-semibold mb-2">Edge</h5>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-full ${
                          i < 3 ? 'bg-yellow-400' : 'bg-gray-600'
                        }`} />
                      ))}
                      <span className="ml-2 text-sm text-gray-400">3/4</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-2 py-1 bg-red-700 text-red-100 rounded text-xs">
                      Damage
                    </button>
                    <button className="flex-1 px-2 py-1 bg-yellow-700 text-yellow-100 rounded text-xs">
                      Edge
                    </button>
                    <button className="flex-1 px-2 py-1 bg-blue-700 text-blue-100 rounded text-xs">
                      Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedCharacter && (
              <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-green-400">{selectedCharacter.name} - Full Sheet</h3>
                    <button 
                      onClick={() => setSelectedCharacter(null)}
                      className="text-red-400 hover:text-red-300 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-green-300 font-semibold mb-2">Skills</h4>
                      {selectedCharacter.skills && (
                        <div className="text-sm space-y-1">
                          {Object.entries(JSON.parse(selectedCharacter.skills)).map(([skill, value]) => (
                            <div key={skill} className="flex justify-between">
                              <span className="text-gray-400 capitalize">{skill}:</span>
                              <span className="text-green-400">{value as number}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-green-300 font-semibold mb-2">Qualities</h4>
                      {selectedCharacter.qualities && (
                        <div className="text-sm">
                          {Object.entries(JSON.parse(selectedCharacter.qualities)).map(([type, qualities]) => (
                            <div key={type} className="mb-2">
                              <div className="text-gray-400 capitalize font-medium">{type}:</div>
                              <ul className="list-disc list-inside ml-2">
                                {(qualities as string[]).map((quality, i) => (
                                  <li key={i} className="text-gray-300">{quality}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6">🔮 Matrix Dashboard</h3>
            
            <div className="grid grid-cols-12 gap-6">
              {/* Matrix Stats */}
              <div className="col-span-3 space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-300 mb-3">Grid Status</h4>
                  {matrixGrid ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Grid:</span>
                        <span className="text-cyan-400">{matrixGrid.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Security:</span>
                        <span className="text-cyan-400">{matrixGrid.security_rating}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Noise:</span>
                        <span className="text-cyan-400">{matrixGrid.noise_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Overwatch:</span>
                        <span className={overwatchLevel > 30 ? 'text-red-400' : 'text-yellow-400'}>
                          {overwatchLevel}/40
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No active matrix grid</div>
                  )}
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-300 mb-3">ICE Programs</h4>
                  <div className="space-y-2">
                    {icePrograms.map(ice => (
                      <div key={ice.id} className="p-2 bg-gray-700 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-400 text-sm">{ice.name}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            ice.status === 'active' ? 'bg-red-700 text-red-100' :
                            ice.status === 'alerted' ? 'bg-yellow-700 text-yellow-100' :
                            'bg-gray-600 text-gray-300'
                          }`}>
                            {ice.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Rating: {ice.rating} • Type: {ice.ice_type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-300 mb-3">Matrix Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 bg-cyan-700 text-cyan-100 rounded text-sm">
                      🔍 Matrix Perception
                    </button>
                    <button className="w-full px-3 py-2 bg-red-700 text-red-100 rounded text-sm">
                      ⚡ Trigger Alert
                    </button>
                    <button className="w-full px-3 py-2 bg-yellow-700 text-yellow-100 rounded text-sm">
                      🛡️ Spawn ICE
                    </button>
                    <button className="w-full px-3 py-2 bg-green-700 text-green-100 rounded text-sm">
                      📊 Reset Overwatch
                    </button>
                  </div>
                </div>
              </div>

              {/* Matrix Grid Visualization */}
              <div className="col-span-9">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-300 mb-3">Matrix Grid</h4>
                  <div className="matrix-grid bg-black rounded h-96 relative overflow-hidden border border-cyan-500">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ffff" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>

                    {/* Matrix Nodes */}
                    {matrixNodes.map(node => (
                      <div
                        key={node.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{
                          left: `${50 + node.position_x * 40}%`,
                          top: `${50 + node.position_y * 40}%`
                        }}
                      >
                        <div className={`w-12 h-12 rounded border-2 flex items-center justify-center ${
                          node.compromised ? 'border-yellow-400 bg-yellow-900/50' : 
                          node.discovered ? 'border-cyan-400 bg-cyan-900/50' : 'border-gray-600 bg-gray-900/50'
                        }`}>
                          <span className="text-lg">
                            {node.node_type === 'host' ? '🏢' :
                             node.node_type === 'file' ? '📁' :
                             node.node_type === 'device' ? '🖥️' :
                             node.node_type === 'ice' ? '🛡️' :
                             node.node_type === 'data' ? '💾' : '❓'}
                          </span>
                        </div>
                        <div className="text-xs text-center mt-1 text-cyan-400 max-w-16 truncate">
                          {node.name}
                        </div>
                        {node.encrypted && (
                          <div className="absolute -top-1 -right-1 text-xs">🔒</div>
                        )}
                      </div>
                    ))}

                    {/* Floating data streams */}
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute text-cyan-400 text-xs animate-pulse"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                          }}
                        >
                          {Math.random() > 0.5 ? '01' : '10'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-indigo-400 mb-6">📊 Session Analytics</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Session Overview */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-indigo-300 mb-3">Session Overview</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-indigo-400">2h 34m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Actions Taken:</span>
                    <span className="text-indigo-400">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Combats:</span>
                    <span className="text-indigo-400">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Matrix Runs:</span>
                    <span className="text-indigo-400">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">NPCs Encountered:</span>
                    <span className="text-indigo-400">12</span>
                  </div>
                </div>
              </div>

              {/* Player Engagement */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-indigo-300 mb-3">Player Engagement</h4>
                <div className="space-y-3">
                  {playerEngagement.map(player => (
                    <div key={player.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{player.name}</span>
                        <span className="text-indigo-400">{player.engagement}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded" 
                          style={{ width: `${player.engagement}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combat Metrics */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-indigo-300 mb-3">Combat Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Combat Length:</span>
                    <span className="text-indigo-400">8 rounds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hit Rate:</span>
                    <span className="text-indigo-400">67%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Edge Usage:</span>
                    <span className="text-indigo-400">23 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Damage:</span>
                    <span className="text-indigo-400">156 boxes</span>
                  </div>
                </div>
              </div>

              {/* Action Distribution */}
              <div className="bg-gray-800 rounded-lg p-4 col-span-full">
                <h4 className="text-lg font-semibold text-indigo-300 mb-3">Action Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl text-red-400 mb-1">⚔️</div>
                    <div className="text-sm text-gray-400">Combat</div>
                    <div className="text-lg text-indigo-400">42</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-blue-400 mb-1">🗣️</div>
                    <div className="text-sm text-gray-400">Social</div>
                    <div className="text-lg text-indigo-400">31</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-purple-400 mb-1">✨</div>
                    <div className="text-sm text-gray-400">Magic</div>
                    <div className="text-lg text-indigo-400">18</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-cyan-400 mb-1">🔮</div>
                    <div className="text-sm text-gray-400">Matrix</div>
                    <div className="text-lg text-indigo-400">36</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6">👁️ Live Monitoring</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Connection Status */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-yellow-300 mb-3">Connection Status</h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-gray-300">{activeConnections} players connected</span>
                </div>
                
                <div className="space-y-3">
                  {livePlayerStatus.map(player => (
                    <div key={player.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          player.status === 'online' ? 'bg-green-400' :
                          player.status === 'idle' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <span className="text-gray-300">{player.name}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Last seen: {player.lastSeen}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Actions */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-yellow-300 mb-3">Current Actions</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="text-sm text-gray-300 p-2 bg-gray-700 rounded">
                    <span className="text-yellow-400">[14:32]</span> Morgan is rolling dice...
                  </div>
                  <div className="text-sm text-gray-300 p-2 bg-gray-700 rounded">
                    <span className="text-yellow-400">[14:31]</span> Alex opened character sheet
                  </div>
                  <div className="text-sm text-gray-300 p-2 bg-gray-700 rounded">
                    <span className="text-yellow-400">[14:30]</span> Jordan typing in chat...
                  </div>
                </div>
              </div>

              {/* Resource Tracking */}
              <div className="bg-gray-800 rounded-lg p-4 col-span-full">
                <h4 className="text-lg font-semibold text-yellow-300 mb-3">Resource Tracking</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="text-yellow-400 font-medium mb-2">Edge Usage</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Morgan:</span>
                        <span className="text-yellow-400">3/4 remaining</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Alex:</span>
                        <span className="text-yellow-400">2/3 remaining</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Jordan:</span>
                        <span className="text-yellow-400">4/4 remaining</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-yellow-400 font-medium mb-2">Health Status</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Morgan:</span>
                        <span className="text-green-400">Healthy</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Alex:</span>
                        <span className="text-yellow-400">Light wounds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Jordan:</span>
                        <span className="text-green-400">Healthy</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-yellow-400 font-medium mb-2">Active Effects</h5>
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-300">Morgan: Targeting +2 (3 rounds)</div>
                      <div className="text-gray-300">Alex: Spell Lock</div>
                      <div className="text-gray-300">Jordan: None</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-pink-400 mb-6">📅 Campaign Timeline</h3>
            
            <div className="grid grid-cols-12 gap-6">
              {/* Timeline Controls */}
              <div className="col-span-3 space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-pink-300 mb-3">Timeline Controls</h4>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 bg-pink-700 text-pink-100 rounded text-sm">
                      ➕ Add Event
                    </button>
                    <button className="w-full px-3 py-2 bg-purple-700 text-purple-100 rounded text-sm">
                      🧵 New Plot Thread
                    </button>
                    <button className="w-full px-3 py-2 bg-blue-700 text-blue-100 rounded text-sm">
                      👥 Update NPC Relations
                    </button>
                    <button className="w-full px-3 py-2 bg-green-700 text-green-100 rounded text-sm">
                      📝 Session Summary
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-pink-300 mb-3">Plot Threads</h4>
                  <div className="space-y-2">
                    {plotThreads.map(thread => (
                      <div key={thread.id} className="p-2 bg-gray-700 rounded">
                        <div className="text-sm text-pink-400 font-medium">{thread.name}</div>
                        <div className="text-xs text-gray-400">{thread.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline View */}
              <div className="col-span-9">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-pink-300 mb-3">Campaign Events</h4>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-pink-400" />
                    <div className="space-y-4">
                      {campaignEvents.map((event, index) => (
                        <div key={event.id} className="relative pl-10">
                          <div className="absolute left-2 w-4 h-4 bg-pink-400 rounded-full transform -translate-x-1/2" />
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-pink-400 font-medium">{event.title}</h5>
                              <span className="text-xs text-gray-400">{event.date}</span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                            <div className="flex gap-2">
                              {event.tags?.map((tag: string) => (
                                <span key={tag} className="px-2 py-1 bg-pink-900 text-pink-300 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generators' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-emerald-400 mb-6">🎲 Random Generators</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* NPC Generator */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-emerald-300 mb-3">NPC Generator</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Type</label>
                    <select className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600">
                      <option>Street Contact</option>
                      <option>Corporate Executive</option>
                      <option>Gang Member</option>
                      <option>Security Guard</option>
                      <option>Decker</option>
                      <option>Mage</option>
                    </select>
                  </div>
                  
                  <button className="w-full px-4 py-2 bg-emerald-700 text-emerald-100 rounded hover:bg-emerald-600">
                    🎲 Generate NPC
                  </button>
                  
                  <div className="mt-4 p-3 bg-gray-700 rounded">
                    <h5 className="text-emerald-400 font-medium mb-2">Generated NPC:</h5>
                    <div className="text-sm space-y-1">
                      <div><span className="text-gray-400">Name:</span> Marcus "Wire" Chen</div>
                      <div><span className="text-gray-400">Role:</span> Street Decker</div>
                      <div><span className="text-gray-400">Motivation:</span> Seeking revenge against Renraku</div>
                      <div><span className="text-gray-400">Hook:</span> Has valuable corp data to trade</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Generator */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-emerald-300 mb-3">Location Generator</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 mb-1">District</label>
                    <select className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600">
                      <option>Downtown</option>
                      <option>Barrens</option>
                      <option>Corporate Zone</option>
                      <option>Docks</option>
                      <option>Underground</option>
                    </select>
                  </div>
                  
                  <button className="w-full px-4 py-2 bg-emerald-700 text-emerald-100 rounded hover:bg-emerald-600">
                    🏢 Generate Location
                  </button>
                  
                  <div className="mt-4 p-3 bg-gray-700 rounded">
                    <h5 className="text-emerald-400 font-medium mb-2">Generated Location:</h5>
                    <div className="text-sm space-y-1">
                      <div><span className="text-gray-400">Name:</span> The Neon Graveyard</div>
                      <div><span className="text-gray-400">Type:</span> Abandoned Nightclub</div>
                      <div><span className="text-gray-400">Security:</span> Low (Street gangs)</div>
                      <div><span className="text-gray-400">Features:</span> Hidden basement, AR graffiti</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Run Generator */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-emerald-300 mb-3">Run Generator</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Run Type</label>
                    <select className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600">
                      <option>Data Steal</option>
                      <option>Extraction</option>
                      <option>Sabotage</option>
                      <option>Protection</option>
                      <option>Investigation</option>
                    </select>
                  </div>
                  
                  <button className="w-full px-4 py-2 bg-emerald-700 text-emerald-100 rounded hover:bg-emerald-600">
                    💼 Generate Run
                  </button>
                  
                  <div className="mt-4 p-3 bg-gray-700 rounded">
                    <h5 className="text-emerald-400 font-medium mb-2">Generated Run:</h5>
                    <div className="text-sm space-y-1">
                      <div><span className="text-gray-400">Objective:</span> Steal prototype cyberware</div>
                      <div><span className="text-gray-400">Target:</span> Ares Macrotechnology R&D</div>
                      <div><span className="text-gray-400">Complication:</span> Double agent in the team</div>
                      <div><span className="text-gray-400">Payment:</span> 50,000¥</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather/Environment */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-emerald-300 mb-3">Environment Generator</h4>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-emerald-700 text-emerald-100 rounded hover:bg-emerald-600">
                    🌧️ Generate Weather
                  </button>
                  
                  <div className="mt-4 p-3 bg-gray-700 rounded">
                    <h5 className="text-emerald-400 font-medium mb-2">Current Conditions:</h5>
                    <div className="text-sm space-y-1">
                      <div><span className="text-gray-400">Weather:</span> Acid rain, heavy</div>
                      <div><span className="text-gray-400">Visibility:</span> -3 modifier</div>
                      <div><span className="text-gray-400">Temperature:</span> 15°C</div>
                      <div><span className="text-gray-400">Special:</span> Matrix interference +1 noise</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6">🛠️ GM Tools & Automation</h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div>
                <h4 className="text-lg font-semibold text-yellow-300 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-yellow-700 text-yellow-100 rounded hover:bg-yellow-600 text-left">
                    🎲 Roll Random Encounter
                  </button>
                  <button className="w-full p-3 bg-purple-700 text-purple-100 rounded hover:bg-purple-600 text-left">
                    🔍 Reveal Prepared Secret
                  </button>
                  <button className="w-full p-3 bg-red-700 text-red-100 rounded hover:bg-red-600 text-left">
                    ⚡ Trigger Matrix Glitch
                  </button>
                  <button className="w-full p-3 bg-blue-700 text-blue-100 rounded hover:bg-blue-600 text-left">
                    📡 Enable/Disable AI Assistant
                  </button>
                </div>

                <div className="mt-6">
                  <h5 className="text-md font-semibold text-yellow-300 mb-2">Session State</h5>
                  <div className="space-y-2">
                    <button className="w-full p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm">
                      💾 Save Current State
                    </button>
                    <button className="w-full p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm">
                      📄 Export to Markdown
                    </button>
                    <button className="w-full p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm">
                      📊 Generate Session Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Generation Tools */}
              <div>
                <h4 className="text-lg font-semibold text-yellow-300 mb-4">Image Generation</h4>
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the scene you want to generate..."
                    className="w-full h-20 p-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                  
                  <div>
                    <label className="block text-gray-400 mb-1">Visual Style</label>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                    >
                      <option value="noir">Cyberpunk Noir</option>
                      <option value="matrix">Matrix/Digital</option>
                      <option value="magical">Magical Realism</option>
                      <option value="corporate">Corporate Sleek</option>
                      <option value="street">Street Level Gritty</option>
                      <option value="nature">Urban Nature</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={generateImage}
                    disabled={!imagePrompt || isLoading}
                    className="w-full px-4 py-2 bg-yellow-700 text-yellow-100 rounded hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {isLoading ? '🔄 Generating...' : '🎨 Generate Scene Image'}
                  </button>
                </div>

                <div className="mt-4">
                  <h5 className="text-md font-semibold text-yellow-300 mb-2">Quick Prompts</h5>
                  <div className="space-y-1">
                    {[
                      'Neon-lit street market at night',
                      'Corporate boardroom with AR displays',
                      'Underground hacker den',
                      'High-tech laboratory',
                      'Shadowy alleyway meeting'
                    ].map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => setImagePrompt(prompt)}
                        className="w-full p-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'slack' && (
          <div className="p-6">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6">📨 Slack Broadcast Controls</h3>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-cyan-300 mb-4">Manual Broadcast</h4>
                <div className="space-y-3">
                  <textarea
                    placeholder="Type message to broadcast to Slack..."
                    className="w-full h-24 p-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                  <div className="flex gap-2">
                    <select className="p-2 bg-gray-700 text-white rounded border border-gray-600">
                      <option value="#general">#general</option>
                      <option value="#shadowrun-game">#shadowrun-game</option>
                      <option value="#gm-channel">#gm-channel</option>
                    </select>
                    <button className="px-4 py-2 bg-cyan-700 text-cyan-100 rounded hover:bg-cyan-600">
                      📤 Send to Slack
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-cyan-300 mb-4">Auto-Broadcast Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Auto-post approved responses to Slack</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Broadcast scene changes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Post combat results</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Share generated images</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-cyan-300 mb-4">Recent Slack Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Scene pushed: "The Neon Market"</span>
                    <span className="text-gray-500">2 minutes ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Combat result broadcasted</span>
                    <span className="text-gray-500">5 minutes ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">AI response approved and posted</span>
                    <span className="text-gray-500">8 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional tabs would be implemented similarly */}
      </div>
    </div>
  );
} 