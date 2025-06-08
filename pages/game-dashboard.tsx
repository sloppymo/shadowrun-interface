import React, { useState } from 'react';
import { DiceRoller3D } from '../components/DiceRoller3D';
import { CombatManager } from '../components/CombatManager';
import { MatrixInterface } from '../components/MatrixInterface';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'dice' | 'combat' | 'matrix';

export default function GameDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dice');
  const [sessionId] = useState('demo-session');
  const [userId] = useState('demo-user');
  const [isGM] = useState(true);

  const tabs = [
    { id: 'dice' as TabType, label: '🎲 3D Dice', color: 'green' },
    { id: 'combat' as TabType, label: '⚔️ Combat', color: 'red' },
    { id: 'matrix' as TabType, label: '🌐 Matrix', color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-black text-green-400">
      {/* Cyberpunk Background Effect */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-black to-purple-900" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center" />
      </div>

      <div className="relative z-10 container mx-auto p-4">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 font-mono glitch-text">
            SHADOWRUN GAME SYSTEM
          </h1>
          <p className="text-center text-gray-400">Enhanced Gaming Dashboard v3.0</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 rounded-lg p-1 flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-600 text-black`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dice' && (
              <div className="max-w-6xl mx-auto">
                <DiceRoller3D />
              </div>
            )}

            {activeTab === 'combat' && (
              <div className="max-w-7xl mx-auto">
                <CombatManager sessionId={sessionId} userId={userId} isGM={isGM} />
              </div>
            )}

            {activeTab === 'matrix' && (
              <div className="max-w-7xl mx-auto">
                <MatrixInterface sessionId={sessionId} userId={userId} characterId="demo-char" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quick Stats Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-green-500 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-400">Session:</span>
                <span className="ml-2 text-green-400 font-mono">{sessionId}</span>
              </div>
              <div>
                <span className="text-gray-400">Role:</span>
                <span className="ml-2 text-green-400 font-mono">{isGM ? 'Game Master' : 'Player'}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors">
                🎙️ Voice Chat
              </button>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors">
                💬 Text Chat
              </button>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors">
                📊 Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glitch-text {
          animation: glitch 2s infinite;
        }
        
        @keyframes glitch {
          0%, 100% { 
            text-shadow: 
              0 0 10px #00ff00, 
              0 0 20px #00ff00,
              0 0 30px #00ff00;
          }
          25% { 
            text-shadow: 
              2px 0 10px #ff0000, 
              -2px 0 10px #0000ff,
              0 0 20px #00ff00;
          }
          50% { 
            text-shadow: 
              -2px 0 10px #ff0000, 
              2px 0 10px #0000ff,
              0 0 30px #00ff00;
          }
          75% { 
            text-shadow: 
              0 2px 10px #ff0000, 
              0 -2px 10px #0000ff,
              0 0 20px #00ff00;
          }
        }
      `}</style>
    </div>
  );
} 