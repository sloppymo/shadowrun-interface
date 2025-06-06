import { parseDiceCommand, formatDiceResult, testDifficulties } from './dice';

// Command structure
export interface Command {
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  category: 'basic' | 'game' | 'dice' | 'character' | 'gm' | 'matrix';
  requiresGM?: boolean;
  parameters?: CommandParameter[];
}

export interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description: string;
  options?: string[];
}

export interface CommandResult {
  success: boolean;
  output: string;
  broadcast?: boolean;
  data?: any;
}

export interface CommandHistory {
  command: string;
  timestamp: Date;
  result: CommandResult;
}

// Command registry
export const commands: Record<string, Command> = {
  help: {
    name: 'help',
    aliases: ['h', '?'],
    description: 'Show available commands or detailed help for a specific command',
    usage: 'help [command]',
    category: 'basic',
    parameters: [
      { name: 'command', type: 'string', required: false, description: 'Specific command to get help for' }
    ]
  },
  clear: {
    name: 'clear',
    aliases: ['cls', 'clr'],
    description: 'Clear the console output',
    usage: 'clear',
    category: 'basic'
  },
  roll: {
    name: 'roll',
    aliases: ['r'],
    description: 'Roll dice using Shadowrun or standard notation',
    usage: 'roll <dice> [limit] [edge] | roll <standard_dice>',
    category: 'dice',
    parameters: [
      { name: 'dice', type: 'string', required: true, description: 'Dice to roll (e.g., "12", "3d6", "init 8")' }
    ]
  },
  scene: {
    name: 'scene',
    aliases: ['s'],
    description: 'Set or describe the current scene',
    usage: 'scene <description>',
    category: 'gm',
    requiresGM: true,
    parameters: [
      { name: 'description', type: 'string', required: true, description: 'Scene description' }
    ]
  },
  echo: {
    name: 'echo',
    aliases: ['say', 'broadcast'],
    description: 'Send a message to all players in the session',
    usage: 'echo <message>',
    category: 'game',
    parameters: [
      { name: 'message', type: 'string', required: true, description: 'Message to broadcast' }
    ]
  },
  summon: {
    name: 'summon',
    aliases: ['spawn', 'npc'],
    description: 'Summon an NPC to the scene',
    usage: 'summon <name> [archetype]',
    category: 'gm',
    requiresGM: true,
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'NPC name' },
      { name: 'archetype', type: 'string', required: false, description: 'NPC archetype' }
    ]
  },
  initiative: {
    name: 'initiative',
    aliases: ['init'],
    description: 'Roll initiative or manage initiative order',
    usage: 'initiative [bonus] | initiative start | initiative next',
    category: 'game',
    parameters: [
      { name: 'action', type: 'string', required: false, description: 'init action or bonus' }
    ]
  },
  edge: {
    name: 'edge',
    aliases: ['e'],
    description: 'Spend edge on a dice roll',
    usage: 'edge <dice> <action>',
    category: 'dice',
    parameters: [
      { name: 'dice', type: 'number', required: true, description: 'Number of dice to roll' },
      { name: 'action', type: 'string', required: true, description: 'Edge action', options: ['reroll', 'explode', 'pushLimit'] }
    ]
  },
  test: {
    name: 'test',
    aliases: ['check'],
    description: 'Make a skill test against a threshold',
    usage: 'test <dice> <threshold>',
    category: 'dice',
    parameters: [
      { name: 'dice', type: 'number', required: true, description: 'Dice pool' },
      { name: 'threshold', type: 'number', required: true, description: 'Success threshold' }
    ]
  },
  matrix: {
    name: 'matrix',
    aliases: ['hack', 'deck'],
    description: 'Enter the Matrix or perform matrix actions',
    usage: 'matrix <action>',
    category: 'matrix',
    parameters: [
      { name: 'action', type: 'string', required: true, description: 'Matrix action', options: ['enter', 'exit', 'hack', 'scan'] }
    ]
  },
  status: {
    name: 'status',
    aliases: ['stat', 'info'],
    description: 'Show current session and character status',
    usage: 'status',
    category: 'game'
  },
  theme: {
    name: 'theme',
    aliases: ['skin'],
    description: 'Change console theme',
    usage: 'theme <theme_name>',
    category: 'basic',
    parameters: [
      { name: 'theme', type: 'string', required: true, description: 'Theme name', options: ['shadowrunBarren', 'matrix', 'cyberpunk', 'terminal'] }
    ]
  }
};

// Get all command names and aliases for auto-completion
export function getAllCommandNames(): string[] {
  const names: string[] = [];
  Object.values(commands).forEach(cmd => {
    names.push(cmd.name);
    names.push(...cmd.aliases);
  });
  return names.sort();
}

// Find command by name or alias
export function findCommand(name: string): Command | null {
  const lowerName = name.toLowerCase();
  
  // Direct name match
  if (commands[lowerName]) {
    return commands[lowerName];
  }
  
  // Alias match
  for (const cmd of Object.values(commands)) {
    if (cmd.aliases.includes(lowerName)) {
      return cmd;
    }
  }
  
  return null;
}

// Parse command line into command and arguments
export function parseCommandLine(input: string): { command: string; args: string[]; rawArgs: string } {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  const rawArgs = trimmed.substring(command.length).trim();
  
  return { command, args, rawArgs };
}

// Auto-complete commands based on input
export function autoCompleteCommand(input: string): string[] {
  const lowerInput = input.toLowerCase();
  const allCommands = getAllCommandNames();
  
  return allCommands.filter(cmd => cmd.startsWith(lowerInput));
}

// Get command suggestions based on partial input
export function getCommandSuggestions(input: string): Command[] {
  const { command } = parseCommandLine(input);
  const suggestions: Command[] = [];
  
  Object.values(commands).forEach(cmd => {
    if (cmd.name.startsWith(command) || cmd.aliases.some(alias => alias.startsWith(command))) {
      suggestions.push(cmd);
    }
  });
  
  return suggestions.slice(0, 5); // Limit to 5 suggestions
}

// Generate help text for a command
export function generateCommandHelp(cmd: Command): string {
  let help = `${cmd.name.toUpperCase()}\n`;
  help += `Description: ${cmd.description}\n`;
  help += `Usage: ${cmd.usage}\n`;
  help += `Category: ${cmd.category}\n`;
  
  if (cmd.aliases.length > 0) {
    help += `Aliases: ${cmd.aliases.join(', ')}\n`;
  }
  
  if (cmd.requiresGM) {
    help += `⚠️ GM Only command\n`;
  }
  
  if (cmd.parameters && cmd.parameters.length > 0) {
    help += `\nParameters:\n`;
    cmd.parameters.forEach(param => {
      const required = param.required ? 'Required' : 'Optional';
      help += `  ${param.name} (${param.type}, ${required}): ${param.description}\n`;
      if (param.options) {
        help += `    Options: ${param.options.join(', ')}\n`;
      }
    });
  }
  
  return help;
}

// Generate general help text
export function generateGeneralHelp(): string {
  const categories = ['basic', 'game', 'dice', 'character', 'gm', 'matrix'] as const;
  let help = 'SHADOWRUN INTERFACE COMMANDS\n\n';
  
  categories.forEach(category => {
    const categoryCommands = Object.values(commands).filter(cmd => cmd.category === category);
    if (categoryCommands.length > 0) {
      help += `${category.toUpperCase()} COMMANDS:\n`;
      categoryCommands.forEach(cmd => {
        const aliases = cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        help += `  ${cmd.name}${aliases} - ${cmd.description}\n`;
      });
      help += '\n';
    }
  });
  
  help += 'Type "help <command>" for detailed information about a specific command.\n';
  help += 'Use Tab for auto-completion and Up/Down arrows for command history.';
  
  return help;
}

// Execute a command
export async function executeCommand(
  commandLine: string,
  context: {
    userId: string;
    sessionId?: string;
    isGM: boolean;
    apiCall?: (endpoint: string, data: any) => Promise<any>;
  }
): Promise<CommandResult> {
  try {
    const { command, args, rawArgs } = parseCommandLine(commandLine);
    const cmd = findCommand(command);
    
    if (!cmd) {
      return {
        success: false,
        output: `Unknown command: ${command}\nType "help" for available commands.`
      };
    }
    
    // Check GM permissions
    if (cmd.requiresGM && !context.isGM) {
      return {
        success: false,
        output: `Command "${cmd.name}" requires GM privileges.`
      };
    }
    
    // Execute command
    switch (cmd.name) {
      case 'help':
        if (args.length > 0) {
          const helpCmd = findCommand(args[0]);
          if (helpCmd) {
            return { success: true, output: generateCommandHelp(helpCmd) };
          } else {
            return { success: false, output: `No help available for "${args[0]}"` };
          }
        } else {
          return { success: true, output: generateGeneralHelp() };
        }
      
      case 'clear':
        return { success: true, output: 'CLEAR_CONSOLE' }; // Special marker for console clearing
      
      case 'roll':
        if (args.length === 0) {
          return { success: false, output: 'Usage: roll <dice>\nExamples: roll 12, roll 3d6, roll init 8' };
        }
        try {
          const result = parseDiceCommand(rawArgs);
          const output = formatDiceResult(result, rawArgs);
          return { success: true, output, broadcast: true, data: result };
        } catch (error) {
          return { success: false, output: `Dice error: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
      
      case 'echo':
        if (rawArgs.length === 0) {
          return { success: false, output: 'Usage: echo <message>' };
        }
        return { 
          success: true, 
          output: `📢 ${context.userId}: ${rawArgs}`,
          broadcast: true 
        };
      
      case 'scene':
        if (rawArgs.length === 0) {
          return { success: false, output: 'Usage: scene <description>' };
        }
        return {
          success: true,
          output: `🎬 Scene Set: ${rawArgs}\n\nThe GM is describing the scene...`,
          broadcast: true
        };
      
      case 'status':
        const statusInfo = [
          `User: ${context.userId}`,
          `Session: ${context.sessionId || 'None'}`,
          `Role: ${context.isGM ? 'Game Master' : 'Player'}`,
          `Matrix Status: Disconnected`,
          `Edge: 3/3`,
          `Initiative: Not rolled`
        ];
        return { success: true, output: statusInfo.join('\n') };
      
      case 'test':
        if (args.length < 2) {
          return { success: false, output: 'Usage: test <dice> <threshold>' };
        }
        try {
          const dice = parseInt(args[0]);
          const threshold = parseInt(args[1]);
          const result = parseDiceCommand(dice.toString());
          const success = result.hits >= threshold;
          const netHits = result.hits - threshold;
          
          let output = formatDiceResult(result, `${dice} dice vs threshold ${threshold}`);
          output += `\n${success ? '✅' : '❌'} ${success ? `Success (${netHits} net hits)` : 'Failure'}`;
          
          return { success: true, output, broadcast: true, data: { ...result, threshold, success, netHits } };
        } catch (error) {
          return { success: false, output: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
      
      default:
        return {
          success: false,
          output: `Command "${cmd.name}" not yet implemented.`
        };
    }
  } catch (error) {
    return {
      success: false,
      output: `Command execution error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Command history management
export class CommandHistoryManager {
  private history: string[] = [];
  private currentIndex = -1;
  private maxHistory = 100;

  addCommand(command: string) {
    // Don't add empty commands or duplicates of the last command
    if (!command.trim() || command === this.history[this.history.length - 1]) {
      return;
    }
    
    this.history.push(command);
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    this.currentIndex = this.history.length;
    
    // Save to localStorage
    this.saveToStorage();
  }

  getPrevious(): string | null {
    if (this.history.length === 0) return null;
    
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
    
    return this.history[this.currentIndex] || null;
  }

  getNext(): string | null {
    if (this.history.length === 0) return null;
    
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    } else {
      this.currentIndex = this.history.length;
      return '';
    }
  }

  reset() {
    this.currentIndex = this.history.length;
  }

  getHistory(): string[] {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
    this.currentIndex = -1;
    localStorage.removeItem('shadowrun-command-history');
  }

  private saveToStorage() {
    try {
      localStorage.setItem('shadowrun-command-history', JSON.stringify(this.history));
    } catch (error) {
      console.warn('Failed to save command history:', error);
    }
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('shadowrun-command-history');
      if (saved) {
        this.history = JSON.parse(saved);
        this.currentIndex = this.history.length;
      }
    } catch (error) {
      console.warn('Failed to load command history:', error);
    }
  }
}