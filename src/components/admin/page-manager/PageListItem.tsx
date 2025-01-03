import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { Page } from '../../../context/PageContext';

interface PageListItemProps {
  page: Page;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const PageListItem: React.FC<PageListItemProps> = ({ page, index, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Draggable draggableId={page.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              <div>
                <h3 className="font-medium text-gray-900">{page.title}</h3>
                <p className="text-sm text-gray-500">{page.slug}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                page.status === 'published' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {page.status}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {isExpanded && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
              <div className="prose prose-sm max-w-none">
                {page.content || (
                  <p className="text-gray-500 italic">No content</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default PageListItem;