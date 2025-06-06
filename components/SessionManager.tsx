import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { sessionAPI, SessionInfo } from '../utils/api';

interface SessionManagerProps {
  onSessionJoined: (sessionInfo: SessionInfo) => void;
  currentSession?: SessionInfo | null;
}

interface CreateSessionForm {
  name: string;
  maxPlayers: number;
  password?: string;
  isPrivate: boolean;
}

export default function SessionManager({ onSessionJoined, currentSession }: SessionManagerProps) {
  const { user } = useUser();
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [createForm, setCreateForm] = useState<CreateSessionForm>({
    name: '',
    maxPlayers: 6,
    password: '',
    isPrivate: false
  });
  
  const [joinPassword, setJoinPassword] = useState('');

  // Load active sessions
  useEffect(() => {
    loadActiveSessions();
  }, []);

  const loadActiveSessions = async () => {
    try {
      setLoading(true);
      const sessions = await sessionAPI.getActiveSessions();
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setError('Session name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const session = await sessionAPI.createSession(createForm.name, createForm.maxPlayers);
      setShowCreateForm(false);
      setCreateForm({ name: '', maxPlayers: 6, password: '', isPrivate: false });
      onSessionJoined(session);
    } catch (error) {
      console.error('Failed to create session:', error);
      setError(error instanceof Error ? error.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const session = await sessionAPI.joinSession(sessionId, joinPassword || undefined);
      setShowJoinForm(null);
      setJoinPassword('');
      onSessionJoined(session);
    } catch (error) {
      console.error('Failed to join session:', error);
      setError(error instanceof Error ? error.message : 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSession = async () => {
    if (!currentSession) return;

    try {
      setLoading(true);
      await sessionAPI.leaveSession(currentSession.id);
      onSessionJoined(null as any); // Signal that we left
      loadActiveSessions(); // Refresh the list
    } catch (error) {
      console.error('Failed to leave session:', error);
      setError(error instanceof Error ? error.message : 'Failed to leave session');
    } finally {
      setLoading(false);
    }
  };

  if (currentSession) {
    return (
      <div className="bg-black bg-opacity-70 border border-red-900 border-opacity-40 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold text-green-500 mb-4">Current Session</h2>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-300">Name:</span>
            <span className="text-green-400">{currentSession.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Players:</span>
            <span className="text-green-400">{currentSession.playerCount}/{currentSession.maxPlayers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Status:</span>
            <span className={`${
              currentSession.gameState === 'active' ? 'text-green-400' :
              currentSession.gameState === 'paused' ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {currentSession.gameState.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Role:</span>
            <span className="text-red-400">{currentSession.isGM ? 'Game Master' : 'Player'}</span>
          </div>
        </div>

        <button
          onClick={handleLeaveSession}
          disabled={loading}
          className="w-full bg-red-700 text-red-100 px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Leaving...' : 'Leave Session'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black bg-opacity-70 border border-red-900 border-opacity-40 rounded-lg p-6 text-white">
      <h2 className="text-xl font-bold text-green-500 mb-4">Session Management</h2>
      
      {error && (
        <div className="bg-red-900 bg-opacity-50 border border-red-500 p-3 rounded mb-4">
          <p className="text-red-200">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 mt-2 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Create Session Button */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-green-700 text-green-100 px-4 py-2 rounded hover:bg-green-600"
        >
          Create New Session
        </button>

        {/* Active Sessions */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-red-300">Active Sessions</h3>
            <button
              onClick={loadActiveSessions}
              disabled={loading}
              className="text-sm text-blue-400 hover:text-blue-200 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {activeSessions.length === 0 ? (
            <p className="text-gray-400 italic">No active sessions found</p>
          ) : (
            <div className="space-y-2">
              {activeSessions.map(session => (
                <div key={session.id} className="border border-gray-700 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{session.name}</h4>
                      <p className="text-sm text-gray-400">
                        {session.playerCount}/{session.maxPlayers} players • {session.gameState}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowJoinForm(session.id)}
                      disabled={session.playerCount >= session.maxPlayers}
                      className="bg-blue-700 text-blue-100 px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {session.playerCount >= session.maxPlayers ? 'Full' : 'Join'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-green-500 mb-4">Create Session</h3>
            
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Session Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm({...createForm, name: e.target.value})}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                  placeholder="Enter session name..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Max Players</label>
                <select
                  value={createForm.maxPlayers}
                  onChange={e => setCreateForm({...createForm, maxPlayers: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} players</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-700 text-green-100 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-blue-500 mb-4">Join Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Password (if required)</label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={e => setJoinPassword(e.target.value)}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                  placeholder="Enter password..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowJoinForm(null)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleJoinSession(showJoinForm)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-700 text-blue-100 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}