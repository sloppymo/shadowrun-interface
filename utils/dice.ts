// Shadowrun Dice Utilities
export interface ShadowrunDiceResult {
  dice: number;
  results: number[];
  hits: number;
  ones: number;
  sixes: number;
  isGlitch: boolean;
  isCriticalGlitch: boolean;
  total?: number; // For non-shadowrun dice
  exploded: number[]; // Exploding 6s for edge
}

export interface DiceModifiers {
  limit?: number;
  edge?: boolean;
  explodingDice?: boolean;
  rerollOnes?: boolean;
  pushTheLimit?: boolean;
}

// Roll standard Shadowrun dice (d6s counting 5s and 6s as hits)
export function rollShadowrunDice(diceCount: number, modifiers: DiceModifiers = {}): ShadowrunDiceResult {
  const results: number[] = [];
  const exploded: number[] = [];
  
  // Initial roll
  for (let i = 0; i < diceCount; i++) {
    results.push(Math.floor(Math.random() * 6) + 1);
  }
  
  // Handle edge effects (exploding 6s)
  if (modifiers.edge || modifiers.explodingDice) {
    let sixesCount = results.filter(r => r === 6).length;
    while (sixesCount > 0) {
      for (let i = 0; i < sixesCount; i++) {
        const newRoll = Math.floor(Math.random() * 6) + 1;
        exploded.push(newRoll);
      }
      sixesCount = exploded.filter(r => r === 6).length;
    }
  }
  
  // Handle reroll ones (some edge effects)
  if (modifiers.rerollOnes) {
    for (let i = 0; i < results.length; i++) {
      if (results[i] === 1) {
        results[i] = Math.floor(Math.random() * 6) + 1;
      }
    }
  }
  
  const allDice = [...results, ...exploded];
  const hits = allDice.filter(r => r >= 5).length;
  const ones = results.filter(r => r === 1).length; // Only count ones from original dice for glitch
  const sixes = allDice.filter(r => r === 6).length;
  
  // Apply limit
  const finalHits = modifiers.limit && !modifiers.pushTheLimit 
    ? Math.min(hits, modifiers.limit) 
    : hits;
  
  // Glitch rules: More than half the dice show 1s
  const isGlitch = ones > Math.floor(diceCount / 2);
  const isCriticalGlitch = isGlitch && finalHits === 0;
  
  return {
    dice: diceCount,
    results: allDice,
    hits: finalHits,
    ones,
    sixes,
    isGlitch,
    isCriticalGlitch,
    exploded
  };
}

// Roll standard dice (for damage, initiative, etc.)
export function rollStandardDice(notation: string): ShadowrunDiceResult {
  const match = notation.match(/(\d+)d(\d+)([+-]\d+)?/i);
  if (!match) {
    throw new Error('Invalid dice notation. Use format like "3d6" or "2d8+2"');
  }
  
  const diceCount = parseInt(match[1]);
  const diceSize = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;
  
  const results: number[] = [];
  for (let i = 0; i < diceCount; i++) {
    results.push(Math.floor(Math.random() * diceSize) + 1);
  }
  
  const total = results.reduce((sum, roll) => sum + roll, 0) + modifier;
  
  return {
    dice: diceCount,
    results,
    hits: 0,
    ones: 0,
    sixes: 0,
    isGlitch: false,
    isCriticalGlitch: false,
    total,
    exploded: []
  };
}

// Parse and execute various dice commands
export function parseDiceCommand(command: string): ShadowrunDiceResult {
  const cmd = command.toLowerCase().trim();
  
  // Shadowrun dice patterns
  const srDiceMatch = cmd.match(/^(\d+)(?:\s*(?:limit|l)\s*(\d+))?(?:\s*(edge|e))?$/);
  if (srDiceMatch) {
    const diceCount = parseInt(srDiceMatch[1]);
    const limit = srDiceMatch[2] ? parseInt(srDiceMatch[2]) : undefined;
    const hasEdge = !!srDiceMatch[3];
    
    return rollShadowrunDice(diceCount, { limit, edge: hasEdge });
  }
  
  // Standard dice patterns (3d6, 2d8+2, etc.)
  const standardMatch = cmd.match(/^\d+d\d+([+-]\d+)?$/);
  if (standardMatch) {
    return rollStandardDice(cmd);
  }
  
  // Initiative roll (1d6+REA+INT)
  const initMatch = cmd.match(/^init(?:iative)?(?:\s+(\d+))?$/);
  if (initMatch) {
    const bonus = initMatch[1] ? parseInt(initMatch[1]) : 8; // Default REA+INT
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    return {
      dice: 1,
      results: [diceRoll],
      hits: 0,
      ones: 0,
      sixes: 0,
      isGlitch: false,
      isCriticalGlitch: false,
      total: diceRoll + bonus,
      exploded: []
    };
  }
  
  throw new Error('Invalid dice command. Try: "12" (SR dice), "3d6" (standard), or "init 12" (initiative)');
}

// Format dice results for display
export function formatDiceResult(result: ShadowrunDiceResult, command: string): string {
  let output = `Rolling ${command}...\n`;
  
  if (result.total !== undefined) {
    // Standard dice
    output += `Results: [${result.results.join(', ')}]\n`;
    output += `Total: ${result.total}`;
  } else {
    // Shadowrun dice
    output += `Results: [${result.results.join(', ')}]\n`;
    output += `Hits: ${result.hits}`;
    
    if (result.exploded.length > 0) {
      output += ` (+ ${result.exploded.length} exploded dice: [${result.exploded.join(', ')}])`;
    }
    
    if (result.isCriticalGlitch) {
      output += `\n💀 CRITICAL GLITCH! (${result.ones} ones, no hits)`;
    } else if (result.isGlitch) {
      output += `\n⚠️ Glitch! (${result.ones} ones)`;
    }
    
    if (result.hits === 0 && !result.isCriticalGlitch) {
      output += '\n❌ No hits - failure!';
    } else if (result.hits >= 4) {
      output += '\n✨ Excellent success!';
    } else if (result.hits >= 2) {
      output += '\n✅ Good success!';
    } else if (result.hits === 1) {
      output += '\n👍 Marginal success';
    }
  }
  
  return output;
}

// Edge actions
export function spendEdge(diceCount: number, edgeAction: 'reroll' | 'explode' | 'pushLimit'): ShadowrunDiceResult {
  const modifiers: DiceModifiers = { edge: true };
  
  switch (edgeAction) {
    case 'reroll':
      modifiers.rerollOnes = true;
      break;
    case 'explode':
      modifiers.explodingDice = true;
      break;
    case 'pushLimit':
      modifiers.pushTheLimit = true;
      break;
  }
  
  return rollShadowrunDice(diceCount, modifiers);
}

// Common Shadowrun test difficulties
export const testDifficulties = {
  trivial: 1,
  easy: 2,
  average: 3,
  hard: 4,
  extreme: 5,
  impossible: 6
};

// Evaluate test success
export function evaluateTest(hits: number, threshold: number): string {
  const netHits = hits - threshold;
  
  if (netHits < 0) {
    return `Failure by ${Math.abs(netHits)} hits`;
  } else if (netHits === 0) {
    return 'Marginal success';
  } else if (netHits >= 4) {
    return `Excellent success (${netHits} net hits)`;
  } else {
    return `Success (${netHits} net hits)`;
  }
}