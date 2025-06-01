import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

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
}

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

// Define themes
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

export default function ShadowrunConsole() {
  const { user, isSignedIn } = useUser();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [prompt, setPrompt] = useState('> ');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  
  // Settings state with defaults
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'shadowrunBarren',
    fontSize: 'base'
  });

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const command = input.trim();
    setInput('');
    
    // Add command to history
    addToHistory(command, '', true);
    
    // Process command
    await handleCommand(command);
  };

  // Handle command logic
  const handleCommand = async (cmd: string) => {
    const command = cmd.toLowerCase();
    setIsProcessing(true);
    
    try {
      // Basic commands
      if (command === 'clear') {
        setHistory([]);
        setIsProcessing(false);
        return;
      }
      
      if (command === 'help') {
        addToHistory(
          cmd, 
          'Available commands:\n' +
          '- clear: Clear the console\n' +
          '- help: Show this help message\n' +
          '- theme [name]: Change console theme (shadowrunBarren, matrix, cyberpunk, terminal)\n' +
          '- settings: Open settings panel\n' +
          '- /scene [description]: Set a new scene\n' +
          '- /roll [dice]: Roll dice (e.g., /roll 3d6)\n' +
          '- /summon [character]: Summon an NPC\n' +
          '- /echo [message]: Display a message to all players',
          false
        );
      }
      
      else if (command.startsWith('theme ')) {
        const themeName = command.replace('theme ', '');
        if (themes[themeName]) {
          const newSettings = { ...settings, theme: themeName as ThemeName };
          setSettings(newSettings);
          addToHistory(cmd, `Theme changed to ${themes[themeName].name}`, false);
        } else {
          addToHistory(cmd, `Theme not found. Available themes: ${Object.keys(themes).join(', ')}`, false);
        }
      }
      
      else if (command === 'settings') {
        setShowSettings(true);
        addToHistory(cmd, 'Opening settings panel...', false);
      }
      
      // Shadowrun specific commands
      else if (command.startsWith('/scene ')) {
        const sceneDescription = cmd.substring(7);
        // In a real implementation, this would connect to your backend
        addToHistory(cmd, `Setting scene: ${sceneDescription}\nThe GM is describing the scene...`, false);
      }
      
      else if (command.startsWith('/roll ')) {
        const diceNotation = cmd.substring(6);
        // Simple dice roll simulation
        addToHistory(cmd, `Rolling ${diceNotation}...\nResult: 14 (simulated roll)`, false);
      }
      
      else {
        // Default response for unknown commands
        addToHistory(cmd, `Unknown command: ${cmd}\nType "help" for available commands.`, false);
      }
    } catch (error) {
      console.error('Error processing command:', error);
      addToHistory(cmd, `Error: ${error instanceof Error ? error.message : 'Unknown error processing command'}`, false);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentTheme = themes[settings.theme];
  const currentFontSize = fontSizes.find(fs => fs.id === settings.fontSize)?.class || 'text-base';

  return (
    <div className={`min-h-screen flex flex-col ${currentTheme.background}`}>
      {/* Console header */}
      <header className="p-2 border-b border-red-900">
        <div className="flex justify-between items-center">
          <h1 className={`${currentTheme.prompt} font-mono font-bold`}>SHADOWRUN MATRIX INTERFACE</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(true)}
              className={`px-3 py-1 rounded ${currentTheme.accent} hover:opacity-80`}
            >
              Settings
            </button>
          </div>
        </div>
      </header>
      
      {/* Main console area */}
      <div 
        ref={consoleRef}
        className={`flex-1 p-4 overflow-y-auto font-mono ${currentFontSize}`}
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item, i) => (
          <div key={i} className="mb-4">
            {item.command && (
              <div className="flex">
                <span className={`${currentTheme.prompt} mr-2`}>{prompt}</span>
                <span className={currentTheme.text}>{item.command}</span>
              </div>
            )}
            <div className={`pl-4 whitespace-pre-wrap ${currentTheme.secondaryText}`}>
              {item.output}
              {item.isProcessing && (
                <span className="streaming-cursor ml-1"></span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-red-900">
        <div className={`flex items-center ${currentTheme.input} p-2 rounded`}>
          <span className={`${currentTheme.prompt} mr-2`}>{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className={`flex-1 bg-transparent outline-none ${currentTheme.inputText}`}
            disabled={isProcessing}
            placeholder={isProcessing ? "Processing..." : "Type a command..."}
          />
        </div>
      </form>
      
      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className={`${currentTheme.secondaryBackground} p-6 rounded-lg max-w-md w-full`}>
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
            
            <div className="flex justify-end mt-6">
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
