import React from 'react';
import { Character } from '../CharacterCreation';

interface StepProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function IdentityStep({ character, updateCharacter, nextStep }: StepProps) {
  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateCharacter({ [name]: value });
  };

  // Common field styling
  const fieldClass = "bg-black border border-green-600 text-green-300 px-3 py-2 rounded w-full mb-4 font-mono";
  const labelClass = "block text-green-400 mb-1";

  // SR6E archetypes
  const archetypes = [
    { value: "", label: "Select an archetype..." },
    { value: "street_samurai", label: "Street Samurai" },
    { value: "face", label: "Face" },
    { value: "decker", label: "Decker" },
    { value: "technomancer", label: "Technomancer" },
    { value: "rigger", label: "Rigger" },
    { value: "adept", label: "Physical Adept" },
    { value: "mage", label: "Mage" },
    { value: "shaman", label: "Shaman" },
    { value: "infiltrator", label: "Infiltrator" },
    { value: "combat_specialist", label: "Combat Specialist" },
    { value: "custom", label: "Custom Archetype" }
  ];

  // Essence anchors (symbolic anchors that define the character's core identity)
  const essenceAnchors = [
    { value: "", label: "Select an anchor..." },
    { value: "freedom", label: "Freedom" },
    { value: "justice", label: "Justice" },
    { value: "power", label: "Power" },
    { value: "community", label: "Community" },
    { value: "knowledge", label: "Knowledge" },
    { value: "honor", label: "Honor" },
    { value: "revenge", label: "Revenge" },
    { value: "legacy", label: "Legacy" },
    { value: "survival", label: "Survival" },
    { value: "redemption", label: "Redemption" },
    { value: "custom", label: "Custom Anchor" }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl text-green-400 border-b border-green-800 pb-2 mb-4">Identity & Symbolic Role</h2>
        <p className="text-green-300 mb-4">Define who your character is in both the physical world and the symbolic landscape of Shadowrun.</p>
      </div>

      {/* Character Name */}
      <div className="mb-4">
        <label htmlFor="name" className={labelClass}>Character Name</label>
        <input 
          type="text" 
          id="name" 
          name="name"
          value={character.name} 
          onChange={handleChange}
          className={fieldClass}
          placeholder="Enter character name"
          required
        />
      </div>

      {/* Street Name / Handle */}
      <div className="mb-4">
        <label htmlFor="handle" className={labelClass}>Street Name / Handle</label>
        <input 
          type="text" 
          id="handle" 
          name="handle"
          value={character.handle} 
          onChange={handleChange}
          className={fieldClass}
          placeholder="What are you known as in the shadows?"
        />
      </div>

      {/* Gender and Pronouns (side by side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="gender" className={labelClass}>Gender</label>
          <input 
            type="text" 
            id="gender" 
            name="gender"
            value={character.gender} 
            onChange={handleChange}
            className={fieldClass}
            placeholder="Optional"
          />
        </div>
        <div>
          <label htmlFor="pronouns" className={labelClass}>Pronouns</label>
          <input 
            type="text" 
            id="pronouns" 
            name="pronouns"
            value={character.pronouns} 
            onChange={handleChange}
            className={fieldClass}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Archetype */}
      <div className="mb-4">
        <label htmlFor="archetype" className={labelClass}>Archetype</label>
        <select 
          id="archetype" 
          name="archetype"
          value={character.archetype} 
          onChange={handleChange}
          className={fieldClass}
        >
          {archetypes.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <p className="text-xs text-green-700 mt-1">Your character archetype influences available skills and gear options.</p>
      </div>

      {/* Essence Anchor (Symbolic Role) */}
      <div className="mb-4">
        <label htmlFor="essence_anchor" className={labelClass}>Essence Anchor</label>
        <select 
          id="essence_anchor" 
          name="essence_anchor"
          value={character.essence_anchor} 
          onChange={handleChange}
          className={fieldClass}
        >
          {essenceAnchors.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <p className="text-xs text-green-700 mt-1">Your essence anchor represents the core symbolic value that drives your character.</p>
      </div>

      {/* Background Seed */}
      <div className="mb-6">
        <label htmlFor="background_seed" className={labelClass}>Background Seed</label>
        <textarea 
          id="background_seed" 
          name="background_seed"
          value={character.background_seed} 
          onChange={handleChange}
          className={`${fieldClass} h-24`}
          placeholder="A brief note about your character's background..."
        />
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={nextStep}
          className="px-4 py-2 bg-green-600 text-black rounded hover:bg-green-500"
          disabled={!character.name}
        >
          Continue to Core Traumas & Strengths
        </button>
      </div>
    </div>
  );
}
