import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Edit2, X } from 'lucide-react';

interface BoardMember {
  name: string;
  title: string;
  bio: string;
  image: string;
}

interface OrganizationLevel {
  title: string;
  description: string;
  children: string[];
}

interface AboutEditorProps {
  boardMembers: BoardMember[];
  organizationStructure: OrganizationLevel[];
  onSave: (data: { boardMembers: BoardMember[]; organizationStructure: OrganizationLevel[] }) => void;
}

const AboutEditor: React.FC<AboutEditorProps> = ({ boardMembers: initialBoardMembers, organizationStructure: initialStructure, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [boardMembers, setBoardMembers] = useState(initialBoardMembers);
  const [organizationStructure, setOrganizationStructure] = useState(initialStructure);

  const handleSave = () => {
    onSave({ boardMembers, organizationStructure });
    setIsEditing(false);
  };

  const updateBoardMember = (index: number, field: keyof BoardMember, value: string) => {
    const newMembers = [...boardMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setBoardMembers(newMembers);
  };

  const updateOrgStructure = (index: number, field: keyof OrganizationLevel, value: any) => {
    const newStructure = [...organizationStructure];
    if (field === 'children' && typeof value === 'string') {
      newStructure[index] = { ...newStructure[index], children: value.split(',').map(s => s.trim()) };
    } else {
      newStructure[index] = { ...newStructure[index], [field]: value };
    }
    setOrganizationStructure(newStructure);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="fixed bottom-4 right-4 bg-rose-500 text-white p-3 rounded-full shadow-lg hover:bg-rose-600 transition-colors"
      >
        <Edit2 className="h-6 w-6" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit About Page Content</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Board Members</h3>
            {boardMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateBoardMember(index, 'name', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={member.title}
                      onChange={(e) => updateBoardMember(index, 'title', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={member.bio}
                      onChange={(e) => updateBoardMember(index, 'bio', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={member.image}
                      onChange={(e) => updateBoardMember(index, 'image', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Organization Structure</h3>
            {organizationStructure.map((level, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={level.title}
                      onChange={(e) => updateOrgStructure(index, 'title', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={level.description}
                      onChange={(e) => updateOrgStructure(index, 'description', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roles (comma-separated)</label>
                    <input
                      type="text"
                      value={level.children.join(', ')}
                      onChange={(e) => updateOrgStructure(index, 'children', e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutEditor;
