import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Block } from './types';
import StyleControls from './StyleControls';

interface BlockControlsProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

const BlockControls: React.FC<BlockControlsProps> = ({ block, onUpdate }) => {
  const updateSettings = (updates: Partial<typeof block.settings>) => {
    onUpdate({
      settings: { ...block.settings, ...updates }
    });
  };

  const updateStyles = (updates: Partial<typeof block.styles>) => {
    onUpdate({
      styles: { ...block.styles, ...updates }
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Block Settings</h3>
        {/* Block-specific controls based on type */}
        {block.type === 'heading' && (
          <select
            value={block.settings?.level || 2}
            onChange={(e) => updateSettings({ level: parseInt(e.target.value) as 1|2|3|4|5|6 })}
            className="w-full border border-gray-300 rounded-md"
          >
            {[1, 2, 3, 4, 5, 6].map(level => (
              <option key={level} value={level}>Heading {level}</option>
            ))}
          </select>
        )}

        {block.type === 'button' && (
          <div className="space-y-4">
            <select
              value={block.settings?.buttonType || 'primary'}
              onChange={(e) => updateSettings({ buttonType: e.target.value })}
              className="w-full border border-gray-300 rounded-md"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
            </select>
            <select
              value={block.settings?.buttonSize || 'medium'}
              onChange={(e) => updateSettings({ buttonSize: e.target.value })}
              className="w-full border border-gray-300 rounded-md"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        )}

        {/* Content editor */}
        <textarea
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-md"
          rows={4}
          placeholder={`Enter ${block.type} content...`}
        />
      </div>

      {/* Style Controls */}
      <StyleControls styles={block.styles || {}} onUpdate={updateStyles} />
    </div>
  );
};

export default BlockControls;