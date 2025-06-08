import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Combat types
interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'spirit' | 'drone';
  initiative: number;
  initiativeScore: number;
  actions: number;
  reaction: number;
  intuition: number;
  edge: number;
  currentEdge: number;
  physicalDamage: number;
  stunDamage: number;
  conditionMonitor: {
    physical: number;
    stun: number;
  };
  status: 'active' | 'delayed' | 'unconscious' | 'dead';
  tags: string[];
  imageUrl?: string;
}

interface CombatRound {
  number: number;
  actions: CombatAction[];
  timestamp: Date;
}

interface CombatAction {
  id: string;
  combatantId: string;
  type: 'attack' | 'defense' | 'movement' | 'spell' | 'matrix' | 'other';
  description: string;
  rolls?: DiceRoll[];
  timestamp: Date;
}

interface DiceRoll {
  pool: number;
  hits: number;
  glitches: number;
  edge: boolean;
}

export function CombatManager({ sessionId, userId, isGM }: { sessionId: string; userId: string; isGM: boolean }) {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [combatHistory, setCombatHistory] = useState<CombatRound[]>([]);
  const [isPaused, setIsPaused] = useState(true);
  const [showAddCombatant, setShowAddCombatant] = useState(false);
  const [selectedCombatant, setSelectedCombatant] = useState<Combatant | null>(null);

  // Initiative order
  const sortedCombatants = [...combatants].sort((a, b) => b.initiativeScore - a.initiativeScore);
  const activeCombatant = sortedCombatants[activeIndex];

  // Roll initiative for all combatants
  const rollInitiative = () => {
    setCombatants(prev => prev.map(c => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const score = c.initiative + c.intuition + roll;
      return { ...c, initiativeScore: score };
    }));
    setActiveIndex(0);
    setCurrentRound(1);
    setIsPaused(false);
  };

  // Next turn
  const nextTurn = () => {
    if (activeIndex >= sortedCombatants.length - 1) {
      // End of round
      setActiveIndex(0);
      setCurrentRound(prev => prev + 1);
      
      // Reduce actions for sustained effects
      setCombatants(prev => prev.map(c => ({
        ...c,
        actions: Math.max(0, c.actions - 1)
      })));
    } else {
      setActiveIndex(prev => prev + 1);
    }
  };

  // Add combatant
  const addCombatant = (combatant: Omit<Combatant, 'id' | 'initiativeScore'>) => {
    const newCombatant: Combatant = {
      ...combatant,
      id: `combatant-${Date.now()}`,
      initiativeScore: 0
    };
    setCombatants(prev => [...prev, newCombatant]);
    setShowAddCombatant(false);
  };

  // Update combatant
  const updateCombatant = (id: string, updates: Partial<Combatant>) => {
    setCombatants(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  // Remove combatant
  const removeCombatant = (id: string) => {
    setCombatants(prev => prev.filter(c => c.id !== id));
    if (selectedCombatant?.id === id) {
      setSelectedCombatant(null);
    }
  };

  // Apply damage
  const applyDamage = (id: string, physical: number, stun: number) => {
    setCombatants(prev => prev.map(c => {
      if (c.id !== id) return c;
      
      const newPhysical = Math.min(c.physicalDamage + physical, c.conditionMonitor.physical);
      const newStun = Math.min(c.stunDamage + stun, c.conditionMonitor.stun);
      
      let status = c.status;
      if (newPhysical >= c.conditionMonitor.physical) {
        status = 'dead';
      } else if (newStun >= c.conditionMonitor.stun) {
        status = 'unconscious';
      }
      
      return {
        ...c,
        physicalDamage: newPhysical,
        stunDamage: newStun,
        status
      };
    }));
  };

  // Spend Edge
  const spendEdge = (id: string, amount: number = 1) => {
    setCombatants(prev => prev.map(c => 
      c.id === id ? { ...c, currentEdge: Math.max(0, c.currentEdge - amount) } : c
    ));
  };

  return (
    <div className="combat-manager bg-gray-900 rounded-lg p-6 shadow-2xl">
      <div className="header flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-green-400 font-mono">
          COMBAT MANAGER
        </h2>
        <div className="flex gap-4 items-center">
          <div className="text-green-400">
            <span className="text-xl font-bold">ROUND {currentRound}</span>
          </div>
          {isGM && (
            <div className="flex gap-2">
              <button
                onClick={rollInitiative}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-black font-bold rounded transition-colors"
              >
                ROLL INITIATIVE
              </button>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-4 py-2 font-bold rounded transition-colors ${
                  isPaused 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-black' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
              <button
                onClick={() => setShowAddCombatant(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
              >
                ADD COMBATANT
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="combat-grid grid grid-cols-12 gap-4">
        {/* Initiative Order */}
        <div className="col-span-4 bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-bold text-green-400 mb-4">INITIATIVE ORDER</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {sortedCombatants.map((combatant, index) => (
                <motion.div
                  key={combatant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-3 rounded cursor-pointer transition-all ${
                    index === activeIndex && !isPaused
                      ? 'bg-green-900 border-2 border-green-400 shadow-lg shadow-green-400/50'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } ${combatant.status !== 'active' ? 'opacity-50' : ''}`}
                  onClick={() => setSelectedCombatant(combatant)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-green-400">
                        {combatant.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {combatant.type.toUpperCase()} • Init: {combatant.initiativeScore}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        P: {combatant.physicalDamage}/{combatant.conditionMonitor.physical}
                      </div>
                      <div className="text-xs text-gray-400">
                        S: {combatant.stunDamage}/{combatant.conditionMonitor.stun}
                      </div>
                    </div>
                  </div>
                  {combatant.tags.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {combatant.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {activeCombatant && !isPaused && isGM && (
            <div className="mt-4">
              <button
                onClick={nextTurn}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-black font-bold rounded transition-colors"
              >
                END TURN
              </button>
            </div>
          )}
        </div>

        {/* Combat Details */}
        <div className="col-span-8 space-y-4">
          {/* Active Combatant */}
          {activeCombatant && !isPaused && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-4 border-2 border-green-400"
            >
              <h3 className="text-xl font-bold text-green-400 mb-4">
                ACTIVE: {activeCombatant.name}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Available Actions: {activeCombatant.actions}</p>
                  <p className="text-gray-400">Edge: {activeCombatant.currentEdge}/{activeCombatant.edge}</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
                    ATTACK
                  </button>
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                    MOVE
                  </button>
                  <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">
                    SPELL
                  </button>
                  <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-black rounded text-sm">
                    OTHER
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Selected Combatant Details */}
          {selectedCombatant && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <h3 className="text-xl font-bold text-green-400 mb-4">
                {selectedCombatant.name} - DETAILS
              </h3>
              
              {/* Health Bars */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Physical</span>
                    <span className="text-gray-400">
                      {selectedCombatant.physicalDamage}/{selectedCombatant.conditionMonitor.physical}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ 
                        width: `${(selectedCombatant.physicalDamage / selectedCombatant.conditionMonitor.physical) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Stun</span>
                    <span className="text-gray-400">
                      {selectedCombatant.stunDamage}/{selectedCombatant.conditionMonitor.stun}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ 
                        width: `${(selectedCombatant.stunDamage / selectedCombatant.conditionMonitor.stun) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              {isGM && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyDamage(selectedCombatant.id, 1, 0)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    +1 Physical
                  </button>
                  <button
                    onClick={() => applyDamage(selectedCombatant.id, 0, 1)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    +1 Stun
                  </button>
                  <button
                    onClick={() => spendEdge(selectedCombatant.id, 1)}
                    disabled={selectedCombatant.currentEdge === 0}
                    className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded text-sm disabled:opacity-50"
                  >
                    Spend Edge
                  </button>
                  <button
                    onClick={() => applyDamage(selectedCombatant.id, -1, 0)}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-black rounded text-sm"
                  >
                    Heal 1 Physical
                  </button>
                  <button
                    onClick={() => applyDamage(selectedCombatant.id, 0, -1)}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-black rounded text-sm"
                  >
                    Heal 1 Stun
                  </button>
                  <button
                    onClick={() => removeCombatant(selectedCombatant.id)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Combat Log */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-green-400 mb-3">COMBAT LOG</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-sm">
              <div className="text-gray-400">Round {currentRound} started...</div>
              {combatHistory.slice(-10).map((round, i) => (
                <div key={i} className="text-gray-500">
                  Round {round.number}: {round.actions.length} actions
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Combatant Modal */}
      <AnimatePresence>
        {showAddCombatant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowAddCombatant(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-green-400 mb-4">ADD COMBATANT</h3>
              <AddCombatantForm onAdd={addCombatant} onCancel={() => setShowAddCombatant(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add Combatant Form Component
function AddCombatantForm({ 
  onAdd, 
  onCancel 
}: { 
  onAdd: (combatant: Omit<Combatant, 'id' | 'initiativeScore'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'npc' as Combatant['type'],
    initiative: 10,
    reaction: 5,
    intuition: 3,
    edge: 2,
    currentEdge: 2,
    physicalDamage: 0,
    stunDamage: 0,
    conditionMonitor: {
      physical: 10,
      stun: 10
    },
    status: 'active' as Combatant['status'],
    actions: 1,
    tags: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-green-400 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-gray-700 text-green-400 border border-green-600 rounded px-3 py-2"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-green-400 mb-1">Type</label>
          <select
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value as Combatant['type'] })}
            className="w-full bg-gray-700 text-green-400 border border-green-600 rounded px-3 py-2"
          >
            <option value="player">Player</option>
            <option value="npc">NPC</option>
            <option value="spirit">Spirit</option>
            <option value="drone">Drone</option>
          </select>
        </div>
        
        <div>
          <label className="block text-green-400 mb-1">Initiative</label>
          <input
            type="number"
            value={formData.initiative}
            onChange={e => setFormData({ ...formData, initiative: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-700 text-green-400 border border-green-600 rounded px-3 py-2"
          />
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-black font-bold rounded"
        >
          Add
        </button>
      </div>
    </form>
  );
} 