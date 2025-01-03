import { useState } from 'react';
import { Edit2, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePages } from '../context/PageContext';

interface AdminEditButtonProps {
  pageId: string;
}

const AdminEditButton: React.FC<AdminEditButtonProps> = ({ pageId }) => {
  const { user } = useAuth();
  const { pages, updatePage } = usePages();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const page = pages.find(p => p.id.toString() === pageId);

  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin || !page) return null;

  const handleEdit = () => {
    setEditedContent(page.content || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updatePage({
      ...page,
      content: editedContent
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  return (
    <div className="fixed bottom-4 right-4 flex gap-2">
      {!isEditing ? (
        <button
          onClick={handleEdit}
          className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full shadow-lg"
          title="Edit Page"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      ) : (
        <>
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg"
            title="Save Changes"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
            title="Cancel Edit"
          >
            <X className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default AdminEditButton;