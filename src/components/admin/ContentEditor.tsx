import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { Button } from '../../components/ui/Button';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Image as ImageIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

interface ContentVersion {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  comment: string;
}

interface ContentEditorProps {
  pageId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  pageId,
  initialContent = '',
  onSave,
}) => {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [saveComment, setSaveComment] = useState('');
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: initialContent,
  });

  useEffect(() => {
    fetchVersions();
  }, [pageId]);

  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    try {
      setSaving(true);
      const content = editor.getHTML();
      
      // Save new version
      const { data, error } = await supabase
        .from('content_versions')
        .insert([
          {
            page_id: pageId,
            content,
            comment: saveComment,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update page content
      await supabase
        .from('pages')
        .update({ content })
        .eq('id', pageId);

      setSaveComment('');
      fetchVersions();
      onSave?.(content);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleVersionSelect = async (versionId: string) => {
    try {
      const version = versions.find((v) => v.id === versionId);
      if (version && editor) {
        editor.commands.setContent(version.content);
      }
    } catch (error) {
      console.error('Error loading version:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const filename = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('content-images')
        .upload(filename, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('content-images')
        .getPublicUrl(filename);

      editor?.chain().focus().setImage({ src: publicUrl }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  if (!editor) return null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center space-x-2 border-b pb-2">
        <IconButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <FormatBold />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <FormatItalic />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <FormatListBulleted />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <FormatListNumbered />
        </IconButton>
        <input
          type="file"
          id="image-upload"
          hidden
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
        <IconButton
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <ImageIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
        >
          <LinkIcon />
        </IconButton>
        <div className="flex-1" />
        <IconButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <UndoIcon />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <RedoIcon />
        </IconButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="prose max-w-none min-h-[300px] border rounded-lg p-4" />

      {/* Version Control */}
      <div className="flex items-center space-x-4">
        <TextField
          label="Save Comment"
          value={saveComment}
          onChange={(e) => setSaveComment(e.target.value)}
          size="small"
          className="flex-1"
        />
        <Button
          variant="primary"
          icon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Version'}
        </Button>
      </div>

      {/* Version History */}
      <div>
        <Select
          value={selectedVersion}
          onChange={(e) => handleVersionSelect(e.target.value as string)}
          displayEmpty
          fullWidth
          size="small"
        >
          <MenuItem value="">Current Version</MenuItem>
          {versions.map((version) => (
            <MenuItem key={version.id} value={version.id}>
              {new Date(version.created_at).toLocaleString()} - {version.comment}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default ContentEditor;
