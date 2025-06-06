import React, { useState } from 'react';

export interface CoreStrength {
  id: string;
  label: string;
  description: string;
  mechanicalEffect: string;
  gameplayBenefits?: string[];
  relatedSkills?: string[];
  relatedQualities?: string[];
  potency: 1 | 2 | 3; // 1 = minor, 2 = significant, 3 = major
}

interface CoreStrengthComponentProps {
  strength: CoreStrength;
  selected: boolean;
  onSelect: (strength: CoreStrength, selected: boolean) => void;
}

export const CoreStrengthComponent: React.FC<CoreStrengthComponentProps> = ({ 
  strength, 
  selected, 
  onSelect 
}) => {
  const [expanded, setExpanded] = useState(false);

  // Determine border color based on potency
  const getPotencyColor = (potency: number) => {
    switch (potency) {
      case 1: return 'border-blue-700';
      case 2: return 'border-purple-700';
      case 3: return 'border-cyan-700';
      default: return 'border-green-800';
    }
  };

  const getPotencyLabel = (potency: number) => {
    switch (potency) {
      case 1: return 'Minor';
      case 2: return 'Significant';
      case 3: return 'Major';
      default: return 'Unknown';
    }
  };

  const borderColor = getPotencyColor(strength.potency);
  const containerClass = `border ${borderColor} rounded-md p-4 mb-3 transition-all ${
    selected ? 'bg-gray-900' : 'bg-black'
  }`;

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`strength-${strength.id}`}
            checked={selected}
            onChange={(e) => onSelect(strength, e.target.checked)}
            className="mr-3 h-5 w-5 accent-cyan-700"
          />
          <div>
            <label 
              htmlFor={`strength-${strength.id}`}
              className="text-green-300 font-bold cursor-pointer"
            >
              {strength.label}
            </label>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
              strength.potency === 1 ? 'bg-blue-900 text-blue-300' :
              strength.potency === 2 ? 'bg-purple-900 text-purple-300' :
              'bg-cyan-900 text-cyan-300'
            }`}>
              {getPotencyLabel(strength.potency)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-green-500 text-sm hover:underline focus:outline-none"
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {expanded && (
        <div className="mt-3 ml-8 text-sm">
          <p className="text-green-400 mb-2">{strength.description}</p>
          
          <div className="mt-3 border-t border-green-900 pt-2">
            <h4 className="text-cyan-400 font-bold mb-1">Mechanical Effect:</h4>
            <p className="text-green-300">{strength.mechanicalEffect}</p>
          </div>
          
          {strength.gameplayBenefits && (
            <div className="mt-2">
              <h4 className="text-blue-400 font-bold mb-1">Benefits:</h4>
              <ul className="list-disc list-inside text-green-300">
                {strength.gameplayBenefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
          
          {strength.relatedSkills && strength.relatedSkills.length > 0 && (
            <div className="mt-2">
              <h4 className="text-green-400 font-bold mb-1">Related Skills:</h4>
              <div className="flex flex-wrap gap-1">
                {strength.relatedSkills.map((skill, index) => (
                  <span 
                    key={index}
                    className="bg-green-900 text-green-200 px-2 py-0.5 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
