import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Save, X, Plus, Settings as SettingsIcon } from 'lucide-react';
import { Page } from '../../../context/PageContext';
import BlockList from './BlockList';
import BlockControls from './BlockControls';
import Settings from './Settings';
import AddBlockModal from './AddBlockModal';
import Preview from './Preview';
import { Block, BlockType } from './types';
import { generateHtml } from './utils';

interface PageEditorProps {
  page: Page;
  onSave: (updatedPage: Page) => void;
  onCancel: () => void;
}

const PageEditor: React.FC<PageEditorProps> = ({ page, onSave, onCancel }) => {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    try {
      return parseContent(page.content || '');
    } catch (error) {
      console.error('Error parsing page content:', error);
      return [];
    }
  });

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock = createBlock(type);
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock.id);
    setShowAddModal(false);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSelectedBlock(null);
  };

  const handleSave = () => {
    const content = generateHtml(blocks);
    onSave({
      ...page,
      content
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1 rounded-md ${
                previewMode ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {previewMode ? (
            <Preview blocks={blocks} />
          ) : (
            <div className="h-full flex">
              {/* Left Sidebar - Blocks List */}
              <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={blocks.map(block => block.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <BlockList
                        blocks={blocks}
                        selectedBlock={selectedBlock}
                        onSelectBlock={setSelectedBlock}
                        onDeleteBlock={deleteBlock}
                      />
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  <Preview blocks={blocks} />
                </div>
              </div>

              {/* Right Sidebar - Block Controls */}
              {selectedBlock && (
                <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                  <BlockControls
                    block={blocks.find(b => b.id === selectedBlock)!}
                    onUpdate={(updates) => updateBlock(selectedBlock, updates)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddBlockModal
          onClose={() => setShowAddModal(false)}
          onAddBlock={addBlock}
        />
      )}

      {showSettings && (
        <Settings
          page={page}
          onClose={() => setShowSettings(false)}
          onUpdate={(updates) => onSave({ ...page, ...updates })}
        />
      )}
    </div>
  );
};

export default PageEditor;