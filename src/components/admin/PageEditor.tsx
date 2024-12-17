import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { 
  Save, 
  X, 
  Plus,
  GripVertical,
  Type,
  Image as ImageIcon,
  Columns,
  List,
  Quote,
  Code,
  Youtube,
  Trash2
} from 'lucide-react';
import { Page } from '../../context/PageContext';

interface Block {
  id: string;
  type: 'heading' | 'text' | 'image' | 'columns' | 'list' | 'quote' | 'code' | 'video';
  content: string;
  settings?: {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    columns?: number;
    listType?: 'bullet' | 'number';
    language?: string;
    [key: string]: any;
  };
}

interface PageEditorProps {
  page: Page;
  onSave: (updatedPage: Page) => void;
  onCancel: () => void;
}

const BLOCK_TYPES = [
  { type: 'heading', icon: Type, label: 'Heading' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'image', icon: ImageIcon, label: 'Image' },
  { type: 'columns', icon: Columns, label: 'Columns' },
  { type: 'list', icon: List, label: 'List' },
  { type: 'quote', icon: Quote, label: 'Quote' },
  { type: 'code', icon: Code, label: 'Code' },
  { type: 'video', icon: Youtube, label: 'Video' }
];

const PageEditor: React.FC<PageEditorProps> = ({ page, onSave, onCancel }) => {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    try {
      const doc = new DOMParser().parseFromString(page.content || '', 'text/html');
      return Array.from(doc.body.children).map(element => ({
        id: uuidv4(),
        type: getBlockTypeFromElement(element),
        content: element.innerHTML,
        settings: getBlockSettingsFromElement(element)
      }));
    } catch (error) {
      console.error('Error parsing page content:', error);
      return [];
    }
  });

  function getBlockTypeFromElement(element: Element): Block['type'] {
    switch (element.tagName.toLowerCase()) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return 'heading';
      case 'p':
        return 'text';
      case 'img':
        return 'image';
      case 'div':
        if (element.classList.contains('columns')) return 'columns';
        return 'text';
      case 'ul':
      case 'ol':
        return 'list';
      case 'blockquote':
        return 'quote';
      case 'pre':
        return 'code';
      case 'iframe':
        return 'video';
      default:
        return 'text';
    }
  }

  function getBlockSettingsFromElement(element: Element) {
    const settings: Block['settings'] = {};
    
    if (element.tagName.match(/^h[1-6]$/i)) {
      settings.level = parseInt(element.tagName[1]);
    }
    
    if (element.tagName === 'DIV' && element.classList.contains('columns')) {
      settings.columns = element.children.length;
    }
    
    if (element.tagName === 'UL' || element.tagName === 'OL') {
      settings.listType = element.tagName === 'UL' ? 'bullet' : 'number';
    }
    
    return settings;
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBlocks(items);
  };

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: uuidv4(),
      type,
      content: '',
      settings: getDefaultSettings(type)
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultSettings = (type: Block['type']): Block['settings'] => {
    switch (type) {
      case 'heading':
        return { level: 2 };
      case 'columns':
        return { columns: 2 };
      case 'list':
        return { listType: 'bullet' };
      case 'code':
        return { language: 'javascript' };
      default:
        return {};
    }
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const handleSave = () => {
    const content = blocks.map(block => {
      switch (block.type) {
        case 'heading':
          return `<h${block.settings?.level || 2}>${block.content}</h${block.settings?.level || 2}>`;
        case 'text':
          return `<p>${block.content}</p>`;
        case 'image':
          return `<img src="${block.content}" alt="" class="w-full rounded-lg" />`;
        case 'columns':
          return `<div class="grid grid-cols-${block.settings?.columns || 2} gap-6">${block.content}</div>`;
        case 'list':
          return block.settings?.listType === 'bullet' 
            ? `<ul class="list-disc pl-6">${block.content}</ul>`
            : `<ol class="list-decimal pl-6">${block.content}</ol>`;
        case 'quote':
          return `<blockquote class="border-l-4 border-rose-500 pl-4 italic">${block.content}</blockquote>`;
        case 'code':
          return `<pre class="bg-gray-800 text-white p-4 rounded-lg"><code class="language-${block.settings?.language}">${block.content}</code></pre>`;
        case 'video':
          return `<div class="aspect-w-16 aspect-h-9">${block.content}</div>`;
        default:
          return block.content;
      }
    }).join('\n');

    onSave({
      ...page,
      content
    });
  };

  const renderBlockEditor = (block: Block) => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-2">
            <select
              value={block.settings?.level || 2}
              onChange={(e) => updateBlock(block.id, { 
                settings: { ...block.settings, level: parseInt(e.target.value) as 1|2|3|4|5|6 }
              })}
              className="w-24 border border-gray-300 rounded-md"
            >
              {[1, 2, 3, 4, 5, 6].map(level => (
                <option key={level} value={level}>H{level}</option>
              ))}
            </select>
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Heading text..."
            />
          </div>
        );
      
      case 'text':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter text content..."
          />
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Image URL..."
            />
            {block.content && (
              <img 
                src={block.content} 
                alt="Preview" 
                className="max-h-40 rounded-lg"
              />
            )}
          </div>
        );
      
      case 'columns':
        return (
          <div className="space-y-2">
            <select
              value={block.settings?.columns || 2}
              onChange={(e) => updateBlock(block.id, { 
                settings: { ...block.settings, columns: parseInt(e.target.value) }
              })}
              className="w-24 border border-gray-300 rounded-md"
            >
              {[2, 3, 4].map(cols => (
                <option key={cols} value={cols}>{cols} Columns</option>
              ))}
            </select>
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Column content (HTML)..."
            />
          </div>
        );
      
      default:
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder={`Enter ${block.type} content...`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Page Content</h2>
          <div className="flex space-x-2">
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

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {BLOCK_TYPES.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {blocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div
                              {...provided.dragHandleProps}
                              className="p-2 text-gray-400 hover:text-gray-600 cursor-move"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {block.type}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {renderBlockEditor(block)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default PageEditor;