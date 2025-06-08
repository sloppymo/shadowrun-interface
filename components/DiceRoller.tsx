import { useState, useRef, useCallback } from 'react';
import { parseDiceCommand, formatDiceResult, spendEdge, ShadowrunDiceResult } from '../utils/dice';

export default function DiceRoller() {
  const [diceInput, setDiceInput] = useState('');
  const [useEdge, setUseEdge] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ input: string; result: ShadowrunDiceResult; output: string; timestamp: Date }>>([]);
  const rollTimeoutRef = useRef<NodeJS.Timeout>();
  const [quickRolls] = useState([
    { label: '6 dice', command: '6' },
    { label: '8 dice', command: '8' },
    { label: '12 dice', command: '12' },
    { label: '15 dice', command: '15' },
    { label: '3d6', command: '3d6' },
    { label: 'Initiative', command: 'init' },
  ]);

  const validateDiceCommand = (command: string): boolean => {
    // Basic validation to prevent command injection
    const dangerousPatterns = [
      /[;&|`$]/,
      /rm\s+-rf/,
      /curl\s+/,
      /nc\s+/,
      /eval\s*\(/,
      /exec\s*\(/,
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(command));
  };

  const rollDice = useCallback(async (command: string) => {
    if (!validateDiceCommand(command)) {
      setError('Invalid dice command');
      return;
    }

    if (isRolling) return;
    setIsRolling(true);
    setError(null);

    try {
      const response = await fetch('/api/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command,
          edge: useEdge 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to roll dice');
      }

      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data || !data.result) {
        setError('Malformed response from server');
        setResults(prev => [{
          input: command,
          result: { dice: 0, results: [], hits: 0, ones: 0, sixes: 0, isGlitch: false, isCriticalGlitch: false, exploded: [] },
          output: `Error: Invalid result for command "${command}"`,
          timestamp: new Date()
        }, ...prev].slice(0, 10));
        return;
      }
      
      const result = data.result;
      
      setResults(prev => [{
        input: command,
        result,
        output: formatDiceResult(result, command),
        timestamp: new Date()
      }, ...prev].slice(0, 10));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setResults(prev => [{
        input: command,
        result: { dice: 0, results: [], hits: 0, ones: 0, sixes: 0, isGlitch: false, isCriticalGlitch: false, exploded: [] },
        output: `Error: ${errorMessage}`,
        timestamp: new Date()
      }, ...prev].slice(0, 10));
    } finally {
      setIsRolling(false);
    }
  }, [useEdge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (diceInput.trim() && !isRolling) {
      rollDice(diceInput.trim());
      setDiceInput('');
    }
  };

  const rollWithEdge = useCallback(async (diceCount: number, edgeAction: 'reroll' | 'explode' | 'pushLimit') => {
    if (isRolling) return;
    setIsRolling(true);
    setError(null);

    try {
      const response = await fetch('/api/roll/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          diceCount,
          edgeAction 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to use edge');
      }

      const data = await response.json();
      const result = data.result;
      
      setResults(prev => [{
        input: `${diceCount} + edge (${edgeAction})`,
        result,
        output: `${formatDiceResult(result, `${diceCount} dice with edge (${edgeAction})`)}\n✨ Edge spent: ${edgeAction}`,
        timestamp: new Date()
      }, ...prev].slice(0, 10));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsRolling(false);
    }
  }, []);

  return (
    <div className="bg-black bg-opacity-70 border border-red-900 border-opacity-40 rounded-lg p-6 text-white" role="region" aria-label="Dice Roller">
      <h2 className="text-2xl font-bold text-green-500 mb-6 font-mono">
        🎲 SHADOWRUN DICE ROLLER
      </h2>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-100 rounded" role="alert">
          {error}
        </div>
      )}

      {/* Dice Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={diceInput}
            onChange={(e) => setDiceInput(e.target.value)}
            placeholder="Enter dice command (e.g., &apos;12&apos;, &apos;3d6&apos;, &apos;init 8&apos;)..."
            className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded text-white font-mono"
            aria-label="Dice command input"
            disabled={isRolling}
          />
          <button
            type="submit"
            className="bg-green-700 text-green-100 px-6 py-3 rounded hover:bg-green-600 font-bold disabled:opacity-50"
            disabled={isRolling}
            aria-label="Roll dice"
          >
            ROLL
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          Examples: &quot;12&quot; (SR dice), &quot;12 limit 4&quot; (with limit), &quot;3d6+2&quot; (standard), &quot;init 8&quot; (initiative)
        </div>

        {/* Edge Toggle */}
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useEdge}
              onChange={(e) => setUseEdge(e.target.checked)}
              className="form-checkbox h-5 w-5 text-green-500"
              aria-label="Use Edge"
            />
            <span>Use Edge</span>
          </label>
        </div>
      </form>

      {/* Quick Roll Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-red-400 mb-3">Quick Rolls</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickRolls.map((roll, index) => (
            <button
              key={index}
              onClick={() => rollDice(roll.command)}
              className="bg-blue-700 text-blue-100 px-3 py-2 rounded hover:bg-blue-600 text-sm disabled:opacity-50"
              disabled={isRolling}
              aria-label={`Quick roll ${roll.label}`}
            >
              {roll.label}
            </button>
          ))}
        </div>
      </div>

      {/* Edge Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-yellow-400 mb-3">Edge Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-300">Reroll Failures</h4>
            {[6, 8, 10, 12].map(dice => (
              <button
                key={dice}
                onClick={() => rollWithEdge(dice, 'reroll')}
                className="w-full bg-yellow-700 text-yellow-100 px-2 py-1 rounded hover:bg-yellow-600 text-sm disabled:opacity-50"
                disabled={isRolling}
                aria-label={`Reroll ${dice} dice with Edge`}
              >
                {dice} dice
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-300">Exploding 6s</h4>
            {[6, 8, 10, 12].map(dice => (
              <button
                key={dice}
                onClick={() => rollWithEdge(dice, 'explode')}
                className="w-full bg-orange-700 text-orange-100 px-2 py-1 rounded hover:bg-orange-600 text-sm disabled:opacity-50"
                disabled={isRolling}
                aria-label={`Explode ${dice} dice with Edge`}
              >
                {dice} dice
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-300">Push the Limit</h4>
            {[6, 8, 10, 12].map(dice => (
              <button
                key={dice}
                onClick={() => rollWithEdge(dice, 'pushLimit')}
                className="w-full bg-red-700 text-red-100 px-2 py-1 rounded hover:bg-red-600 text-sm disabled:opacity-50"
                disabled={isRolling}
                aria-label={`Push the limit with ${dice} dice`}
              >
                {dice} dice
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <h3 className="text-lg font-bold text-red-400 mb-3">Recent Rolls</h3>
        <div 
          className="space-y-4 max-h-96 overflow-y-auto" 
          role="log"
          aria-live="polite"
          data-testid="dice-results"
        >
          {results.length === 0 ? (
            <p className="text-gray-400 italic text-center py-8">
              No rolls yet. Enter a dice command above!
            </p>
          ) : (
            results.map((roll, index) => (
              <div key={index} className="border border-gray-700 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-green-400">
                    &gt; {roll.input}
                  </div>
                  <div className="text-xs text-gray-500">
                    {roll.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div 
                  className="whitespace-pre-wrap text-sm"
                  role="status"
                  aria-live="polite"
                >
                  {roll.output}
                </div>

                {roll.result && roll.result.results && roll.result.results.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {roll.result.results.map((die, dieIndex) => (
                      <span
                        key={dieIndex}
                        className={`inline-block w-8 h-8 rounded border-2 text-center text-sm font-bold leading-7 ${
                          die >= 5 ? 'bg-green-600 border-green-400 text-white' :
                          die === 1 ? 'bg-red-600 border-red-400 text-white' :
                          'bg-gray-600 border-gray-400 text-gray-300'
                        }`}
                        aria-label={`Die roll: ${die}`}
                      >
                        {die}
                      </span>
                    ))}
                    {roll.result.exploded && roll.result.exploded.length > 0 && (
                      <div className="ml-2 flex flex-wrap gap-1">
                        <span className="text-yellow-400 text-sm mr-1">+</span>
                        {roll.result.exploded.map((die, dieIndex) => (
                          <span
                            key={dieIndex}
                            className={`inline-block w-8 h-8 rounded border-2 text-center text-sm font-bold leading-7 ${
                              die >= 5 ? 'bg-yellow-600 border-yellow-400 text-white' :
                              'bg-yellow-800 border-yellow-600 text-gray-300'
                            }`}
                            aria-label={`Exploded die roll: ${die}`}
                          >
                            {die}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}