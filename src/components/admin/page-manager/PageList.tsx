import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus } from 'lucide-react';
import { Page } from '../../../context/PageContext';
import PageListItem from './PageListItem';

interface PageListProps {
  pages: Page[];
  onEdit: (page: Page) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const PageList: React.FC<PageListProps> = ({ pages, onEdit, onDelete, onAdd }) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedPages = items.map((page, index) => ({
      ...page,
      order: index + 1
    }));

    // Update pages through context
    // This will be handled by the parent component
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pages</h2>
        <button
          onClick={onAdd}
          className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Page
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pages">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {pages.map((page, index) => (
                <PageListItem
                  key={page.id}
                  page={page}
                  index={index}
                  onEdit={() => onEdit(page)}
                  onDelete={() => onDelete(page.id)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default PageList;