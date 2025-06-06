import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { SessionInfo } from '../utils/api';
import SessionManager from '../components/SessionManager';
import CharacterSheet, { ShadowrunCharacter } from '../components/CharacterSheet';

export default function EnhancedDashboard() {
  const { user } = useUser();
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<ShadowrunCharacter | null>(null);
  const [systemStats, setSystemStats] = useState({
    activeSessions: 0,
    onlineUsers: 0,
    serverStatus: 'Online' as 'Online' | 'Maintenance' | 'Offline'
  });
  const [activeView, setActiveView] = useState<'overview' | 'sessions' | 'character'>('overview');

  // Load saved character from localStorage
  useEffect(() => {
    const savedCharacter = localStorage.getItem('shadowrun-current-character');
    if (savedCharacter) {
      try {
        setCurrentCharacter(JSON.parse(savedCharacter));
      } catch (error) {
        console.error('Failed to load saved character:', error);
      }
    }
  }, []);

  // Save character to localStorage when it changes
  useEffect(() => {
    if (currentCharacter) {
      localStorage.setItem('shadowrun-current-character', JSON.stringify(currentCharacter));
    }
  }, [currentCharacter]);

  const handleSessionJoined = (session: SessionInfo | null) => {
    setCurrentSession(session);
    if (session) {
      setActiveView('overview');
    }
  };

  const handleCharacterUpdate = (character: ShadowrunCharacter) => {
    setCurrentCharacter(character);
  };

  return (
    <>
      <Head>
        <title>Shadowrun Interface | Enhanced Dashboard</title>
        <meta name="description" content="Enhanced Shadowrun RPG dashboard with session management and character sheets" />
      </Head>

      <main className="min-h-screen bg-gray-950">
        <SignedIn>
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <header className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-green-500 font-mono">
                    <span className="text-red-400">&gt;</span> ENHANCED OPERATOR DASHBOARD
                  </h1>
                  <p className="text-gray-400 mt-2">
                    Logged in as <span className="text-red-400">{user?.fullName || user?.username || 'Unknown Runner'}</span>
                  </p>
                  {currentSession && (
                    <p className="text-green-400 text-sm mt-1">
                      🔗 Connected to: {currentSession.name} ({currentSession.isGM ? 'GM' : 'Player'})
                    </p>
                  )}
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-400">Server Status:</span>
                    <span className={`font-bold ${
                      systemStats.serverStatus === 'Online' ? 'text-green-400' : 
                      systemStats.serverStatus === 'Maintenance' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {systemStats.serverStatus}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {systemStats.activeSessions} active sessions • {systemStats.onlineUsers} users online
                  </div>
                </div>
              </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="mb-6">
              <div className="flex space-x-4 border-b border-red-900 border-opacity-40">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'sessions', label: 'Sessions', icon: '🎮' },
                  { id: 'character', label: 'Character', icon: '🎲' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as any)}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeView === tab.id
                        ? 'text-green-500 border-green-500'
                        : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Content Area */}
            <div className="space-y-6">
              {activeView === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quick Actions */}
                  <div className="bg-black bg-opacity-70 border border-red-900 border-opacity-40 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-green-500 mb-4">🚀 Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link href="/enhanced-console"
                        className="bg-green-700 border border-green-500 text-green-100 px-4 py-3 rounded text-center hover:bg-green-600 transition-colors block">
                        🖥️ Launch Enhanced Console
                      </Link>
                      <button
                        onClick={() => setActiveView('sessions')}
                        className="bg-blue-700 border border-blue-500 text-blue-100 px-4 py-3 rounded text-center hover:bg-blue-600 transition-colors">
                        🎮 Manage Sessions
                      </button>
                      <button
                        onClick={() => setActiveView('character')}
                        className="bg-purple-700 border border-purple-500 text-purple-100 px-4 py-3 rounded text-center hover:bg-purple-600 transition-colors">
                        🎲 Character Sheet
                      </button>
                      <Link href="/dice-roller"
                        className="bg-red-700 border border-red-500 text-red-100 px-4 py-3 rounded text-center hover:bg-red-600 transition-colors block">
                        🎯 Dice Roller
                      </Link>
                    </div>
                  </div>

                  {/* Current Session Status */}
                  <div className="bg-black bg-opacity-70 border border-red-900 border-opacity-40 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-green-500 mb-4">📡 Session Status</h2>
                    {currentSession ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Session:</span>
                          <span className="text-white font-medium">{currentSession.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Role:</span>
                          <span className={`font-medium ${currentSession.isGM ? 'text-red-400' : 'text-blue-400'}`}>
                            {currentSession.isGM ? 'Game Master' : 'Player'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Players:</span>
                          <span className="text-green-400">{currentSession.playerCount}/{currentSession.maxPlayers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className={`font-medium ${
                            currentSession.gameState === 'active' ? 'text-green-400' :
                            currentSession.gameState === 'paused' ? 'text-yellow-400' : 'text-gray-400'
                          }`}>
                            {currentSession.gameState.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 mb-4">Not connected to any session</p>
                        <button
                          onClick={() => setActiveView('sessions')}
                          className="bg-green-700 text-green-100 px-4 py-2 rounded hover:bg-green-600"
                        >
                          Join or Create Session
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Character Quick View */}
                  <div className="bg-black bg-opacity-70 border border-red-900 border-opacity-40 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-green-500 mb-4">🎭 Active Character</h2>
                    {currentCharacter ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white font-medium">{currentCharacter.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Archetype:</span>
                          <span className="text-blue-400">{currentCharacter.background.archetype}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Metatype:</span>
                          <span className="text-purple-400">{currentCharacter.metatype}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Edge:</span>
                          <span className="text-yellow-400">{currentCharacter.attributes.edge}/3</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-400">Physical</div>
                            <div className="text-lg font-bold text-red-400">
                              {currentCharacter.condition.physical.current}/{currentCharacter.condition.physical.max}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-400">Stun</div>
                            <div className="text-lg font-bold text-yellow-400">
                              {currentCharacter.condition.stun.current}/{currentCharacter.condition.stun.max}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 mb-4">No active character</p>
                        <button
                          onClick={() => setActiveView('character')}
                          className="bg-purple-700 text-purple-100 px-4 py-2 rounded hover:bg-purple-600"
                        >
                          Create Character
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-black bg-opacity-70 border border-red-900 border-opacity-40 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-green-500 mb-4">📜 Recent Activity</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Session joined</span>
                        <span className="text-gray-500">2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Character updated</span>
                        <span className="text-gray-500">3 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dice rolled: 14 hits</span>
                        <span className="text-gray-500">4 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Console accessed</span>
                        <span className="text-gray-500">5 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'sessions' && (
                <div className="max-w-4xl mx-auto">
                  <SessionManager 
                    onSessionJoined={handleSessionJoined}
                    currentSession={currentSession}
                  />
                </div>
              )}

              {activeView === 'character' && (
                <div className="max-w-6xl mx-auto">
                  <CharacterSheet 
                    character={currentCharacter || undefined}
                    onCharacterUpdate={handleCharacterUpdate}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-red-900 border-opacity-40">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div>
                  Shadowrun Interface v2.0 Enhanced • Built for runners, by runners
                </div>
                <div className="flex space-x-4">
                  <Link href="/console" className="hover:text-white">Legacy Console</Link>
                  <Link href="/enhanced-console" className="hover:text-white">Enhanced Console</Link>
                  <Link href="/help" className="hover:text-white">Help</Link>
                </div>
              </div>
            </footer>
          </div>
        </SignedIn>
        
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </main>
    </>
  );
}