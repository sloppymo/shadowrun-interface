import { useState, useRef, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  executeCommand, 
  CommandHistoryManager, 
  autoCompleteCommand, 
  getCommandSuggestions,
  Command
} from '../utils/commands';
import { sessionAPI, ShadowrunWebSocket } from '../utils/api';

// Define types
type ThemeName = 'shadowrunBarren' | 'matrix' | 'cyberpunk' | 'terminal';

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
  highlight: string;
}

interface HistoryItem {
  command: string;
  output: string;
  timestamp: Date;
  isProcessing?: boolean;
  isStreaming?: boolean;
  success?: boolean;
  broadcast?: boolean;
  userId?: string;
}

interface UserSettings {
  theme: ThemeName;
  fontSize: string;
  soundEnabled: boolean;
  autoScroll: boolean;
}

interface SessionInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  gameState: 'waiting' | 'active' | 'paused';
  isGM: boolean;
}

// Enhanced themes with more properties
const themes: Record<string, Theme> = {
  shadowrunBarren: {
    name: 'Shadowrun Barren',
    background: 'bg-gray-950',
    text: 'text-red-300',
    secondaryText: 'text-gray-400',
    accent: 'bg-red-900 text-red-100',
    prompt: 'text-green-500',
    input: 'bg-gray-900 border-red-900 border',
    inputText: 'text-red-200',
    secondaryBackground: 'bg-gray-900',
    highlight: 'bg-red-900 bg-opacity-30'
  },
  matrix: {
    name: 'Matrix',
    background: 'bg-black',
    text: 'text-green-400',
    secondaryText: 'text-green-600',
    accent: 'bg-green-700 text-green-200',
    prompt: 'text-green-500',
    input: 'bg-black border-green-700 border',
    inputText: 'text-green-400',
    secondaryBackground: 'bg-green-900 bg-opacity-20',
    highlight: 'bg-green-700 bg-opacity-30'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    background: 'bg-purple-900',
    text: 'text-pink-300',
    secondaryText: 'text-blue-300',
    accent: 'bg-pink-600 text-blue-200',
    prompt: 'text-yellow-300',
    input: 'bg-purple-800 border-pink-500 border',
    inputText: 'text-pink-300',
    secondaryBackground: 'bg-purple-800',
    highlight: 'bg-pink-600 bg-opacity-30'
  },
  terminal: {
    name: 'Terminal',
    background: 'bg-black',
    text: 'text-amber-400',
    secondaryText: 'text-amber-600',
    accent: 'bg-amber-800 text-amber-200',
    prompt: 'text-amber-500',
    input: 'bg-black border-amber-700 border',
    inputText: 'text-amber-400',
    secondaryBackground: 'bg-amber-900 bg-opacity-20',
    highlight: 'bg-amber-700 bg-opacity-30'
  }
};

// Define font sizes
const fontSizes = [
  { id: 'xs', name: 'Extra Small', class: 'text-xs' },
  { id: 'sm', name: 'Small', class: 'text-sm' },
  { id: 'base', name: 'Medium', class: 'text-base' },
  { id: 'lg', name: 'Large', class: 'text-lg' },
  { id: 'xl', name: 'Extra Large', class: 'text-xl' }
];

export default function EnhancedShadowrunConsole() {
  const { user, isSignedIn } = useUser();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [prompt, setPrompt] = useState('> ');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  
  // Auto-completion state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  
  // Command help state
  const [showCommandHelp, setShowCommandHelp] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<Command[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const historyManager = useRef(new CommandHistoryManager());
  const websocket = useRef<ShadowrunWebSocket | null>(null);
  
  // Settings state with expanded defaults
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'shadowrunBarren',
    fontSize: 'base',
    soundEnabled: false,
    autoScroll: true
  });

  // Load settings and command history on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('shadowrun-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsedSettings });
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }

    historyManager.current.loadFromStorage();

    // Set initial prompt based on user
    setPrompt(isSignedIn ? `${user?.firstName || 'User'}@SR > ` : '> ');
    
    // Show welcome message
    setHistory([
      { 
        command: '', 
        output: 'Shadowrun Interface Terminal v2.0\nEnhanced with real-time collaboration and advanced dice mechanics\nType "help" for available commands.\nInitializing Matrix connection...', 
        timestamp: new Date(),
        success: true
      }
    ]);
  }, [isSignedIn, user]);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('shadowrun-settings', JSON.stringify(settings));
  }, [settings]);

  // Auto-scroll when history updates
  useEffect(() => {
    if (settings.autoScroll && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [history, settings.autoScroll]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'command_result') {
      addToHistory(data.command, data.output, new Date(), false, false, data.success, true, data.userId);
    } else if (data.type === 'player_joined') {
      addToHistory('', `🎮 ${data.username} joined the session`, new Date(), false, false, true, false);
    } else if (data.type === 'player_left') {
      addToHistory('', `👋 ${data.username} left the session`, new Date(), false, false, true, false);
    }
  }, []);

  // WebSocket connection handler
  const handleWebSocketConnection = useCallback((connected: boolean) => {
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, []);

  // Add item to history
  const addToHistory = (
    command: string, 
    output: string, 
    timestamp: Date,
    isProcessing = false, 
    isStreaming = false, 
    success = true,
    broadcast = false,
    userId?: string
  ) => {
    setHistory(prev => [...prev, { 
      command, 
      output, 
      timestamp,
      isProcessing, 
      isStreaming, 
      success,
      broadcast,
      userId
    }]);
  };

  // Handle auto-completion
  const handleTabComplete = () => {
    if (input.trim()) {
      const completions = autoCompleteCommand(input.trim());
      if (completions.length === 1) {
        setInput(completions[0] + ' ');
        setShowSuggestions(false);
      } else if (completions.length > 1) {
        setSuggestions(completions);
        setShowSuggestions(true);
        setSelectedSuggestion(0);
      }
    }
  };

  // Handle command suggestions
  const updateCommandSuggestions = (input: string) => {
    if (input.length > 0) {
      const suggestions = getCommandSuggestions(input);
      setCommandSuggestions(suggestions);
      setShowCommandHelp(suggestions.length > 0);
    } else {
      setShowCommandHelp(false);
      setCommandSuggestions([]);
    }
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        const prevCommand = historyManager.current.getPrevious();
        if (prevCommand !== null) {
          setInput(prevCommand);
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        const nextCommand = historyManager.current.getNext();
        if (nextCommand !== null) {
          setInput(nextCommand);
        }
        break;
        
      case 'Tab':
        e.preventDefault();
        handleTabComplete();
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setShowCommandHelp(false);
        historyManager.current.reset();
        break;
        
      case 'ArrowLeft':
      case 'ArrowRight':
        setShowSuggestions(false);
        break;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const command = input.trim();
    setInput('');
    setShowSuggestions(false);
    setShowCommandHelp(false);
    
    // Add to command history
    historyManager.current.addCommand(command);
    
    // Add command to display history
    addToHistory(command, '', new Date(), true);
    
    // Process command
    await handleCommand(command);
  };

  // Enhanced command handler
  const handleCommand = async (cmd: string) => {
    setIsProcessing(true);
    
    try {
      // Check for special console commands first
      if (cmd.toLowerCase() === 'clear') {
        setHistory([]);
        setIsProcessing(false);
        return;
      }

      if (cmd.toLowerCase().startsWith('theme ')) {
        const themeName = cmd.substring(6).trim();
        if (themes[themeName]) {
          const newSettings = { ...settings, theme: themeName as ThemeName };
          setSettings(newSettings);
          addToHistory(cmd, `Theme changed to ${themes[themeName].name}`, new Date(), false, false, true);
        } else {
          addToHistory(cmd, `Theme not found. Available themes: ${Object.keys(themes).join(', ')}`, new Date(), false, false, false);
        }
        setIsProcessing(false);
        return;
      }

      if (cmd.toLowerCase() === 'settings') {
        setShowSettings(true);
        addToHistory(cmd, 'Opening settings panel...', new Date(), false, false, true);
        setIsProcessing(false);
        return;
      }

      // Execute command using the enhanced command system
      const result = await executeCommand(cmd, {
        userId: user?.firstName || 'User',
        sessionId: sessionInfo?.id,
        isGM: sessionInfo?.isGM || false,
        apiCall: async (endpoint: string, data: any) => {
          // API call wrapper for future backend integration
          console.log('API Call:', endpoint, data);
          return { success: true, data: null };
        }
      });

      // Handle special results
      if (result.output === 'CLEAR_CONSOLE') {
        setHistory([]);
      } else {
        addToHistory(cmd, result.output, new Date(), false, false, result.success, result.broadcast);
        
        // If this should be broadcast and we have a websocket connection
        if (result.broadcast && websocket.current?.isConnected()) {
          websocket.current.send({
            type: 'command',
            command: cmd,
            result: result.output,
            userId: user?.firstName || 'User'
          });
        }
      }
    } catch (error) {
      console.error('Error processing command:', error);
      addToHistory(cmd, `Error: ${error instanceof Error ? error.message : 'Unknown error processing command'}`, new Date(), false, false, false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    updateCommandSuggestions(value);
  };

  // Connect to session
  const connectToSession = async (sessionId: string) => {
    try {
      setConnectionStatus('connecting');
      const session = await sessionAPI.getSessionInfo(sessionId);
      setSessionInfo(session);
      
      // Initialize WebSocket connection
      websocket.current = new ShadowrunWebSocket();
      websocket.current.connect(sessionId, handleWebSocketMessage, handleWebSocketConnection);
      
      addToHistory('', `Connected to session: ${session.name}`, new Date(), false, false, true);
    } catch (error) {
      console.error('Failed to connect to session:', error);
      addToHistory('', `Failed to connect to session: ${error instanceof Error ? error.message : 'Unknown error'}`, new Date(), false, false, false);
      setConnectionStatus('disconnected');
    }
  };

  const currentTheme = themes[settings.theme];
  const currentFontSize = fontSizes.find(fs => fs.id === settings.fontSize)?.class || 'text-base';

  return (
    <div className={`min-h-screen flex flex-col ${currentTheme.background}`}>
      {/* Enhanced console header */}
      <header className="p-2 border-b border-red-900">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`${currentTheme.prompt} font-mono font-bold`}>SHADOWRUN MATRIX INTERFACE v2.0</h1>
            <div className="flex items-center gap-4 text-xs">
              <span className={currentTheme.secondaryText}>
                Status: <span className={
                  connectionStatus === 'connected' ? 'text-green-400' : 
                  connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
                }>
                  {connectionStatus.toUpperCase()}
                </span>
              </span>
              {sessionInfo && (
                <span className={currentTheme.secondaryText}>
                  Session: {sessionInfo.name} ({sessionInfo.playerCount} players)
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(true)}
              className={`px-3 py-1 rounded ${currentTheme.accent} hover:opacity-80 text-sm`}
            >
              Settings
            </button>
          </div>
        </div>
      </header>
      
      {/* Main console area */}
      <div 
        ref={consoleRef}
        className={`flex-1 p-4 overflow-y-auto font-mono ${currentFontSize} relative`}
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item, i) => (
          <div key={i} className="mb-4">
            {item.command && (
              <div className="flex items-center">
                <span className={`${currentTheme.prompt} mr-2 flex-shrink-0`}>{prompt}</span>
                <span className={currentTheme.text}>{item.command}</span>
                {item.broadcast && (
                  <span className="ml-2 text-blue-400 text-xs">📡</span>
                )}
              </div>
            )}
            <div className={`pl-4 whitespace-pre-wrap ${
              item.success === false ? 'text-red-400' : currentTheme.secondaryText
            }`}>
              {item.userId && item.broadcast && (
                <span className="text-blue-300">[{item.userId}] </span>
              )}
              {item.output}
              {item.isProcessing && (
                <span className="streaming-cursor ml-1"></span>
              )}
            </div>
            <div className="text-xs text-gray-600 pl-4 mt-1">
              {item.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      
      {/* Command suggestions */}
      {showCommandHelp && commandSuggestions.length > 0 && (
        <div className={`absolute bottom-16 left-4 right-4 ${currentTheme.secondaryBackground} border ${currentTheme.input} rounded-lg p-3 z-10`}>
          <div className="text-sm font-bold mb-2 text-yellow-400">Command Suggestions:</div>
          {commandSuggestions.map((cmd, i) => (
            <div key={i} className="text-xs mb-1">
              <span className={currentTheme.prompt}>{cmd.name}</span>
              <span className={currentTheme.secondaryText}> - {cmd.description}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Auto-completion suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute bottom-16 left-4 ${currentTheme.secondaryBackground} border ${currentTheme.input} rounded-lg p-2 z-10`}>
          {suggestions.map((suggestion, i) => (
            <div 
              key={i} 
              className={`px-2 py-1 cursor-pointer ${
                i === selectedSuggestion ? currentTheme.highlight : ''
              } ${currentTheme.text}`}
              onClick={() => {
                setInput(suggestion + ' ');
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      
      {/* Enhanced input form */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-red-900">
        <div className={`flex items-center ${currentTheme.input} p-2 rounded relative`}>
          <span className={`${currentTheme.prompt} mr-2 flex-shrink-0`}>{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent outline-none ${currentTheme.inputText}`}
            disabled={isProcessing}
            placeholder={isProcessing ? "Processing..." : "Type a command... (Tab for auto-complete, ↑↓ for history)"}
            autoComplete="off"
          />
          {isProcessing && (
            <div className="ml-2">
              <span className="streaming-cursor"></span>
            </div>
          )}
        </div>
      </form>
      
      {/* Enhanced settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className={`${currentTheme.secondaryBackground} p-6 rounded-lg max-w-md w-full mx-4`}>
            <h2 className={`${currentTheme.prompt} text-xl font-bold mb-4`}>Console Settings</h2>
            
            <div className="mb-4">
              <label className={`${currentTheme.text} block mb-2`}>Theme</label>
              <select 
                value={settings.theme}
                onChange={e => setSettings({...settings, theme: e.target.value as ThemeName})}
                className="w-full p-2 bg-gray-800 text-white rounded"
              >
                {Object.entries(themes).map(([key, theme]) => (
                  <option key={key} value={key}>{theme.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className={`${currentTheme.text} block mb-2`}>Font Size</label>
              <select 
                value={settings.fontSize}
                onChange={e => setSettings({...settings, fontSize: e.target.value})}
                className="w-full p-2 bg-gray-800 text-white rounded"
              >
                {fontSizes.map(size => (
                  <option key={size.id} value={size.id}>{size.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input 
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={e => setSettings({...settings, soundEnabled: e.target.checked})}
                  className="mr-2"
                />
                <span className={currentTheme.text}>Enable Sound Effects</span>
              </label>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input 
                  type="checkbox"
                  checked={settings.autoScroll}
                  onChange={e => setSettings({...settings, autoScroll: e.target.checked})}
                  className="mr-2"
                />
                <span className={currentTheme.text}>Auto-scroll Console</span>
              </label>
            </div>
            
            <div className="flex justify-between mt-6">
              <button 
                onClick={() => historyManager.current.clearHistory()}
                className="px-4 py-2 rounded bg-red-700 text-red-100 hover:bg-red-600"
              >
                Clear History
              </button>
              <button 
                onClick={() => setShowSettings(false)}
                className={`px-4 py-2 rounded ${currentTheme.accent}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}