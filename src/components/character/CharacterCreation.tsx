import React, { useState, useEffect, ReactElement, FC } from 'react';

// Import statements for step components
import IdentityStep from './steps/IdentityStep';
import BuildMethodStep from './steps/BuildMethodStep';
import AttributesStep from './steps/AttributesStep';
import SkillsStep from './steps/SkillsStep';
// Additional step imports will be uncommented as they're implemented
// import QualitiesStep from './steps/QualitiesStep';
// import GearStep from './steps/GearStep';
// import ContactsStep from './steps/ContactsStep';
// import NarrativeStep from './steps/NarrativeStep';
// import FinalizeStep from './steps/FinalizeStep';

// Define step component props interface
export interface StepProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Define step component type
type StepComponent = FC<StepProps> | null;

// Define step interface
interface Step {
  title: string;
  component: StepComponent;
}

// Define the character data structure
export interface Character {
  id?: number;
  user_id: string;
  session_id: string;
  name: string;
  handle: string;
  archetype: string;
  background_seed: string;
  gender: string;
  pronouns: string;
  essence_anchor: string;
  build_method: string;
  attributes: any;
  skills: any;
  qualities: any;
  gear: any;
  lifestyle: any;
  contacts: any;
  narrative_hooks: any;
  core_traumas: any[];
  core_strengths: any[];
}

// Initial empty character template
const emptyCharacter: Character = {
  user_id: '',
  session_id: '',
  name: '',
  handle: '',
  archetype: '',
  background_seed: '',
  gender: '',
  pronouns: '',
  essence_anchor: '',
  build_method: 'priority',
  attributes: {},
  skills: {},
  qualities: { positive: [], negative: [], symbolic: [] },
  gear: [],
  lifestyle: {},
  contacts: [],
  narrative_hooks: [],
  core_traumas: [],
  core_strengths: []
};

interface CharacterCreationProps {
  sessionId: string;
  userId: string;
  onComplete?: (character: Character) => void;
}

export default function CharacterCreation({ sessionId, userId, onComplete }: CharacterCreationProps) {
  const [step, setStep] = useState(0);
  const [character, setCharacter] = useState<Character>({
    ...emptyCharacter,
    user_id: userId,
    session_id: sessionId
  });
  const [saving, setSaving] = useState(false);

  // Define all the steps in the character creation flow
  const steps = [
    { title: "Identity", component: IdentityStep },
    { title: "Build Method", component: BuildMethodStep },
    { title: "Attributes", component: AttributesStep },
    { title: "Skills", component: SkillsStep },
    { title: "Qualities", component: null }, // Will be replaced with QualitiesStep
    { title: "Gear & Lifestyle", component: null }, // Will be replaced with GearStep
    { title: "Contacts", component: null }, // Will be replaced with ContactsStep
    { title: "Narrative Hooks", component: null }, // Will be replaced with NarrativeStep
    { title: "Finalize", component: null } // Will be replaced with FinalizeStep
  ];

  // Handle step navigation
  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      saveCharacter();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Update character data from step components
  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter({ ...character, ...updates });
  };

  // Save character to backend
  const saveCharacter = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/session/${sessionId}/character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character)
      });
      
      const data = await response.json();
      if (response.ok) {
        if (onComplete) {
          onComplete({ ...character, id: data.character_id });
        }
      } else {
        // Handle error
        console.error("Failed to save character:", data.error);
      }
    } catch (error) {
      console.error("Error saving character:", error);
    } finally {
      setSaving(false);
    }
  };
  
  // Render the current step component
  const renderStep = () => {
    const CurrentStep = steps[step].component;
    
    if (!CurrentStep) {
      // Render placeholder for unimplemented steps
      return (
        <div className="text-green-300 p-4 border border-green-800 rounded-md">
          <h3 className="text-lg font-bold mb-4">{steps[step].title}</h3>
          <p className="mb-2">This step is coming soon!</p>
          <p className="text-sm text-green-600">
            We're actively developing the {steps[step].title.toLowerCase()} step component.
            You can continue with character creation using the navigation buttons below.
          </p>
        </div>
      );
    }
    
    // Render the actual step component with required props
    return (
      <CurrentStep
        character={character}
        updateCharacter={updateCharacter}
        nextStep={nextStep}
        prevStep={prevStep}
      />
    );
  };

  return (
    <div className="bg-black border border-green-800 rounded p-6 shadow font-mono max-w-4xl mx-auto my-8">
      <h1 className="text-2xl text-green-500 font-bold mb-6">Character Creation</h1>
      
      {/* Progress indicators will go here */}
      <div className="flex justify-between mb-2">
        {steps.map((stepItem, index) => (
          <div 
            key={index}
            className={`text-xs ${index <= step ? 'text-green-400' : 'text-green-900'}`}
          >
            {stepItem.title}
          </div>
        ))}
      </div>
      
      <div className="relative h-2 bg-green-900 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300"
          style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
        />
      </div>
      
      <div className="my-8">
        {renderStep()}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={step === 0 || saving}
          className={`px-4 py-2 rounded ${step === 0 ? 'bg-gray-700 text-gray-500' : 'bg-green-800 text-black hover:bg-green-700'}`}
        >
          Back
        </button>
        
        <button
          onClick={nextStep}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-black rounded hover:bg-green-500"
        >
          {step === steps.length - 1 ? (saving ? 'Saving...' : 'Complete') : 'Continue'}
        </button>
      </div>
    </div>
  );
}
