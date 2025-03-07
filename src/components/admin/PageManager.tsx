import React, { useState, useEffect } from 'react';
// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import ContentEditor from './ContentEditor';
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  meta_description?: string;
  meta_keywords?: string;
}

const PageManager: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'draft' as const,
    meta_description: '',
    meta_keywords: '',
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
      showNotification('Failed to fetch pages', 'error');
    }
  };

  const handleCreatePage = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert([
          {
            ...formData,
            content: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setPages([data, ...pages]);
      setIsDialogOpen(false);
      resetForm();
      showNotification('Page created successfully', 'success');
    } catch (error) {
      console.error('Error creating page:', error);
      showNotification('Failed to create page', 'error');
    }
  };

  const handleUpdatePage = async (pageId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pageId);

      if (error) throw error;

      setPages(pages.map(page => 
        page.id === pageId ? { ...page, content } : page
      ));
      showNotification('Page updated successfully', 'success');
    } catch (error) {
      console.error('Error updating page:', error);
      showNotification('Failed to update page', 'error');
    }
  };

  const handleDeletePage = async () => {
    if (!selectedPage) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', selectedPage.id);

      if (error) throw error;

      setPages(pages.filter(page => page.id !== selectedPage.id));
      setIsDeleteDialogOpen(false);
      setSelectedPage(null);
      showNotification('Page deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting page:', error);
      showNotification('Failed to delete page', 'error');
    }
  };

  const handleSlugGeneration = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, slug });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      status: 'draft',
      meta_description: '',
      meta_keywords: '',
    });
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Page Manager</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Create New Page
        </Button>
      </div>

      {/* Page List */}
      <List className="bg-white rounded-lg shadow">
        {pages.map((page) => (
          <ListItem key={page.id} divider>
            <ListItemText
              primary={page.title}
              secondary={`/${page.slug} • ${page.status} • Last updated: ${new Date(
                page.updated_at
              ).toLocaleDateString()}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => setSelectedPage(page)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="preview"
                href={`/preview/${page.slug}`}
                target="_blank"
              >
                <VisibilityIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => {
                  setSelectedPage(page);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Create Page Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Page</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <TextField
              label="Page Title"
              fullWidth
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                handleSlugGeneration(e.target.value);
              }}
            />
            <TextField
              label="URL Slug"
              fullWidth
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              helperText="URL-friendly version of the title"
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'draft' | 'published',
                  })
                }
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Meta Description"
              fullWidth
              multiline
              rows={2}
              value={formData.meta_description}
              onChange={(e) =>
                setFormData({ ...formData, meta_description: e.target.value })
              }
            />
            <TextField
              label="Meta Keywords"
              fullWidth
              value={formData.meta_keywords}
              onChange={(e) =>
                setFormData({ ...formData, meta_keywords: e.target.value })
              }
              helperText="Comma-separated keywords"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePage} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Page</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{selectedPage?.title}"? This action
          cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePage} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Content Editor Dialog */}
      <Dialog
        open={!!selectedPage}
        onClose={() => setSelectedPage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Edit Page: {selectedPage?.title}</DialogTitle>
        <DialogContent>
          {selectedPage && (
            <ContentEditor
              pageId={selectedPage.id}
              initialContent={selectedPage.content}
              onSave={(content) => handleUpdatePage(selectedPage.id, content)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPage(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
      >
        {notification && (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.type}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </div>
  );
};

export default PageManager;