import React, { useState, useEffect } from 'react';
import { Character } from '../CharacterCreation';

// Define SR6E attributes
interface Attribute {
  key: string;
  label: string;
  abbr: string;
  description: string;
  current: number;
  min: number;
  max: number;
  isSpecial?: boolean; // For Edge, Essence, Magic, Resonance
}

interface AttributesStepProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const AttributesStep: React.FC<AttributesStepProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  // If character has no attributes initialized, set defaults
  useEffect(() => {
    if (!character.attributes) {
      updateCharacter({
        attributes: {
          body: 1,
          agility: 1,
          reaction: 1,
          strength: 1,
          willpower: 1,
          logic: 1,
          intuition: 1,
          charisma: 1,
          edge: 1,
          essence: 6, // Default starting essence
          magic: 0,    // Only for magical characters
          resonance: 0 // Only for technomancers
        }
      });
    }
  }, []);

  // Local state to track attribute values and points
  const [attributes, setAttributes] = useState<{
    [key: string]: Attribute;
  }>({
    body: {
      key: 'body',
      label: 'Body',
      abbr: 'BOD',
      description: 'Physical health, fortitude, and resistance to damage.',
      current: character.attributes?.body || 1,
      min: 1,
      max: 6
    },
    agility: {
      key: 'agility',
      label: 'Agility',
      abbr: 'AGI',
      description: 'Hand-eye coordination, flexibility, and balance.',
      current: character.attributes?.agility || 1,
      min: 1,
      max: 6
    },
    reaction: {
      key: 'reaction',
      label: 'Reaction',
      abbr: 'REA',
      description: 'Reflexes, responsiveness, and initiative.',
      current: character.attributes?.reaction || 1,
      min: 1,
      max: 6
    },
    strength: {
      key: 'strength',
      label: 'Strength',
      abbr: 'STR',
      description: 'Physical power, lifting capacity, and melee damage.',
      current: character.attributes?.strength || 1,
      min: 1,
      max: 6
    },
    willpower: {
      key: 'willpower',
      label: 'Willpower',
      abbr: 'WIL',
      description: 'Mental fortitude, determination, and resistance to manipulation.',
      current: character.attributes?.willpower || 1,
      min: 1,
      max: 6
    },
    logic: {
      key: 'logic',
      label: 'Logic',
      abbr: 'LOG',
      description: 'Problem-solving, memory, and analytical thinking.',
      current: character.attributes?.logic || 1,
      min: 1,
      max: 6
    },
    intuition: {
      key: 'intuition',
      label: 'Intuition',
      abbr: 'INT',
      description: 'Instinct, gut feeling, and awareness of surroundings.',
      current: character.attributes?.intuition || 1,
      min: 1,
      max: 6
    },
    charisma: {
      key: 'charisma',
      label: 'Charisma',
      abbr: 'CHA',
      description: 'Social presence, persuasion, and leadership.',
      current: character.attributes?.charisma || 1,
      min: 1,
      max: 6
    },
    edge: {
      key: 'edge',
      label: 'Edge',
      abbr: 'EDG',
      description: 'Luck, heroic effort, and pushing beyond normal limits.',
      current: character.attributes?.edge || 1,
      min: 1,
      max: 7,
      isSpecial: true
    },
    essence: {
      key: 'essence',
      label: 'Essence',
      abbr: 'ESS',
      description: 'Physical and spiritual wholeness, depleted by cyberware and bioware.',
      current: character.attributes?.essence || 6,
      min: 0,
      max: 6,
      isSpecial: true
    },
    magic: {
      key: 'magic',
      label: 'Magic',
      abbr: 'MAG',
      description: 'Connection to magical energies, used for spellcasting and magical abilities.',
      current: character.attributes?.magic || 0,
      min: 0,
      max: 6,
      isSpecial: true
    },
    resonance: {
      key: 'resonance',
      label: 'Resonance',
      abbr: 'RES',
      description: 'Connection to the Matrix, used by technomancers.',
      current: character.attributes?.resonance || 0,
      min: 0,
      max: 6,
      isSpecial: true
    }
  });

  // Calculate attribute points based on build method
  const [availablePoints, setAvailablePoints] = useState(20); // Default for Priority system
  const [spentPoints, setSpentPoints] = useState(0);

  useEffect(() => {
    // Set initial points based on build method
    let initialPoints = 20; // Default
    
    if (character.build_method === 'priority') {
      initialPoints = 20; // Adjust based on priority chosen (simplified for now)
    } else if (character.build_method === 'karma') {
      initialPoints = 30; // Higher for karma build
    } else if (character.build_method === 'sum2ten') {
      initialPoints = 25; // Medium for sum-to-ten
    }
    
    setAvailablePoints(initialPoints);
    
    // Calculate initial spent points
    let spent = 0;
    Object.values(attributes).forEach(attr => {
      if (!attr.isSpecial) {
        spent += attr.current - attr.min;
      }
    });
    setSpentPoints(spent);
  }, [character.build_method]);

  // Handle attribute increment/decrement
  const incrementAttribute = (key: string) => {
    const attr = attributes[key];
    
    // Check if we can increment
    if (attr.current < attr.max && (!attr.isSpecial || key === 'edge') && 
        (spentPoints < availablePoints || attr.isSpecial)) {
      
      const updatedAttributes = {
        ...attributes,
        [key]: {
          ...attr,
          current: attr.current + 1
        }
      };
      
      setAttributes(updatedAttributes);
      
      if (!attr.isSpecial) {
        setSpentPoints(spentPoints + 1);
      }
      
      // Update character with the new attribute value
      updateCharacter({
        attributes: {
          ...character.attributes,
          [key]: attr.current + 1
        }
      });
    }
  };

  const decrementAttribute = (key: string) => {
    const attr = attributes[key];
    
    // Check if we can decrement
    if (attr.current > attr.min) {
      const updatedAttributes = {
        ...attributes,
        [key]: {
          ...attr,
          current: attr.current - 1
        }
      };
      
      setAttributes(updatedAttributes);
      
      if (!attr.isSpecial) {
        setSpentPoints(spentPoints - 1);
      }
      
      // Update character with the new attribute value
      updateCharacter({
        attributes: {
          ...character.attributes,
          [key]: attr.current - 1
        }
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final attribute validation could go here
    
    nextStep();
  };

  // Group attributes for display
  const physicalAttributes = ['body', 'agility', 'reaction', 'strength'];
  const mentalAttributes = ['willpower', 'logic', 'intuition', 'charisma'];
  const specialAttributes = ['edge', 'essence', 'magic', 'resonance'];

  return (
    <div className="text-green-300">
      <h2 className="text-xl text-green-400 mb-4">Attributes</h2>
      <p className="mb-6">
        Distribute attribute points according to your character&apos;s strengths and weaknesses.
        <br />
        Points Available: <span className="text-green-500 font-bold">{availablePoints - spentPoints}</span> / {availablePoints}
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Physical Attributes */}
          <div>
            <h3 className="text-green-400 border-b border-green-800 pb-1 mb-3">Physical Attributes</h3>
            {physicalAttributes.map(key => {
              const attr = attributes[key];
              return (
                <div key={key} className="mb-4 p-3 border border-green-900 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-green-300 font-bold">{attr.label}</span>
                      <span className="text-xs text-green-600 ml-2">({attr.abbr})</span>
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => decrementAttribute(key)}
                        disabled={attr.current <= attr.min}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          attr.current <= attr.min
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-900 text-green-400 hover:bg-gray-800'
                        }`}
                      >
                        −
                      </button>
                      <span className="mx-3 w-6 text-center">{attr.current}</span>
                      <button
                        type="button"
                        onClick={() => incrementAttribute(key)}
                        disabled={attr.current >= attr.max || spentPoints >= availablePoints}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          attr.current >= attr.max || spentPoints >= availablePoints
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-900 text-green-400 hover:bg-gray-800'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">{attr.description}</p>
                </div>
              );
            })}
          </div>
          
          {/* Mental Attributes */}
          <div>
            <h3 className="text-green-400 border-b border-green-800 pb-1 mb-3">Mental Attributes</h3>
            {mentalAttributes.map(key => {
              const attr = attributes[key];
              return (
                <div key={key} className="mb-4 p-3 border border-green-900 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-green-300 font-bold">{attr.label}</span>
                      <span className="text-xs text-green-600 ml-2">({attr.abbr})</span>
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => decrementAttribute(key)}
                        disabled={attr.current <= attr.min}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          attr.current <= attr.min
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-900 text-green-400 hover:bg-gray-800'
                        }`}
                      >
                        −
                      </button>
                      <span className="mx-3 w-6 text-center">{attr.current}</span>
                      <button
                        type="button"
                        onClick={() => incrementAttribute(key)}
                        disabled={attr.current >= attr.max || spentPoints >= availablePoints}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          attr.current >= attr.max || spentPoints >= availablePoints
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-900 text-green-400 hover:bg-gray-800'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">{attr.description}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Special Attributes */}
        <div className="mb-8">
          <h3 className="text-green-400 border-b border-green-800 pb-1 mb-3">Special Attributes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialAttributes.map(key => {
              const attr = attributes[key];
              // Skip magic and resonance if they're 0 (not applicable to character type)
              if ((key === 'magic' || key === 'resonance') && attr.current === 0) {
                return null;
              }
              
              return (
                <div key={key} className="p-3 border border-green-900 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-green-300 font-bold">{attr.label}</span>
                      <span className="text-xs text-green-600 ml-2">({attr.abbr})</span>
                    </div>
                    
                    {key === 'edge' ? (
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => decrementAttribute(key)}
                          disabled={attr.current <= attr.min}
                          className={`w-8 h-8 flex items-center justify-center rounded-md ${
                            attr.current <= attr.min
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-900 text-green-400 hover:bg-gray-800'
                          }`}
                        >
                          −
                        </button>
                        <span className="mx-3 w-6 text-center">{attr.current}</span>
                        <button
                          type="button"
                          onClick={() => incrementAttribute(key)}
                          disabled={attr.current >= attr.max}
                          className={`w-8 h-8 flex items-center justify-center rounded-md ${
                            attr.current >= attr.max
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-900 text-green-400 hover:bg-gray-800'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="text-lg font-mono font-bold text-green-400">{attr.current}</span>
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-2">{attr.description}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 bg-black text-green-400 border border-green-700 rounded hover:bg-gray-900"
          >
            Previous: Build Method
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-green-700 text-black rounded hover:bg-green-600"
          >
            Next: Skills
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttributesStep;