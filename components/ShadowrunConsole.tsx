import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import DmDashboard from './DmDashboard';
import ImageGallery from './ImageGallery';
import axios from 'axios';
import type { Theme } from './types';

// Define types
type ThemeName = 'shadowrunBarren' | 'matrix' | 'cyberpunk' | 'terminal';

interface HistoryItem {
  command: string;
  output: string;
  isProcessing?: boolean;
  isStreaming?: boolean;
}

interface UserSettings {
  theme: ThemeName;
  fontSize: string;
}

interface Message {
  id: string;
  text: string;
  type: 'user' | 'system' | 'error' | 'roll_result';
  timestamp: Date;
  result?: {
    rolls: number[];
    total: number;
    glitch: boolean;
    critical_glitch: boolean;
  };
}

// Define themes
const themes: Record<ThemeName, Theme> = {
  shadowrunBarren: {
    name: 'Shadowrun Barren',
    background: 'bg-gray-950',
    text: 'text-red-300',
    secondaryText: 'text-gray-400',
    accent: 'bg-red-900 text-red-100',
    prompt: 'text-green-500',
    input: 'bg-gray-900 border-red-900 border',
    inputText: 'text-red-200',
    secondaryBackground: 'bg-gray-900'
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
    secondaryBackground: 'bg-green-900 bg-opacity-20'
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
    secondaryBackground: 'bg-purple-800'
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
    secondaryBackground: 'bg-amber-900 bg-opacity-20'
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

interface ShadowrunConsoleProps {
  theme: Theme;
}

export default function ShadowrunConsole({ theme }: ShadowrunConsoleProps) {
  const { user, isSignedIn } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [prompt, setPrompt] = useState('> ');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDmDashboard, setShowDmDashboard] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isGameMaster, setIsGameMaster] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const inputRef = useRef<HTMLInputElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings state with defaults
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'shadowrunBarren',
    fontSize: 'base'
  });

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const connectToEventSource = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource('http://localhost:5000/events');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnectionStatus('connected');
        setError(null);
        addSystemMessage('Connected to the Matrix');
      };

      eventSource.onerror = () => {
        setConnectionStatus('error');
        setError('Lost connection to the Matrix. Attempting to reconnect...');
        eventSource.close();
        setTimeout(connectToEventSource, 5000);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleServerMessage(data);
        } catch (err) {
          setError('Error processing response from server');
          console.error('Error parsing server message:', err);
        }
      };
    };

    connectToEventSource();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      type: 'system',
      timestamp: new Date()
    }]);
  };

  const handleServerMessage = (data: any) => {
    if (data.type === 'error') {
      setError(data.message);
      addSystemMessage(`Error: ${data.message}`);
    } else if (data.type === 'roll_result') {
      const { result } = data;
      const message: Message = {
        id: Date.now().toString(),
        text: `Rolled ${result.total} (${result.rolls.join(', ')})`,
        type: 'roll_result' as const,
        timestamp: new Date(),
        result
      };
      setMessages(prev => [...prev, message]);
      setIsRolling(false);

      // Announce result to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.textContent = `Rolled ${result.total}${result.glitch ? ' with a glitch!' : ''}${result.critical_glitch ? ' Critical glitch!' : ''}`;
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 5000);
    }
  };

  const sanitizeCommand = (command: string): string => {
    // Remove any potential command injection attempts
    return command.split(';')[0].trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const sanitizedInput = sanitizeCommand(input);
    if (sanitizedInput !== input) {
      addSystemMessage('Command sanitized for security');
    }

    const message: Message = {
      id: Date.now().toString(),
      text: sanitizedInput,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setInput('');

    if (sanitizedInput.toLowerCase().startsWith('roll')) {
      setIsRolling(true);
      try {
        const response = await fetch('http://localhost:5000/roll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            command: sanitizedInput,
            userId: user?.id
          })
        });

        if (!response.ok) {
          throw new Error('Failed to process roll');
        }

        const data = await response.json();
        handleServerMessage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process roll');
        setIsRolling(false);
      }
    }
  };

  const getMessageStyle = (message: Message) => {
    const baseStyle = {
      padding: '0.5rem',
      margin: '0.5rem 0',
      borderRadius: '0.25rem',
      backgroundColor: theme.secondaryBackground,
      color: theme.text
    };

    switch (message.type) {
      case 'user':
        return { ...baseStyle, backgroundColor: theme.accent };
      case 'system':
        return { ...baseStyle, color: theme.secondaryText };
      case 'error':
        return { ...baseStyle, backgroundColor: '#ff4444', color: 'white' };
      case 'roll_result':
        return {
          ...baseStyle,
          backgroundColor: message.result?.glitch ? '#ff4444' : theme.secondaryBackground,
          color: message.result?.glitch ? 'white' : theme.text
        };
      default:
        return baseStyle;
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('shadowrun-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }

    // Set initial prompt based on user
    setPrompt(isSignedIn ? `${user?.firstName || 'User'}@SR > ` : '> ');
    
    // Show welcome message
    setHistory([
      { 
        command: '', 
        output: 'Shadowrun Interface Terminal v1.0\nType "help" for available commands.\nConnecting to the Matrix...' 
      }
    ]);
  }, [isSignedIn, user]);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('shadowrun-settings', JSON.stringify(settings));
  }, [settings]);

  // Scroll to bottom when history updates
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when component mounts or when clicked
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Add item to history
  const addToHistory = (command: string, output: string, isProcessing = false, isStreaming = false) => {
    setHistory(prev => [...prev, { command, output, isProcessing, isStreaming }]);
  };

  // Handle session management commands
  const handleSessionCommand = async (cmd: string) => {
    const parts = cmd.split(' ');
    const action = parts[1];
    const argument = parts.slice(2).join(' ');

    if (action === 'create') {
      if (!argument) {
        addToHistory(cmd, 'Error: Session name is required. Usage: /session create [name]', false);
        return;
      }
      
      try {
        const response = await axios.post('http://localhost:5000/api/session', {
          name: argument,
          gm_user_id: user?.id
        });
        
        setCurrentSessionId(response.data.session_id);
        setIsGameMaster(true);
        addToHistory(cmd, `Session "${argument}" created successfully!\nSession ID: ${response.data.session_id}\nYou are the Game Master.`, false);
      } catch (error) {
        addToHistory(cmd, `Error creating session: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
      }
    } else if (action === 'join') {
      if (!argument) {
        addToHistory(cmd, 'Error: Session ID is required. Usage: /session join [id]', false);
        return;
      }
      
      try {
        await axios.post(`http://localhost:5000/api/session/${argument}/join`, {
          user_id: user?.id,
          role: 'player'
        });
        
        setCurrentSessionId(argument);
        setIsGameMaster(false);
        addToHistory(cmd, `Joined session ${argument} as a player.`, false);
      } catch (error) {
        addToHistory(cmd, `Error joining session: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
      }
    } else {
      addToHistory(cmd, 'Error: Invalid session command. Use /session create [name] or /session join [id]', false);
    }
  };

  // Handle AI command with DM review
  const handleAiCommand = async (cmd: string) => {
    const context = cmd.substring(4).trim();
    
    if (!context) {
      addToHistory(cmd, 'Error: Please provide a message for the AI. Usage: /ai [your message]', false);
      return;
    }
    
    if (!currentSessionId) {
      addToHistory(cmd, 'Error: You must be in a session to use AI features.', false);
      return;
    }
    
    try {
      const response = await axios.post(`http://localhost:5000/api/session/${currentSessionId}/llm-with-review`, {
        user_id: user?.id,
        context: context,
        response_type: 'narrative',
        priority: 1,
        require_review: !isGameMaster // GM responses don't need review
      });
      
      if (response.data.status === 'pending_review') {
        addToHistory(cmd, 
          `AI response generated and sent for DM review.\n` +
          `Request ID: ${response.data.pending_response_id}\n` +
          `You will be notified when the DM approves your response.`, 
          false
        );
      } else {
        // Direct response (GM bypass)
        addToHistory(cmd, response.data.choices?.[0]?.message?.content || 'AI response received.', false);
      }
    } catch (error) {
      addToHistory(cmd, `Error getting AI response: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
    }
  };

  const currentTheme = themes[settings.theme];
  const currentFontSize = fontSizes.find(fs => fs.id === settings.fontSize)?.class || 'text-base';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.background,
        color: theme.text,
        padding: '1rem',
        borderRadius: '0.5rem',
        fontFamily: 'monospace'
      }}
    >
      {/* Connection Status */}
      <div 
        role="status" 
        aria-live="polite"
        className={`mb-4 p-2 rounded ${
          connectionStatus === 'connected' ? 'bg-green-900 text-green-200' :
          connectionStatus === 'error' ? 'bg-red-900 text-red-200' :
          'bg-yellow-900 text-yellow-200'
        }`}
      >
        {connectionStatus === 'connected' ? 'Connected to the Matrix' :
         connectionStatus === 'error' ? 'Error connecting to the Matrix' :
         'Connecting to the Matrix...'}
      </div>

      {/* Console Output */}
      <div 
        ref={consoleRef}
        className={`${themes[settings.theme].secondaryBackground} rounded-lg p-4 mb-4 h-[calc(100vh-12rem)] overflow-y-auto font-mono ${themes[settings.theme].text}`}
        role="log"
        aria-label="Console output"
      >
        {messages.map(message => (
          <div
            key={message.id}
            style={getMessageStyle(message)}
            role={message.type === 'roll_result' ? 'status' : undefined}
            aria-live={message.type === 'roll_result' ? 'polite' : undefined}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {message.type === 'user' ? `${user?.firstName}: ` : ''}
                {message.text}
              </span>
              <span style={{ color: themes[settings.theme].secondaryText }}>
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            {message.type === 'roll_result' && message.result && (
              <div>
                {message.result.glitch && (
                  <div style={{ color: 'white', fontWeight: 'bold' }}>
                    {message.result.critical_glitch ? 'Critical Glitch!' : 'Glitch!'}
                  </div>
                )}
                <div style={{ fontSize: '0.8em', color: themes[settings.theme].secondaryText }}>
                  Rolls: {message.result.rolls.join(', ')}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleSubmit}
        className="flex gap-2"
        role="search"
        aria-label="Console input"
      >
        <div className="flex-1 relative">
          <span 
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${themes[settings.theme].prompt}`}
            aria-hidden="true"
          >
            {prompt}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`w-full pl-8 pr-4 py-2 rounded ${themes[settings.theme].input} ${themes[settings.theme].inputText}`}
            placeholder="Enter command..."
            disabled={isProcessing || connectionStatus === 'error'}
            aria-label="Command input"
            aria-disabled={isProcessing || connectionStatus === 'error'}
          />
        </div>
        <button
          type="submit"
          className={`px-4 py-2 rounded ${themes[settings.theme].accent}`}
          disabled={isProcessing || connectionStatus === 'error'}
          aria-label="Submit command"
          aria-disabled={isProcessing || connectionStatus === 'error'}
        >
          SEND
        </button>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className={`px-4 py-2 rounded ${themes[settings.theme].accent}`}
          aria-label="Open settings"
        >
          SETTINGS
        </button>
      </form>

      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          role="dialog"
          aria-label="Console settings"
          aria-modal="true"
        >
          <div className={`${themes[settings.theme].secondaryBackground} p-6 rounded-lg max-w-md w-full`}>
            <h2 className={`text-xl font-bold mb-4 ${themes[settings.theme].text}`}>Console Settings</h2>
            
            {/* Theme Selection */}
            <div className="mb-4">
              <label className={`block mb-2 ${themes[settings.theme].text}`}>
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as ThemeName }))}
                className={`w-full p-2 rounded ${themes[settings.theme].input} ${themes[settings.theme].inputText}`}
                aria-label="Select theme"
              >
                {Object.entries(themes).map(([id, theme]) => (
                  <option key={id} value={id}>{theme.name}</option>
                ))}
              </select>
            </div>

            {/* Font Size Selection */}
            <div className="mb-4">
              <label className={`block mb-2 ${themes[settings.theme].text}`}>
                Font Size
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                className={`w-full p-2 rounded ${themes[settings.theme].input} ${themes[settings.theme].inputText}`}
                aria-label="Select font size"
              >
                {fontSizes.map(size => (
                  <option key={size.id} value={size.id}>{size.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className={`px-4 py-2 rounded ${themes[settings.theme].accent}`}
                aria-label="Close settings"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DM Dashboard */}
      {showDmDashboard && currentSessionId && (
        <DmDashboard
          sessionId={currentSessionId}
          onClose={() => setShowDmDashboard(false)}
          theme={theme}
          isVisible={showDmDashboard}
        />
      )}

      {/* Image Gallery */}
      {showImageGallery && currentSessionId && (
        <ImageGallery
          sessionId={currentSessionId}
          onClose={() => setShowImageGallery(false)}
          theme={theme}
          isVisible={showImageGallery}
        />
      )}
    </div>
  );
}
