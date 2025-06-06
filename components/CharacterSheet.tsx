import { useState, useEffect } from 'react';

// Shadowrun character data structures
export interface ShadowrunCharacter {
  id: string;
  name: string;
  metatype: 'Human' | 'Elf' | 'Dwarf' | 'Ork' | 'Troll';
  attributes: {
    body: number;
    agility: number;
    reaction: number;
    strength: number;
    charisma: number;
    intuition: number;
    logic: number;
    willpower: number;
    edge: number;
    magic?: number;
    resonance?: number;
  };
  skills: { [key: string]: { rating: number; specialization?: string } };
  initiatives: {
    physical: number;
    astral?: number;
    matrix?: number;
  };
  condition: {
    physical: { current: number; max: number };
    stun: { current: number; max: number };
  };
  armor: number;
  essence: number;
  nuyen: number;
  gear: string[];
  background: {
    archetype: string;
    concept: string;
    notes: string;
  };
}

interface CharacterSheetProps {
  character?: ShadowrunCharacter;
  onCharacterUpdate?: (character: ShadowrunCharacter) => void;
  readonly?: boolean;
}

// Default character template
const createDefaultCharacter = (): ShadowrunCharacter => ({
  id: '',
  name: 'New Runner',
  metatype: 'Human',
  attributes: {
    body: 3,
    agility: 3,
    reaction: 3,
    strength: 3,
    charisma: 3,
    intuition: 3,
    logic: 3,
    willpower: 3,
    edge: 3
  },
  skills: {
    'Firearms': { rating: 3 },
    'Athletics': { rating: 2 },
    'Perception': { rating: 3 },
    'Stealth': { rating: 2 },
    'Electronics': { rating: 2 }
  },
  initiatives: {
    physical: 6
  },
  condition: {
    physical: { current: 0, max: 10 },
    stun: { current: 0, max: 10 }
  },
  armor: 12,
  essence: 6.0,
  nuyen: 5000,
  gear: ['Ares Predator V', 'Armor Jacket', 'Commlink', 'Credstick'],
  background: {
    archetype: 'Street Samurai',
    concept: 'Gun for hire',
    notes: ''
  }
});

// Common Shadowrun skills
const shadowrunSkills = [
  'Archery', 'Firearms', 'Heavy Weapons', 'Melee Combat', 'Throwing Weapons', 'Unarmed Combat',
  'Athletics', 'Gymnastics', 'Stealth', 'Swimming',
  'Astral', 'Assensing', 'Navigation', 'Perception', 'Tracking',
  'Biotechnology', 'Chemistry', 'Computer', 'Cybercombat', 'Cybertechnology', 'Data Search',
  'Demolitions', 'Electronic Warfare', 'First Aid', 'Forgery', 'Hacking', 'Hardware',
  'Industrial Mechanic', 'Locksmith', 'Medicine', 'Nautical Mechanic', 'Software',
  'Acting', 'Con', 'Etiquette', 'Impersonation', 'Instruction', 'Intimidation',
  'Leadership', 'Negotiation', 'Performance',
  'Escape Artist', 'Palming', 'Pickpocket',
  'Disguise', 'Shadowing', 'Survival'
];

export default function CharacterSheet({ character, onCharacterUpdate, readonly = false }: CharacterSheetProps) {
  const [char, setChar] = useState<ShadowrunCharacter>(character || createDefaultCharacter());
  const [activeTab, setActiveTab] = useState('attributes');
  const [newSkillName, setNewSkillName] = useState('');

  useEffect(() => {
    if (character) {
      setChar(character);
    }
  }, [character]);

  useEffect(() => {
    // Calculate derived values
    const updatedChar = { ...char };
    
    // Calculate condition monitor boxes
    updatedChar.condition.physical.max = Math.ceil((updatedChar.attributes.body + updatedChar.attributes.willpower) / 2) + 8;
    updatedChar.condition.stun.max = Math.ceil((updatedChar.attributes.willpower + updatedChar.attributes.logic) / 2) + 8;
    
    // Calculate initiative
    updatedChar.initiatives.physical = updatedChar.attributes.reaction + updatedChar.attributes.intuition;
    
    if (updatedChar.attributes.magic) {
      updatedChar.initiatives.astral = (updatedChar.attributes.intuition * 2) + (updatedChar.attributes.magic || 0);
    }
    
    setChar(updatedChar);
    
    if (onCharacterUpdate && !readonly) {
      onCharacterUpdate(updatedChar);
    }
  }, [char.attributes, onCharacterUpdate, readonly]);

  const updateAttribute = (attr: string, value: number) => {
    if (readonly) return;
    setChar(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: Math.max(1, Math.min(6, value)) }
    }));
  };

  const updateSkill = (skillName: string, rating: number) => {
    if (readonly) return;
    setChar(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillName]: { ...prev.skills[skillName], rating: Math.max(0, Math.min(6, rating)) }
      }
    }));
  };

  const addSkill = () => {
    if (readonly || !newSkillName.trim() || char.skills[newSkillName]) return;
    setChar(prev => ({
      ...prev,
      skills: { ...prev.skills, [newSkillName]: { rating: 1 } }
    }));
    setNewSkillName('');
  };

  const removeSkill = (skillName: string) => {
    if (readonly) return;
    setChar(prev => {
      const newSkills = { ...prev.skills };
      delete newSkills[skillName];
      return { ...prev, skills: newSkills };
    });
  };

  const rollAttribute = (attrName: string, attrValue: number) => {
    // This would integrate with the dice rolling system
    console.log(`Rolling ${attrName}: ${attrValue} dice`);
  };

  const rollSkill = (skillName: string, skillRating: number, linkedAttr: number) => {
    const totalDice = skillRating + linkedAttr;
    console.log(`Rolling ${skillName}: ${totalDice} dice (${skillRating} skill + ${linkedAttr} attribute)`);
  };

  const tabs = [
    { id: 'attributes', label: 'Attributes' },
    { id: 'skills', label: 'Skills' },
    { id: 'combat', label: 'Combat' },
    { id: 'gear', label: 'Gear' },
    { id: 'background', label: 'Background' }
  ];

  return (
    <div className="bg-black bg-opacity-70 border border-red-900 border-opacity-40 rounded-lg text-white">
      {/* Character Header */}
      <div className="p-4 border-b border-red-900 border-opacity-40">
        <div className="flex justify-between items-start">
          <div>
            {readonly ? (
              <h2 className="text-xl font-bold text-green-500">{char.name}</h2>
            ) : (
              <input
                type="text"
                value={char.name}
                onChange={e => setChar(prev => ({ ...prev, name: e.target.value }))}
                className="text-xl font-bold bg-transparent border-b border-green-500 text-green-500 outline-none"
              />
            )}
            <p className="text-gray-400">{char.background.archetype} • {char.metatype}</p>
          </div>
          <div className="text-right text-sm">
            <div>Edge: {char.attributes.edge}/3</div>
            <div>Essence: {char.essence}</div>
            <div>Nuyen: ¥{char.nuyen.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-red-900 border-opacity-40">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.id 
                ? 'text-green-500 border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'attributes' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(char.attributes).map(([attr, value]) => (
              <div key={attr} className="border border-gray-700 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium text-green-400 capitalize">{attr}</label>
                  <button
                    onClick={() => rollAttribute(attr, value)}
                    className="text-xs bg-blue-700 text-blue-100 px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Roll
                  </button>
                </div>
                <div className="flex items-center">
                  {!readonly && (
                    <button
                      onClick={() => updateAttribute(attr, value - 1)}
                      className="bg-red-700 text-white w-6 h-6 rounded-l text-sm hover:bg-red-600"
                    >
                      -
                    </button>
                  )}
                  <div className="bg-gray-800 px-3 py-1 text-center font-bold min-w-[3rem]">
                    {value}
                  </div>
                  {!readonly && (
                    <button
                      onClick={() => updateAttribute(attr, value + 1)}
                      className="bg-green-700 text-white w-6 h-6 rounded-r text-sm hover:bg-green-600"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            {!readonly && (
              <div className="mb-4 flex gap-2">
                <select
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value="">Select a skill...</option>
                  {shadowrunSkills
                    .filter(skill => !char.skills[skill])
                    .map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                </select>
                <button
                  onClick={addSkill}
                  disabled={!newSkillName}
                  className="bg-green-700 text-green-100 px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            )}
            
            <div className="grid gap-3">
              {Object.entries(char.skills).map(([skillName, skill]) => {
                const linkedAttr = getLinkedAttribute(skillName, char.attributes);
                return (
                  <div key={skillName} className="border border-gray-700 rounded p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-green-400">{skillName}</div>
                        {skill.specialization && (
                          <div className="text-xs text-yellow-400">({skill.specialization})</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                          Pool: {skill.rating + linkedAttr}
                        </span>
                        <button
                          onClick={() => rollSkill(skillName, skill.rating, linkedAttr)}
                          className="text-xs bg-blue-700 text-blue-100 px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Roll
                        </button>
                        <div className="flex items-center">
                          {!readonly && (
                            <button
                              onClick={() => updateSkill(skillName, skill.rating - 1)}
                              className="bg-red-700 text-white w-6 h-6 rounded-l text-sm hover:bg-red-600"
                            >
                              -
                            </button>
                          )}
                          <div className="bg-gray-800 px-3 py-1 text-center font-bold min-w-[3rem]">
                            {skill.rating}
                          </div>
                          {!readonly && (
                            <>
                              <button
                                onClick={() => updateSkill(skillName, skill.rating + 1)}
                                className="bg-green-700 text-white w-6 h-6 rounded-r text-sm hover:bg-green-600"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeSkill(skillName)}
                                className="ml-2 bg-red-700 text-white w-6 h-6 rounded text-sm hover:bg-red-600"
                              >
                                ×
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'combat' && (
          <div className="space-y-4">
            {/* Initiative */}
            <div className="border border-gray-700 rounded p-4">
              <h3 className="font-bold text-red-400 mb-2">Initiative</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400">Physical</label>
                  <div className="text-lg font-bold">{char.initiatives.physical} + 1d6</div>
                </div>
                {char.initiatives.astral && (
                  <div>
                    <label className="text-gray-400">Astral</label>
                    <div className="text-lg font-bold">{char.initiatives.astral} + 2d6</div>
                  </div>
                )}
              </div>
            </div>

            {/* Condition Monitors */}
            <div className="border border-gray-700 rounded p-4">
              <h3 className="font-bold text-red-400 mb-2">Condition Monitors</h3>
              <div className="space-y-3">
                <ConditionMonitor
                  label="Physical"
                  current={char.condition.physical.current}
                  max={char.condition.physical.max}
                  onChange={(value) => !readonly && setChar(prev => ({
                    ...prev,
                    condition: { ...prev.condition, physical: { ...prev.condition.physical, current: value } }
                  }))}
                  readonly={readonly}
                />
                <ConditionMonitor
                  label="Stun"
                  current={char.condition.stun.current}
                  max={char.condition.stun.max}
                  onChange={(value) => !readonly && setChar(prev => ({
                    ...prev,
                    condition: { ...prev.condition, stun: { ...prev.condition.stun, current: value } }
                  }))}
                  readonly={readonly}
                />
              </div>
            </div>

            {/* Armor */}
            <div className="border border-gray-700 rounded p-4">
              <h3 className="font-bold text-red-400 mb-2">Armor</h3>
              <div className="text-2xl font-bold text-center">{char.armor}</div>
            </div>
          </div>
        )}

        {activeTab === 'gear' && (
          <div>
            <h3 className="font-bold text-red-400 mb-4">Equipment</h3>
            <div className="space-y-2">
              {char.gear.map((item, index) => (
                <div key={index} className="border border-gray-700 rounded p-2 flex justify-between items-center">
                  <span>{item}</span>
                  {!readonly && (
                    <button
                      onClick={() => setChar(prev => ({
                        ...prev,
                        gear: prev.gear.filter((_, i) => i !== index)
                      }))}
                      className="text-red-400 hover:text-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {!readonly && (
                <input
                  type="text"
                  placeholder="Add equipment..."
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      setChar(prev => ({
                        ...prev,
                        gear: [...prev.gear, e.currentTarget.value.trim()]
                      }));
                      e.currentTarget.value = '';
                    }
                  }}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Concept</label>
              {readonly ? (
                <p className="text-white">{char.background.concept}</p>
              ) : (
                <input
                  type="text"
                  value={char.background.concept}
                  onChange={e => setChar(prev => ({
                    ...prev,
                    background: { ...prev.background, concept: e.target.value }
                  }))}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
              )}
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Notes</label>
              {readonly ? (
                <p className="text-white whitespace-pre-wrap">{char.background.notes}</p>
              ) : (
                <textarea
                  value={char.background.notes}
                  onChange={e => setChar(prev => ({
                    ...prev,
                    background: { ...prev.background, notes: e.target.value }
                  }))}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white h-32"
                  placeholder="Character background, contacts, motivations..."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for condition monitors
interface ConditionMonitorProps {
  label: string;
  current: number;
  max: number;
  onChange: (value: number) => void;
  readonly: boolean;
}

function ConditionMonitor({ label, current, max, onChange, readonly }: ConditionMonitorProps) {
  const boxes = Array.from({ length: max }, (_, i) => i < current);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-gray-400">{label}</label>
        <span className="text-sm">{current}/{max}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {boxes.map((filled, index) => (
          <button
            key={index}
            onClick={() => !readonly && onChange(filled ? current - 1 : current + 1)}
            className={`w-6 h-6 border-2 ${
              filled 
                ? 'bg-red-600 border-red-400' 
                : 'border-gray-600 hover:border-gray-400'
            } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            disabled={readonly}
          />
        ))}
      </div>
    </div>
  );
}

// Helper function to determine linked attribute for skills
function getLinkedAttribute(skillName: string, attributes: ShadowrunCharacter['attributes']): number {
  const skillAttrMap: { [key: string]: keyof ShadowrunCharacter['attributes'] } = {
    'Firearms': 'agility',
    'Melee Combat': 'agility',
    'Unarmed Combat': 'agility',
    'Athletics': 'agility',
    'Stealth': 'agility',
    'Perception': 'intuition',
    'Intimidation': 'charisma',
    'Con': 'charisma',
    'Negotiation': 'charisma',
    'Leadership': 'charisma',
    'Computer': 'logic',
    'Electronics': 'logic',
    'Medicine': 'logic',
    'First Aid': 'logic'
  };

  const attr = skillAttrMap[skillName] || 'agility';
  return attributes[attr] || 0;
}