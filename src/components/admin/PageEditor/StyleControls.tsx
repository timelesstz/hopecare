import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BlockStyles } from './types';

interface StyleControlsProps {
  styles: BlockStyles;
  onUpdate: (styles: Partial<BlockStyles>) => void;
}

const StyleControls: React.FC<StyleControlsProps> = ({ styles, onUpdate }) => {
  const [openSection, setOpenSection] = useState<string>('spacing');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Styles</h3>

      {/* Spacing */}
      <div className="border rounded-md">
        <button
          className="w-full px-4 py-2 flex items-center justify-between text-left"
          onClick={() => toggleSection('spacing')}
        >
          <span>Spacing</span>
          {openSection === 'spacing' ? <ChevronUp /> : <ChevronDown />}
        </button>
        {openSection === 'spacing' && (
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Padding</label>
                <input
                  type="text"
                  value={styles.padding || ''}
                  onChange={(e) => onUpdate({ padding: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md"
                  placeholder="e.g., 1rem"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Margin</label>
                <input
                  type="text"
                  value={styles.margin || ''}
                  onChange={(e) => onUpdate({ margin: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md"
                  placeholder="e.g., 1rem"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="border rounded-md">
        <button
          className="w-full px-4 py-2 flex items-center justify-between text-left"
          onClick={() => toggleSection('colors')}
        >
          <span>Colors</span>
          {openSection === 'colors' ? <ChevronUp /> : <ChevronDown />}
        </button>
        {openSection === 'colors' && (
          <div className="p-4 border-t">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Background Color</label>
                <HexColorPicker
                  color={styles.backgroundColor || '#ffffff'}
                  onChange={(color) => onUpdate({ backgroundColor: color })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Text Color</label>
                <HexColorPicker
                  color={styles.textColor || '#000000'}
                  onChange={(color) => onUpdate({ textColor: color })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Typography */}
      <div className="border rounded-md">
        <button
          className="w-full px-4 py-2 flex items-center justify-between text-left"
          onClick={() => toggleSection('typography')}
        >
          <span>Typography</span>
          {openSection === 'typography' ? <ChevronUp /> : <ChevronDown />}
        </button>
        {openSection === 'typography' && (
          <div className="p-4 border-t">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Font Size</label>
                <input
                  type="text"
                  value={styles.fontSize || ''}
                  onChange={(e) => onUpdate({ fontSize: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md"
                  placeholder="e.g., 16px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Font Weight</label>
                <select
                  value={styles.fontWeight || ''}
                  onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md"
                >
                  <option value="">Default</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Text Align</label>
                <select
                  value={styles.textAlign || ''}
                  onChange={(e) => onUpdate({ textAlign: e.target.value as BlockStyles['textAlign'] })}
                  className="mt-1 block w-full border border-gray-300 rounded-md"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleControls;