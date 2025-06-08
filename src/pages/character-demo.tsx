import React, { useState } from 'react';
import { CoreTraumaComponent, CoreTrauma } from '../components/character/CoreTraumaComponent';
import { CoreStrengthComponent, CoreStrength } from '../components/character/CoreStrengthComponent';

// Sample traumas with SR6E mechanical effects
const sampleTraumas: CoreTrauma[] = [
  {
    id: 'trauma-1',
    label: 'Flashbacks',
    description: 'You experience vivid, intrusive memories of past trauma, sometimes triggered by sensory inputs similar to the original event.',
    mechanicalEffect: '-2 dice pool on all Perception tests when triggered. Must make a Willpower (3) test to act normally when triggered.',
    gameplayTriggers: ['Combat situations', 'Loud noises', 'Specific smells or sounds'],
    relatedSkills: ['Perception', 'Composure'],
    severity: 2
  },
  {
    id: 'trauma-2',
    label: 'Trust Issues',
    description: 'You find it difficult to trust others, always suspecting ulterior motives.',
    mechanicalEffect: '+1 dice on Opposed Social Tests to detect lies, but -1 dice on Teamwork Tests and cannot benefit from the First Impression quality.',
    relatedSkills: ['Con', 'Etiquette', 'Negotiation'],
    severity: 1
  },
  {
    id: 'trauma-3',
    label: 'Substance Dependence',
    description: 'You rely on chemical substances to cope with the pressures of the shadows.',
    mechanicalEffect: 'Functions as the Addiction negative quality (Rating 3). When in withdrawal: -2 dice pool modifier to all actions.',
    gameplayTriggers: ['Stress', 'After runs', 'Before high-stakes situations'],
    relatedQualities: ['Addiction', 'High Pain Tolerance'],
    severity: 3
  },
  {
    id: 'trauma-4',
    label: 'Chronic Pain',
    description: 'You suffer from persistent physical pain that flares up unpredictably.',
    mechanicalEffect: 'Once per session when GM triggers: -1 dice pool to Physical actions for 1d6 hours. Can be temporarily relieved with painkillers.',
    relatedSkills: ['Body', 'Willpower'],
    severity: 2
  }
];

// Sample strengths with SR6E mechanical effects
const sampleStrengths: CoreStrength[] = [
  {
    id: 'strength-1',
    label: 'Hyperawareness',
    description: 'Your constant vigilance and heightened awareness of your surroundings have become a survival trait.',
    mechanicalEffect: '+1 dice on Surprise Tests and Initiative rolls. Once per run, can reroll a failed Perception test.',
    gameplayBenefits: ['Better reaction to ambushes', 'Notice details others miss'],
    relatedSkills: ['Perception', 'Sneaking', 'Tracking'],
    potency: 2
  },
  {
    id: 'strength-2',
    label: 'Empathic Connection',
    description: 'You have an uncanny ability to understand and connect with others on an emotional level.',
    mechanicalEffect: '+2 dice on Social Tests when attempting to comfort, understand, or bond with others. +1 dice when recruiting contacts.',
    gameplayBenefits: ['Build rapport quickly', 'Better results from Contacts'],
    relatedSkills: ['Con', 'Negotiation', 'Leadership'],
    potency: 1
  },
  {
    id: 'strength-3',
    label: 'Adrenaline Surge',
    description: 'In moments of extreme stress, you can call upon hidden reserves of strength and focus.',
    mechanicalEffect: 'Once per combat, gain +3 dice to any single Physical test as a Free Action. After use, suffer -1 dice for 10 minutes due to crash.',
    gameplayBenefits: ['Clutch performance in combat', 'Strength beyond normal limits'],
    relatedSkills: ['Athletics', 'Combat skills'],
    potency: 3
  },
  {
    id: 'strength-4',
    label: 'Adaptive Problem Solver',
    description: 'You have developed an uncanny ability to improvise solutions in chaotic situations.',
    mechanicalEffect: '+2 dice on any Skill Test involving jury-rigging, improvisation, or using tools/equipment in unintended ways.',
    gameplayBenefits: ['Creative solutions to obstacles', 'Better gear improvisation'],
    relatedSkills: ['Engineering', 'Hardware', 'Software'],
    potency: 2
  }
];

export default function CharacterDemo() {
  const [selectedTraumas, setSelectedTraumas] = useState<string[]>([]);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  
  const toggleTrauma = (trauma: CoreTrauma, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTraumas([...selectedTraumas, trauma.id]);
    } else {
      setSelectedTraumas(selectedTraumas.filter(id => id !== trauma.id));
    }
  };
  
  const toggleStrength = (strength: CoreStrength, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStrengths([...selectedStrengths, strength.id]);
    } else {
      setSelectedStrengths(selectedStrengths.filter(id => id !== strength.id));
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-200 font-mono p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl text-green-500 font-extrabold mb-6">Shadowrun Character Creation</h1>
        <p className="text-green-300 mb-8">Demo of Core Traumas and Core Strengths components with SR6E mechanical effects.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl text-red-400 mb-4 border-b border-red-900 pb-2">Core Traumas</h2>
            <p className="text-green-400 mb-4">Select 1-2 Core Traumas that define your character&apos;s struggles. These will have both narrative and mechanical effects in-game.</p>
            
            {sampleTraumas.map(trauma => (
              <CoreTraumaComponent
                key={trauma.id}
                trauma={trauma}
                selected={selectedTraumas.includes(trauma.id)}
                onSelect={toggleTrauma}
              />
            ))}

            <div className="mt-4 p-3 bg-black border border-red-900 rounded-md">
              <h3 className="text-red-400 text-sm font-bold">Trauma Limits</h3>
              <p className="text-xs text-green-400 mt-1">
                Characters may have up to 2 Core Traumas. Having more than 1 severe trauma requires GM approval.
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl text-cyan-400 mb-4 border-b border-cyan-900 pb-2">Core Strengths</h2>
            <p className="text-green-400 mb-4">Select 1-2 Core Strengths that highlight your character&apos;s unique capabilities. These provide mechanical advantages in specific situations.</p>
            
            {sampleStrengths.map(strength => (
              <CoreStrengthComponent
                key={strength.id}
                strength={strength}
                selected={selectedStrengths.includes(strength.id)}
                onSelect={toggleStrength}
              />
            ))}

            <div className="mt-4 p-3 bg-black border border-cyan-900 rounded-md">
              <h3 className="text-cyan-400 text-sm font-bold">Strength Limits</h3>
              <p className="text-xs text-green-400 mt-1">
                Characters may have up to 2 Core Strengths. A Major strength counts as 2 for this limit.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-900 rounded-md">
          <h2 className="text-green-400 font-bold mb-2">Selected Traumas & Strengths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-red-400 text-sm mb-1">Selected Traumas:</h3>
              {selectedTraumas.length === 0 ? (
                <p className="text-gray-500 text-xs">No traumas selected</p>
              ) : (
                <ul className="list-disc list-inside text-green-300 text-sm">
                  {selectedTraumas.map(id => {
                    const trauma = sampleTraumas.find(t => t.id === id);
                    return trauma ? <li key={id}>{trauma.label}</li> : null;
                  })}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-cyan-400 text-sm mb-1">Selected Strengths:</h3>
              {selectedStrengths.length === 0 ? (
                <p className="text-gray-500 text-xs">No strengths selected</p>
              ) : (
                <ul className="list-disc list-inside text-green-300 text-sm">
                  {selectedStrengths.map(id => {
                    const strength = sampleStrengths.find(s => s.id === id);
                    return strength ? <li key={id}>{strength.label}</li> : null;
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-green-600 text-black rounded hover:bg-green-500 font-bold">
            Save Character
          </button>
        </div>
        
        <footer className="mt-12 text-xs text-green-700 text-center select-none">
          &copy; 2025 Forest Within Therapeutic Services Professional Corporation
        </footer>
      </div>
    </div>
  );
}
