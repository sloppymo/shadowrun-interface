import React, { useState } from 'react';
import { Character } from '../CharacterCreation';

// Define the build method types for SR6E character creation
interface BuildMethod {
  id: string;
  name: string;
  description: string;
  benefitsDescription: string;
  drawbacksDescription: string;
  recommendedFor: string;
  priority?: boolean; // Whether this uses the priority system
  karma?: boolean; // Whether this uses the karma system
  sum2Ten?: boolean; // Whether this uses Sum-to-Ten system
  lifeModules?: boolean; // Whether this uses life modules
}

// Define the available build methods
const buildMethods: BuildMethod[] = [
  {
    id: 'priority',
    name: 'Priority System',
    description: 'The classic Shadowrun character creation method. Allocate priorities A through E to your character\'s metatype, attributes, skills, magic/resonance, and resources.',
    benefitsDescription: 'Structured and balanced approach that helps new players create viable characters.',
    drawbacksDescription: 'Less flexible than other methods. May lead to similar character builds.',
    recommendedFor: 'New players or those who prefer a structured approach.',
    priority: true
  },
  {
    id: 'karma',
    name: 'Karma Build',
    description: 'Build your character by spending a pool of Karma points on everything from metatype to skills and resources.',
    benefitsDescription: 'Extremely flexible, allowing for highly customized character builds.',
    drawbacksDescription: 'More complex and time-consuming. Easy to create unbalanced characters if you\'re not careful.',
    recommendedFor: 'Experienced players who want maximum flexibility.',
    karma: true
  },
  {
    id: 'sum2ten',
    name: 'Sum-to-Ten',
    description: 'Assign points totaling 10 across five categories (metatype, attributes, skills, magic/resonance, and resources).',
    benefitsDescription: 'More flexible than Priority while maintaining some structure. Good middle ground.',
    drawbacksDescription: 'Still has some constraints compared to Karma Build.',
    recommendedFor: 'Players familiar with Shadowrun who want more flexibility than Priority but less complexity than Karma.',
    sum2Ten: true
  },
  {
    id: 'life-modules',
    name: 'Life Modules',
    description: 'Build your character by selecting modules representing their life path, from birth to shadowrunning.',
    benefitsDescription: 'Creates characters with rich backgrounds that are mechanically relevant. Great for narrative focus.',
    drawbacksDescription: 'More complex system with numerous options to navigate.',
    recommendedFor: 'Players who prioritize character story and background integration.',
    lifeModules: true
  },
  {
    id: 'narrative',
    name: 'Narrative Build (Custom)',
    description: 'A custom approach that focuses on the character\'s story first, with mechanics being shaped to fit the narrative.',
    benefitsDescription: 'Complete creative freedom. Character concept drives the mechanics, not vice versa.',
    drawbacksDescription: 'Requires GM approval and oversight to ensure balance.',
    recommendedFor: 'Story-focused campaigns and players who prioritize concept over optimization.',
  }
];

interface BuildMethodStepProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const BuildMethodStep: React.FC<BuildMethodStepProps> = ({ 
  character, 
  updateCharacter, 
  nextStep, 
  prevStep 
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>(character.build_method || '');
  const [showBuildInfo, setShowBuildInfo] = useState<boolean>(false);
  
  // Handle build method selection
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    updateCharacter({ build_method: methodId });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod) {
      nextStep();
    }
  };

  return (
    <div className="text-green-300">
      <h2 className="text-xl text-green-400 mb-4">Build Method</h2>
      <p className="mb-6">
        Select how you want to build your character. This will determine the mechanics used 
        throughout the rest of character creation.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 mb-6">
          {buildMethods.map((method) => (
            <div 
              key={method.id}
              className={`p-4 border rounded-md cursor-pointer transition-all ${
                selectedMethod === method.id 
                  ? 'border-green-400 bg-gray-900' 
                  : 'border-green-900 hover:border-green-700'
              }`}
              onClick={() => handleMethodSelect(method.id)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  id={`method-${method.id}`}
                  name="buildMethod"
                  checked={selectedMethod === method.id}
                  onChange={() => handleMethodSelect(method.id)}
                  className="mr-3 h-4 w-4 accent-green-500"
                />
                <label htmlFor={`method-${method.id}`} className="text-green-300 font-bold cursor-pointer">
                  {method.name}
                </label>
              </div>
              
              <p className="mt-2 ml-7 text-sm text-green-400">
                {method.description}
              </p>
              
              {selectedMethod === method.id && (
                <div className="mt-3 ml-7 text-sm border-t border-green-900 pt-2">
                  <div className="mb-2">
                    <span className="text-green-300 font-bold">Benefits: </span>
                    <span className="text-green-400">{method.benefitsDescription}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-green-300 font-bold">Drawbacks: </span>
                    <span className="text-green-400">{method.drawbacksDescription}</span>
                  </div>
                  <div>
                    <span className="text-green-300 font-bold">Recommended for: </span>
                    <span className="text-green-400">{method.recommendedFor}</span>
                  </div>
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
            Previous: Identity
          </button>
          
          <button
            type="submit"
            disabled={!selectedMethod}
            className={`px-4 py-2 rounded ${
              selectedMethod 
                ? 'bg-green-700 text-black hover:bg-green-600' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next: Attributes
          </button>
        </div>
      </form>
      
      {selectedMethod && (
        <div className="mt-8 p-4 border border-green-800 rounded-md">
          <div className="flex justify-between items-center">
            <h3 className="text-green-400">Build Method Details</h3>
            <button 
              onClick={() => setShowBuildInfo(!showBuildInfo)} 
              className="text-sm text-green-500 hover:text-green-400"
            >
              {showBuildInfo ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showBuildInfo && (
            <div className="mt-4 text-sm">
              {selectedMethod === 'priority' && (
                <div>
                  <p className="mb-2">The Priority System assigns priorities (A through E) to five categories:</p>
                  <ul className="list-disc list-inside mb-2">
                    <li>Metatype</li>
                    <li>Attributes</li>
                    <li>Magic/Resonance</li>
                    <li>Skills</li>
                    <li>Resources</li>
                  </ul>
                  <p>Each priority level gives different benefits for each category. You can only use each priority level once.</p>
                </div>
              )}
              
              {selectedMethod === 'karma' && (
                <div>
                  <p className="mb-2">With the Karma Build system, you start with a pool of 800 Karma and spend it on everything:</p>
                  <ul className="list-disc list-inside mb-2">
                    <li>Metatype costs vary by race</li>
                    <li>Attributes cost Karma × 5</li>
                    <li>Skills cost Karma × 2</li>
                    <li>Resources cost 2,000¥ per Karma</li>
                    <li>Magic/Resonance have various costs</li>
                  </ul>
                </div>
              )}

              {selectedMethod === 'sum2ten' && (
                <div>
                  <p className="mb-2">The Sum-to-Ten system uses the Priority table, but instead of using each priority once:</p>
                  <ul className="list-disc list-inside mb-2">
                    <li>You have 10 points to distribute</li>
                    <li>A = 4 points, B = 3 points, C = 2 points, D = 1 point, E = 0 points</li>
                    <li>You can use the same priority multiple times</li>
                    <li>Total must equal exactly 10 points</li>
                  </ul>
                </div>
              )}
              
              {selectedMethod === 'life-modules' && (
                <div>
                  <p className="mb-2">The Life Modules system builds your character through life stages:</p>
                  <ul className="list-disc list-inside mb-2">
                    <li>Nationality (where you were born)</li>
                    <li>Formative Years (childhood/teen years)</li>
                    <li>Teen Years (education/early experiences)</li>
                    <li>Higher Education or Real Life</li>
                    <li>Career</li>
                    <li>Shadowrunner Path</li>
                  </ul>
                  <p>Each module provides specific skills, attributes, qualities, knowledge, and resources.</p>
                </div>
              )}
              
              {selectedMethod === 'narrative' && (
                <div>
                  <p>The Narrative Build approach is flexible and custom:</p>
                  <ul className="list-disc list-inside mb-2">
                    <li>Start with your character concept and background</li>
                    <li>Choose appropriate attributes, skills, gear based on the concept</li>
                    <li>Work with your GM to ensure balance</li>
                    <li>Apply Core Traumas and Strengths that match the character's story</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuildMethodStep;
