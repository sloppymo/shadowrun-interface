import React from 'react';

interface CharacterProgressBarProps {
  steps: string[];
  currentStep: number;
}

export const CharacterProgressBar: React.FC<CharacterProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`text-xs ${currentStep >= index ? 'text-green-400' : 'text-green-900'}`}
          >
            {step}
          </div>
        ))}
      </div>
      
      <div className="relative h-2 bg-green-900 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-1">
        {steps.map((_, index) => (
          <div 
            key={index}
            className={`w-4 h-4 rounded-full border-2 ${
              index < currentStep 
                ? 'bg-green-600 border-green-400' 
                : index === currentStep 
                  ? 'bg-black border-green-400' 
                  : 'bg-black border-green-900'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
