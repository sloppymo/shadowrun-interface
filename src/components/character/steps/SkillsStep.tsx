import React, { useState, useEffect } from 'react';
import { Character, StepProps } from '../CharacterCreation';

// Define skill structure
interface Skill {
  key: string;
  name: string;
  description: string;
  category: string;
  attribute: string;
  isSpecialized: boolean;
  specializations?: string[];
  rating: number;
}

// Skill category type
type SkillCategory = 'combat' | 'physical' | 'social' | 'technical' | 'vehicle' | 'knowledge';

interface SkillsStepProps extends StepProps {}

const SkillsStep: React.FC<SkillsStepProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  // Get attributes for reference
  const attributes = character.attributes || {};
  
  // Set up initial state for skills points
  const [availablePoints, setAvailablePoints] = useState(30); // Default for priority
  const [spentPoints, setSpentPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('combat');

  // Initialize skills if they don&apos;t exist
  useEffect(() => {
    if (!character.skills || Object.keys(character.skills).length === 0) {
      // Initialize with all SR6E skills at rating 0
      const initialSkills = generateInitialSkills();
      updateCharacter({
        skills: initialSkills
      });
    } else {
      // Calculate already spent points
      calculateSpentPoints(character.skills);
    }
    
    // Set available points based on build method
    if (character.build_method === 'priority') {
      setAvailablePoints(30);
    } else if (character.build_method === 'karma') {
      setAvailablePoints(40);
    } else if (character.build_method === 'sum2ten') {
      setAvailablePoints(35);
    }
  }, []);

  // Calculate spent points
  const calculateSpentPoints = (skills: Record<string, Skill>) => {
    let spent = 0;
    Object.values(skills).forEach(skill => {
      spent += skill.rating;
    });
    setSpentPoints(spent);
  };
  
  // Generate all SR6E skills with initial values
  const generateInitialSkills = (): Record<string, Skill> => {
    return {
      // Combat skills
      close_combat: {
        key: 'close_combat',
        name: 'Close Combat',
        description: 'Using melee weapons in physical combat',
        category: 'combat',
        attribute: 'agility',
        isSpecialized: true,
        specializations: ['blades', 'clubs', 'unarmed'],
        rating: 0
      },
      firearms: {
        key: 'firearms',
        name: 'Firearms',
        description: 'Using ranged projectile weapons',
        category: 'combat',
        attribute: 'agility',
        isSpecialized: true,
        specializations: ['automatics', 'longarms', 'pistols', 'shotguns', 'sniper rifles'],
        rating: 0
      },
      
      // Physical skills
      athletics: {
        key: 'athletics',
        name: 'Athletics',
        description: 'Physical activities like running, jumping, swimming',
        category: 'physical',
        attribute: 'strength',
        isSpecialized: true,
        specializations: ['gymnastics', 'running', 'swimming'],
        rating: 0
      },
      stealth: {
        key: 'stealth',
        name: 'Stealth',
        description: 'Moving quietly and remaining hidden',
        category: 'physical',
        attribute: 'agility',
        isSpecialized: true,
        specializations: ['disguise', 'hiding', 'sneaking'],
        rating: 0
      },
      
      // Social skills
      con: {
        key: 'con',
        name: 'Con',
        description: 'Tricking or manipulating others',
        category: 'social',
        attribute: 'charisma',
        isSpecialized: true,
        specializations: ['fast talk', 'impersonation', 'seduction'],
        rating: 0
      },
      influence: {
        key: 'influence',
        name: 'Influence',
        description: 'Persuading others through social means',
        category: 'social',
        attribute: 'charisma',
        isSpecialized: true,
        specializations: ['etiquette', 'leadership', 'negotiation'],
        rating: 0
      },
      
      // Technical skills
      electronics: {
        key: 'electronics',
        name: 'Electronics',
        description: 'Using and manipulating electronic devices',
        category: 'technical',
        attribute: 'logic',
        isSpecialized: true,
        specializations: ['computer', 'hardware', 'software'],
        rating: 0
      },
      engineering: {
        key: 'engineering',
        name: 'Engineering',
        description: 'Building, modifying, and repairing',
        category: 'technical',
        attribute: 'logic',
        isSpecialized: true,
        specializations: ['automotive', 'industrial', 'structural'],
        rating: 0
      },
      
      // Vehicle skills
      pilot_ground: {
        key: 'pilot_ground',
        name: 'Pilot Ground Craft',
        description: 'Operating ground vehicles',
        category: 'vehicle',
        attribute: 'reaction',
        isSpecialized: true,
        specializations: ['bike', 'car', 'truck'],
        rating: 0
      },
      pilot_aircraft: {
        key: 'pilot_aircraft',
        name: 'Pilot Aircraft',
        description: 'Operating aircraft',
        category: 'vehicle',
        attribute: 'reaction',
        isSpecialized: true,
        specializations: ['fixed wing', 'lighter than air', 'rotary wing'],
        rating: 0
      },
      
      // Knowledge skills (simplified set)
      street_knowledge: {
        key: 'street_knowledge',
        name: 'Street Knowledge',
        description: 'Knowledge of gangs, crime, and street life',
        category: 'knowledge',
        attribute: 'intuition',
        isSpecialized: false,
        rating: 0
      },
      academic_knowledge: {
        key: 'academic_knowledge',
        name: 'Academic Knowledge',
        description: 'Formal education and scholarly topics',
        category: 'knowledge',
        attribute: 'logic',
        isSpecialized: false,
        rating: 0
      },
      professional_knowledge: {
        key: 'professional_knowledge',
        name: 'Professional Knowledge',
        description: 'Job-related skills and industry knowledge',
        category: 'knowledge',
        attribute: 'logic',
        isSpecialized: false,
        rating: 0
      }
    };
  };

  // Handle skill rating increment
  const incrementSkill = (key: string) => {
    const skills = { ...character.skills };
    const skill = skills[key];
    
    if (skill.rating < 6 && spentPoints < availablePoints) {
      skill.rating += 1;
      
      updateCharacter({
        skills: { ...skills }
      });
      
      setSpentPoints(spentPoints + 1);
    }
  };
  
  // Handle skill rating decrement
  const decrementSkill = (key: string) => {
    const skills = { ...character.skills };
    const skill = skills[key];
    
    if (skill.rating > 0) {
      skill.rating -= 1;
      
      updateCharacter({
        skills: { ...skills }
      });
      
      setSpentPoints(spentPoints - 1);
    }
  };
  
  // Filter skills by category
  const getSkillsByCategory = (category: SkillCategory): Skill[] => {
    if (!character.skills) return [];
    
    return Object.values(character.skills)
      .filter((skill): skill is Skill => 
        typeof skill === 'object' && 
        skill !== null && 
        'category' in skill && 
        skill.category === category
      );
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };
  
  // Get associated attribute rating for a skill
  const getAttributeRating = (attributeKey: string) => {
    return attributes[attributeKey] || 1;
  };
  
  // Get the total dice pool for a skill (attribute + skill)
  const getDicePool = (skill: Skill) => {
    return getAttributeRating(skill.attribute) + skill.rating;
  };

  return (
    <div className="text-green-300">
      <h2 className="text-xl text-green-400 mb-4">Skills</h2>
      <p className="mb-6">
        Distribute skill points to define your character's abilities.
        <br />
        Points Available: <span className="text-green-500 font-bold">{availablePoints - spentPoints}</span> / {availablePoints}
      </p>
      
      <form onSubmit={handleSubmit}>
        {/* Skill Category Tabs */}
        <div className="flex border-b border-green-800 mb-6">
          {['combat', 'physical', 'social', 'technical', 'vehicle', 'knowledge'].map((category) => (
            <button
              key={category}
              type="button"
              className={`py-2 px-4 mr-2 ${
                selectedCategory === category
                  ? 'bg-green-900 text-green-300 border-t border-l border-r border-green-800'
                  : 'text-green-600 hover:text-green-400'
              }`}
              onClick={() => setSelectedCategory(category as SkillCategory)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Skills List for Selected Category */}
        <div className="mb-8">
          {getSkillsByCategory(selectedCategory).map(skill => (
            <div key={skill.key} className="mb-4 p-3 border border-green-900 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-green-300 font-bold">{skill.name}</span>
                  <span className="text-xs text-green-600 ml-2">({skill.attribute.toUpperCase()})</span>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => decrementSkill(skill.key)}
                    disabled={skill.rating <= 0}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      skill.rating <= 0
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-900 text-green-400 hover:bg-gray-800'
                    }`}
                  >
                    −
                  </button>
                  <span className="mx-3 w-6 text-center">{skill.rating}</span>
                  <button
                    type="button"
                    onClick={() => incrementSkill(skill.key)}
                    disabled={skill.rating >= 6 || spentPoints >= availablePoints}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      skill.rating >= 6 || spentPoints >= availablePoints
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-900 text-green-400 hover:bg-gray-800'
                    }`}
                  >
                    +
                  </button>
                  <span className="ml-3 text-sm text-green-500">
                    Pool: {getDicePool(skill)}d6
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-green-600 mt-2">{skill.description}</p>
              
              {/* Specializations */}
              {skill.isSpecialized && skill.specializations && skill.specializations.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-green-500">Specializations: </span>
                  <span className="text-xs text-green-600">{skill.specializations.join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 bg-black text-green-400 border border-green-700 rounded hover:bg-gray-900"
          >
            Previous: Attributes
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-green-700 text-black rounded hover:bg-green-600"
          >
            Next: Qualities
          </button>
        </div>
      </form>
    </div>
  );
};

export default SkillsStep;
