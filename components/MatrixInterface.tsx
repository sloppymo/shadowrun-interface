import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Matrix types
interface MatrixNode {
  id: string;
  name: string;
  type: 'host' | 'file' | 'device' | 'persona' | 'ice' | 'data';
  security: number; // 1-10
  encrypted: boolean;
  connected: string[]; // Connected node IDs
  position: { x: number; y: number; z: number };
  discovered: boolean;
  compromised: boolean;
  data?: any;
}

interface MatrixAction {
  id: string;
  name: string;
  type: 'hack' | 'search' | 'download' | 'upload' | 'crash' | 'trace';
  cost: number; // Initiative cost
  difficulty: number;
  icon: string;
}

interface IceProgram {
  id: string;
  name: string;
  type: 'patrol' | 'probe' | 'killer' | 'track' | 'tar_baby';
  rating: number;
  status: 'active' | 'alerted' | 'crashed';
  position: { x: number; y: number; z: number };
}

interface MatrixStats {
  attack: number;
  sleaze: number;
  dataProcessing: number;
  firewall: number;
  matrixDamage: number;
  overwatch: number;
}

export function MatrixInterface({ sessionId, userId, characterId }: { sessionId: string; userId: string; characterId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<MatrixNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MatrixNode | null>(null);
  const [matrixStats, setMatrixStats] = useState<MatrixStats>({
    attack: 4,
    sleaze: 5,
    dataProcessing: 6,
    firewall: 4,
    matrixDamage: 0,
    overwatch: 0
  });
  const [icePrograms, setIcePrograms] = useState<IceProgram[]>([]);
  const [isInVR, setIsInVR] = useState(false);
  const [matrixPerception, setMatrixPerception] = useState(5);
  const [actions, setActions] = useState<MatrixAction[]>([
    { id: 'hack', name: 'Hack on the Fly', type: 'hack', cost: 1, difficulty: 5, icon: '🔓' },
    { id: 'search', name: 'Matrix Search', type: 'search', cost: 1, difficulty: 3, icon: '🔍' },
    { id: 'download', name: 'Download Data', type: 'download', cost: 2, difficulty: 4, icon: '📥' },
    { id: 'crash', name: 'Data Spike', type: 'crash', cost: 2, difficulty: 6, icon: '⚡' },
    { id: 'trace', name: 'Trace Icon', type: 'trace', cost: 1, difficulty: 5, icon: '📡' }
  ]);
  const [actionLog, setActionLog] = useState<string[]>([]);

  // Initialize Matrix nodes
  useEffect(() => {
    generateMatrixNodes();
    setupMatrixVisualization();
  }, []);

  // Generate procedural Matrix nodes
  const generateMatrixNodes = () => {
    const newNodes: MatrixNode[] = [
      {
        id: 'host-main',
        name: 'Corporate Host',
        type: 'host',
        security: 8,
        encrypted: true,
        connected: ['node-1', 'node-2', 'ice-1'],
        position: { x: 0, y: 0, z: 0 },
        discovered: true,
        compromised: false
      },
      {
        id: 'node-1',
        name: 'Security Subsystem',
        type: 'device',
        security: 6,
        encrypted: false,
        connected: ['host-main', 'data-1'],
        position: { x: -2, y: 1, z: 0 },
        discovered: false,
        compromised: false
      },
      {
        id: 'node-2',
        name: 'Personnel Database',
        type: 'file',
        security: 5,
        encrypted: true,
        connected: ['host-main', 'data-2'],
        position: { x: 2, y: 1, z: 0 },
        discovered: false,
        compromised: false
      },
      {
        id: 'data-1',
        name: 'Camera Controls',
        type: 'data',
        security: 4,
        encrypted: false,
        connected: ['node-1'],
        position: { x: -3, y: 2, z: 0 },
        discovered: false,
        compromised: false,
        data: { type: 'device_control', device: 'security_cameras' }
      },
      {
        id: 'data-2',
        name: 'Paydata Cache',
        type: 'data',
        security: 7,
        encrypted: true,
        connected: ['node-2'],
        position: { x: 3, y: 2, z: 0 },
        discovered: false,
        compromised: false,
        data: { type: 'paydata', value: 5000 }
      },
      {
        id: 'ice-1',
        name: 'Patrol IC',
        type: 'ice',
        security: 6,
        encrypted: false,
        connected: ['host-main'],
        position: { x: 0, y: -1, z: 0 },
        discovered: true,
        compromised: false
      }
    ];

    setNodes(newNodes);

    // Initialize ICE programs
    setIcePrograms([
      {
        id: 'ice-patrol-1',
        name: 'Patrol IC',
        type: 'patrol',
        rating: 6,
        status: 'active',
        position: { x: 0, y: -1, z: 0 }
      }
    ]);
  };

  // Setup 3D Matrix visualization
  const setupMatrixVisualization = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Animation loop for Matrix visualization
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Matrix rain effect
      ctx.fillStyle = '#00ff00';
      ctx.font = '10px monospace';
      
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const char = String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(char, x, y);
      }

      requestAnimationFrame(animate);
    };

    animate();
  };

  // Execute Matrix action
  const executeAction = (action: MatrixAction, target: MatrixNode) => {
    const roll = Math.floor(Math.random() * 6) + 1;
    const success = roll >= action.difficulty;

    let logMessage = `[${new Date().toLocaleTimeString()}] ${action.name} on ${target.name}: `;

    if (success) {
      logMessage += 'SUCCESS';
      
      switch (action.type) {
        case 'hack':
          setNodes(prev => prev.map(n => 
            n.id === target.id ? { ...n, compromised: true } : n
          ));
          // Discover connected nodes
          target.connected.forEach(connectedId => {
            setNodes(prev => prev.map(n => 
              n.id === connectedId ? { ...n, discovered: true } : n
            ));
          });
          break;
        
        case 'search':
          // Reveal hidden nodes
          setNodes(prev => prev.map(n => {
            if (n.connected.includes(target.id) || target.connected.includes(n.id)) {
              return { ...n, discovered: true };
            }
            return n;
          }));
          break;
        
        case 'download':
          if (target.data && target.compromised) {
            logMessage += ` - Downloaded ${target.data.type}`;
          }
          break;
        
        case 'crash':
          if (target.type === 'ice') {
            setIcePrograms(prev => prev.map(ice => 
              ice.position.x === target.position.x && ice.position.y === target.position.y
                ? { ...ice, status: 'crashed' }
                : ice
            ));
          }
          break;
      }
    } else {
      logMessage += 'FAILED';
      // Increase Overwatch
      setMatrixStats(prev => ({ 
        ...prev, 
        overwatch: Math.min(40, prev.overwatch + action.difficulty) 
      }));
    }

    setActionLog(prev => [logMessage, ...prev.slice(0, 9)]);
  };

  // Matrix perception check
  const performMatrixPerception = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    const hits = roll + matrixPerception;
    
    let discovered = 0;
    setNodes(prev => prev.map(n => {
      if (!n.discovered && hits > n.security) {
        discovered++;
        return { ...n, discovered: true };
      }
      return n;
    }));

    setActionLog(prev => [
      `[${new Date().toLocaleTimeString()}] Matrix Perception: ${hits} hits - Discovered ${discovered} nodes`,
      ...prev.slice(0, 9)
    ]);
  };

  // ICE movement and behavior
  useEffect(() => {
    const iceInterval = setInterval(() => {
      setIcePrograms(prev => prev.map(ice => {
        if (ice.status !== 'active') return ice;
        
        // Simple patrol movement
        return {
          ...ice,
          position: {
            x: ice.position.x + (Math.random() - 0.5) * 0.5,
            y: ice.position.y + (Math.random() - 0.5) * 0.5,
            z: ice.position.z
          }
        };
      }));
    }, 2000);

    return () => clearInterval(iceInterval);
  }, []);

  return (
    <div className="matrix-interface bg-black rounded-lg p-6 shadow-2xl relative overflow-hidden">
      {/* Matrix Rain Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-20"
        width={800}
        height={600}
      />
      
      <div className="relative z-10">
        <div className="header flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-green-400 font-mono glitch-text">
            MATRIX INTERFACE v2.0
          </h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setIsInVR(!isInVR)}
              className={`px-4 py-2 font-bold rounded transition-all ${
                isInVR 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white animate-pulse' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {isInVR ? 'HOT-SIM VR' : 'AR MODE'}
            </button>
            <button
              onClick={performMatrixPerception}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
            >
              MATRIX PERCEPTION
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Matrix Stats */}
          <div className="col-span-3 bg-gray-900 rounded-lg p-4 border border-green-500">
            <h3 className="text-lg font-bold text-green-400 mb-3">MATRIX ATTRIBUTES</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Attack:</span>
                <span className="text-green-400">{matrixStats.attack}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sleaze:</span>
                <span className="text-green-400">{matrixStats.sleaze}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data Processing:</span>
                <span className="text-green-400">{matrixStats.dataProcessing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Firewall:</span>
                <span className="text-green-400">{matrixStats.firewall}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Matrix Damage:</span>
                  <span className="text-red-400">{matrixStats.matrixDamage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Overwatch Score:</span>
                  <span className={`${matrixStats.overwatch > 30 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                    {matrixStats.overwatch}/40
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="col-span-6 bg-gray-900 rounded-lg p-4 border border-green-500">
            <h3 className="text-lg font-bold text-green-400 mb-3">MATRIX GRID</h3>
            <div className="matrix-grid-view h-96 bg-black rounded relative overflow-hidden">
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="border border-green-900 opacity-20" />
                ))}
              </div>
              
              {/* Matrix Nodes */}
              {nodes.filter(n => n.discovered).map(node => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute w-16 h-16 flex items-center justify-center cursor-pointer transition-all ${
                    node.compromised ? 'text-yellow-400' : 'text-green-400'
                  } ${selectedNode?.id === node.id ? 'ring-2 ring-green-400' : ''}`}
                  style={{
                    left: `${50 + node.position.x * 50}px`,
                    top: `${50 + node.position.y * 50}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {node.type === 'host' ? '🏢' : 
                       node.type === 'file' ? '📁' :
                       node.type === 'device' ? '🖥️' :
                       node.type === 'ice' ? '🛡️' :
                       node.type === 'data' ? '💾' : '❓'}
                    </div>
                    <div className="text-xs whitespace-nowrap">{node.name}</div>
                    {node.encrypted && <div className="text-xs">🔒</div>}
                  </div>
                </motion.div>
              ))}

              {/* ICE Programs */}
              {icePrograms.map(ice => (
                <motion.div
                  key={ice.id}
                  animate={{
                    left: `${50 + ice.position.x * 50}px`,
                    top: `${50 + ice.position.y * 50}px`
                  }}
                  transition={{ duration: 2 }}
                  className={`absolute w-12 h-12 flex items-center justify-center ${
                    ice.status === 'active' ? 'text-red-400' : 'text-gray-600'
                  }`}
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  <div className="text-center">
                    <div className="text-2xl animate-pulse">👁️</div>
                    <div className="text-xs">{ice.rating}</div>
                  </div>
                </motion.div>
              ))}

              {/* Connection lines */}
              <svg className="absolute inset-0 pointer-events-none">
                {nodes.filter(n => n.discovered).map(node => 
                  node.connected.map(targetId => {
                    const target = nodes.find(n => n.id === targetId && n.discovered);
                    if (!target) return null;
                    
                    return (
                      <line
                        key={`${node.id}-${targetId}`}
                        x1={50 + node.position.x * 50}
                        y1={50 + node.position.y * 50}
                        x2={50 + target.position.x * 50}
                        y2={50 + target.position.y * 50}
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                        opacity="0.3"
                      />
                    );
                  })
                )}
              </svg>
            </div>
          </div>

          {/* Actions & Log */}
          <div className="col-span-3 space-y-4">
            {/* Selected Node Actions */}
            {selectedNode && (
              <div className="bg-gray-900 rounded-lg p-4 border border-green-500">
                <h3 className="text-lg font-bold text-green-400 mb-3">
                  {selectedNode.name}
                </h3>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="text-gray-400">Type: {selectedNode.type}</div>
                  <div className="text-gray-400">Security: {selectedNode.security}/10</div>
                  <div className="text-gray-400">
                    Status: {selectedNode.compromised ? 
                      <span className="text-yellow-400">COMPROMISED</span> : 
                      <span className="text-green-400">SECURE</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  {actions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => executeAction(action, selectedNode)}
                      disabled={selectedNode.type === 'ice' && action.type !== 'crash'}
                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 
                               disabled:cursor-not-allowed text-black font-bold rounded text-sm transition-colors"
                    >
                      <span className="mr-2">{action.icon}</span>
                      {action.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Log */}
            <div className="bg-gray-900 rounded-lg p-4 border border-green-500">
              <h3 className="text-lg font-bold text-green-400 mb-3">SYSTEM LOG</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
                {actionLog.map((log, i) => (
                  <div key={i} className="text-green-400 opacity-${100 - i * 10}">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glitch-text {
          animation: glitch 2s infinite;
        }
        
        @keyframes glitch {
          0%, 100% { text-shadow: 0 0 2px #00ff00, 0 0 4px #00ff00; }
          50% { text-shadow: 2px 0 2px #ff0000, -2px 0 2px #0000ff; }
        }
      `}</style>
    </div>
  );
} 