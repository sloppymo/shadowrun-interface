import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, Text, OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

// Shadowrun dice types
type DiceType = 'd6' | 'd10' | 'd12' | 'd20';
type RollResult = {
  dice: number[];
  hits: number;
  glitches: number;
  criticalGlitch: boolean;
  total: number;
  timestamp: Date;
  type: string;
};

// Custom dice component with physics
function Die({ position, onRollComplete }: { position: [number, number, number], onRollComplete: (value: number) => void }) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    args: [1, 1, 1],
    material: {
      friction: 0.4,
      restitution: 0.3,
    },
  }));

  const [settled, setSettled] = useState(false);
  const velocityRef = useRef<[number, number, number]>([0, 0, 0]);
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    // Apply initial force for rolling
    api.velocity.set(
      (Math.random() - 0.5) * 10,
      Math.random() * 15 + 10,
      (Math.random() - 0.5) * 10
    );
    api.angularVelocity.set(
      Math.random() * 20,
      Math.random() * 20,
      Math.random() * 20
    );

    // Subscribe to velocity changes
    const unsubscribeVel = api.velocity.subscribe((v) => {
      velocityRef.current = v;
    });

    const unsubscribeRot = api.rotation.subscribe((r) => {
      rotationRef.current = r;
    });

    // Check if die has settled
    const checkInterval = setInterval(() => {
      const speed = Math.sqrt(
        velocityRef.current[0] ** 2 +
        velocityRef.current[1] ** 2 +
        velocityRef.current[2] ** 2
      );

      if (speed < 0.1 && !settled) {
        setSettled(true);
        // Calculate which face is up based on rotation
        const value = calculateDiceValue(rotationRef.current);
        onRollComplete(value);
      }
    }, 100);

    return () => {
      unsubscribeVel();
      unsubscribeRot();
      clearInterval(checkInterval);
    };
  }, [api, settled, onRollComplete]);

  const calculateDiceValue = (rotation: [number, number, number]): number => {
    // Simplified calculation - in real implementation, would use proper face detection
    const normalized = rotation.map(r => ((r % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
    const faceUp = Math.floor((normalized[0] + normalized[1] + normalized[2]) * 6 / (2 * Math.PI)) % 6 + 1;
    return faceUp;
  };

  return (
    <Box ref={ref} args={[1, 1, 1]} castShadow receiveShadow>
      <meshStandardMaterial 
        color={settled ? '#00ff00' : '#ff0000'} 
        metalness={0.3}
        roughness={0.4}
      />
      {/* Dice face numbers */}
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <Text
          key={num}
          position={getDiceFacePosition(num)}
          rotation={getDiceFaceRotation(num)}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {num}
        </Text>
      ))}
    </Box>
  );
}

// Helper functions for dice face positioning
function getDiceFacePosition(face: number): [number, number, number] {
  switch (face) {
    case 1: return [0, 0, 0.51];
    case 2: return [0.51, 0, 0];
    case 3: return [0, 0.51, 0];
    case 4: return [0, -0.51, 0];
    case 5: return [-0.51, 0, 0];
    case 6: return [0, 0, -0.51];
    default: return [0, 0, 0];
  }
}

function getDiceFaceRotation(face: number): [number, number, number] {
  switch (face) {
    case 1: return [0, 0, 0];
    case 2: return [0, Math.PI / 2, 0];
    case 3: return [-Math.PI / 2, 0, 0];
    case 4: return [Math.PI / 2, 0, 0];
    case 5: return [0, -Math.PI / 2, 0];
    case 6: return [0, Math.PI, 0];
    default: return [0, 0, 0];
  }
}

// Table/ground plane
function Table() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -3, 0],
    args: [20, 20],
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  );
}

// Main 3D Dice Roller Component
export function DiceRoller3D() {
  const [diceCount, setDiceCount] = useState(5);
  const [isRolling, setIsRolling] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);
  const [showEdge, setShowEdge] = useState(false);
  const [threshold, setThreshold] = useState(5);

  const handleRoll = () => {
    setIsRolling(true);
    setResults([]);
  };

  const handleDieComplete = (value: number) => {
    setResults(prev => {
      const newResults = [...prev, value];
      
      // Check if all dice have settled
      if (newResults.length === diceCount) {
        // Calculate Shadowrun results
        const hits = newResults.filter(d => d >= threshold).length;
        const ones = newResults.filter(d => d === 1).length;
        const glitches = ones;
        const criticalGlitch = ones > Math.floor(diceCount / 2);
        
        const result: RollResult = {
          dice: newResults,
          hits,
          glitches,
          criticalGlitch,
          total: newResults.reduce((a, b) => a + b, 0),
          timestamp: new Date(),
          type: showEdge ? 'Edge Roll' : 'Standard Roll'
        };
        
        setRollHistory(prev => [result, ...prev.slice(0, 9)]);
        setIsRolling(false);
        
        // Play sound effect
        playDiceSound();
      }
      
      return newResults;
    });
  };

  const playDiceSound = () => {
    const audio = new Audio('/sounds/dice-roll.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  return (
    <div className="dice-roller-3d bg-gray-900 rounded-lg p-4 shadow-2xl">
      <h2 className="text-2xl font-bold text-green-400 mb-4 font-mono">
        3D DICE ROLLER
      </h2>
      
      {/* Controls */}
      <div className="controls mb-4 space-y-2">
        <div className="flex gap-4 items-center">
          <label className="text-green-400">
            Dice Pool:
            <input
              type="number"
              min="1"
              max="20"
              value={diceCount}
              onChange={(e) => setDiceCount(parseInt(e.target.value) || 1)}
              className="ml-2 w-16 bg-gray-800 text-green-400 border border-green-600 rounded px-2 py-1"
            />
          </label>
          
          <label className="text-green-400">
            Threshold:
            <input
              type="number"
              min="2"
              max="6"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 5)}
              className="ml-2 w-16 bg-gray-800 text-green-400 border border-green-600 rounded px-2 py-1"
            />
          </label>
          
          <label className="text-green-400 flex items-center">
            <input
              type="checkbox"
              checked={showEdge}
              onChange={(e) => setShowEdge(e.target.checked)}
              className="mr-2"
            />
            Edge Roll
          </label>
        </div>
        
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className={`px-6 py-2 rounded font-bold transition-all ${
            isRolling
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-black'
          }`}
        >
          {isRolling ? 'Rolling...' : 'ROLL DICE'}
        </button>
      </div>
      
      {/* 3D Scene */}
      <div className="canvas-container h-96 bg-black rounded-lg overflow-hidden mb-4">
        <Canvas shadows camera={{ position: [0, 8, 12], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <spotLight
              position={[10, 20, 10]}
              angle={0.3}
              penumbra={1}
              intensity={1}
              castShadow
              shadow-mapSize={[512, 512]}
            />
            <Physics gravity={[0, -30, 0]}>
              <Table />
              {isRolling && Array.from({ length: diceCount }).map((_, i) => (
                <Die
                  key={`${i}-${Date.now()}`}
                  position={[
                    (i % 4 - 1.5) * 2,
                    5 + Math.floor(i / 4) * 2,
                    (Math.random() - 0.5) * 2
                  ]}
                  onRollComplete={handleDieComplete}
                />
              ))}
            </Physics>
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={5}
              maxDistance={20}
            />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Results Display */}
      {results.length > 0 && !isRolling && (
        <div className="results bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="text-xl font-bold text-green-400 mb-2">RESULTS:</h3>
          <div className="flex gap-2 mb-2">
            {results.map((die, i) => (
              <div
                key={i}
                className={`w-12 h-12 flex items-center justify-center rounded border-2 ${
                  die >= threshold
                    ? 'bg-green-900 border-green-400 text-green-400'
                    : die === 1
                    ? 'bg-red-900 border-red-400 text-red-400'
                    : 'bg-gray-700 border-gray-500 text-gray-300'
                }`}
              >
                {die}
              </div>
            ))}
          </div>
          <div className="text-green-400">
            <p>Hits: {rollHistory[0]?.hits || 0}</p>
            <p>Glitches: {rollHistory[0]?.glitches || 0}</p>
            {rollHistory[0]?.criticalGlitch && (
              <p className="text-red-400 font-bold animate-pulse">CRITICAL GLITCH!</p>
            )}
          </div>
        </div>
      )}
      
      {/* Roll History */}
      <div className="history bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold text-green-400 mb-2">ROLL HISTORY:</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {rollHistory.map((roll, i) => (
            <div key={i} className="text-sm text-gray-400 font-mono">
              {roll.timestamp.toLocaleTimeString()} - {roll.type} - 
              Dice: [{roll.dice.join(', ')}] - 
              Hits: {roll.hits}
              {roll.criticalGlitch && ' - CRITICAL GLITCH!'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 