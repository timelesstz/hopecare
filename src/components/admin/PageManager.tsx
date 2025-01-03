import { useState } from 'react';
import { usePages } from '../../context/PageContext';
import PageList from './page-manager/PageList';
import PageEditor from './PageEditor';

const PageManager = () => {
  const { pages, updatePages, deletePage, addPage } = usePages();
  const [editingPage, setEditingPage] = useState(null);

  const handleAddPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      title: 'New Page',
      slug: `new-page-${Date.now()}`,
      order: pages.length + 1,
      status: 'draft',
      content: ''
    };
    addPage(newPage);
  };

  if (editingPage) {
    return (
      <PageEditor
        page={editingPage}
        onSave={(updatedPage) => {
          updatePages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
          setEditingPage(null);
        }}
        onCancel={() => setEditingPage(null)}
      />
    );
  }

  return (
    <div className="p-4">
      <PageList
        pages={pages}
        onEdit={setEditingPage}
        onDelete={deletePage}
        onAdd={handleAddPage}
      />
    </div>
  );
};

export default PageManager;