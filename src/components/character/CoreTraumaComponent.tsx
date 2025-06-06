import React, { useState } from 'react';

export interface CoreTrauma {
  id: string;
  label: string;
  description: string;
  mechanicalEffect: string;
  gameplayTriggers?: string[];
  relatedSkills?: string[];
  relatedQualities?: string[];
  severity: 1 | 2 | 3; // 1 = mild, 2 = moderate, 3 = severe
}

interface CoreTraumaComponentProps {
  trauma: CoreTrauma;
  selected: boolean;
  onSelect: (trauma: CoreTrauma, selected: boolean) => void;
}

export const CoreTraumaComponent: React.FC<CoreTraumaComponentProps> = ({ 
  trauma, 
  selected, 
  onSelect 
}) => {
  const [expanded, setExpanded] = useState(false);

  // Determine border color based on severity
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return 'border-yellow-700';
      case 2: return 'border-orange-700';
      case 3: return 'border-red-700';
      default: return 'border-green-800';
    }
  };

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 1: return 'Mild';
      case 2: return 'Moderate';
      case 3: return 'Severe';
      default: return 'Unknown';
    }
  };

  const borderColor = getSeverityColor(trauma.severity);
  const containerClass = `border ${borderColor} rounded-md p-4 mb-3 transition-all ${
    selected ? 'bg-gray-900' : 'bg-black'
  }`;

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`trauma-${trauma.id}`}
            checked={selected}
            onChange={(e) => onSelect(trauma, e.target.checked)}
            className="mr-3 h-5 w-5 accent-red-700"
          />
          <div>
            <label 
              htmlFor={`trauma-${trauma.id}`}
              className="text-green-300 font-bold cursor-pointer"
            >
              {trauma.label}
            </label>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
              trauma.severity === 1 ? 'bg-yellow-900 text-yellow-300' :
              trauma.severity === 2 ? 'bg-orange-900 text-orange-300' :
              'bg-red-900 text-red-300'
            }`}>
              {getSeverityLabel(trauma.severity)}
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
          <p className="text-green-400 mb-2">{trauma.description}</p>
          
          <div className="mt-3 border-t border-green-900 pt-2">
            <h4 className="text-red-400 font-bold mb-1">Mechanical Effect:</h4>
            <p className="text-green-300">{trauma.mechanicalEffect}</p>
          </div>
          
          {trauma.gameplayTriggers && (
            <div className="mt-2">
              <h4 className="text-yellow-400 font-bold mb-1">Triggers:</h4>
              <ul className="list-disc list-inside text-green-300">
                {trauma.gameplayTriggers.map((trigger, index) => (
                  <li key={index}>{trigger}</li>
                ))}
              </ul>
            </div>
          )}
          
          {trauma.relatedSkills && trauma.relatedSkills.length > 0 && (
            <div className="mt-2">
              <h4 className="text-green-400 font-bold mb-1">Related Skills:</h4>
              <div className="flex flex-wrap gap-1">
                {trauma.relatedSkills.map((skill, index) => (
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
