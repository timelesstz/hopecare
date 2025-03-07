import React, { useState, useEffect } from 'react';
// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  metadata?: {
    width?: number;
    height?: number;
    alt?: string;
    title?: string;
  };
}

const MediaLibrary: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [editForm, setEditForm] = useState({
    alt: '',
    title: '',
    tags: '',
  });

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems(data);
    } catch (error) {
      console.error('Error fetching media items:', error);
      showNotification('Failed to fetch media items', 'error');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = `${Date.now()}-${file.name}`;

        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(filename, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filename);

        // Create media record
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .insert([
            {
              filename,
              url: publicUrl,
              type: file.type,
              size: file.size,
              tags: [],
              metadata: {
                title: file.name,
                alt: file.name,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (mediaError) throw mediaError;

        setMediaItems([mediaData, ...mediaItems]);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      showNotification('Files uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading files:', error);
      showNotification('Failed to upload files', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([item.filename]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', item.id);

      if (dbError) throw dbError;

      setMediaItems(mediaItems.filter((i) => i.id !== item.id));
      showNotification('Item deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('Failed to delete item', 'error');
    }
  };

  const handleEdit = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('media')
        .update({
          metadata: {
            ...selectedItem.metadata,
            alt: editForm.alt,
            title: editForm.title,
          },
          tags: editForm.tags.split(',').map((tag) => tag.trim()),
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      setMediaItems(
        mediaItems.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                metadata: {
                  ...item.metadata,
                  alt: editForm.alt,
                  title: editForm.title,
                },
                tags: editForm.tags.split(',').map((tag) => tag.trim()),
              }
            : item
        )
      );

      setIsEditDialogOpen(false);
      showNotification('Item updated successfully', 'success');
    } catch (error) {
      console.error('Error updating item:', error);
      showNotification('Failed to update item', 'error');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    showNotification('URL copied to clipboard', 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Media Library</h2>
        <div className="flex items-center space-x-4">
          {isUploading && (
            <CircularProgress
              variant="determinate"
              value={uploadProgress}
              size={24}
            />
          )}
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            disabled={isUploading}
          >
            Upload Files
            <input
              type="file"
              hidden
              multiple
              onChange={handleFileUpload}
              accept="image/*,video/*,application/pdf"
            />
          </Button>
        </div>
      </div>

      <Grid container spacing={3}>
        {mediaItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card>
              <CardMedia
                component={item.type.startsWith('image/') ? 'img' : 'div'}
                image={item.type.startsWith('image/') ? item.url : '/file-icon.png'}
                alt={item.metadata?.alt || item.filename}
                sx={{ height: 200, bgcolor: 'grey.200' }}
              />
              <CardContent>
                <Typography variant="subtitle1" noWrap>
                  {item.metadata?.title || item.filename}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(item.size)}
                </Typography>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </div>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(item.url)}
                  title="Copy URL"
                >
                  <CopyIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedItem(item);
                    setEditForm({
                      alt: item.metadata?.alt || '',
                      title: item.metadata?.title || '',
                      tags: item.tags.join(', '),
                    });
                    setIsEditDialogOpen(true);
                  }}
                  title="Edit"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(item)}
                  title="Delete"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Media Item</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <TextField
              label="Title"
              fullWidth
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <TextField
              label="Alt Text"
              fullWidth
              value={editForm.alt}
              onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
            />
            <TextField
              label="Tags"
              fullWidth
              value={editForm.tags}
              onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
              helperText="Comma-separated tags"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">
            Save
          </Button>
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

export default MediaLibrary;
