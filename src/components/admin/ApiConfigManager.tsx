import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tabs,
  Tab,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { Edit, Delete, Visibility, VisibilityOff, Add } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface ApiConfig {
  id: number;
  key: string;
  value: string;
  description: string;
  type: 'text' | 'password' | 'email' | 'number' | 'boolean';
  category: 'smtp' | 'api' | 'general' | 'contact';
  is_sensitive: boolean;
}

const ApiConfigManager: React.FC = () => {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Partial<ApiConfig> | null>(null);
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const fetchConfigs = async () => {
    try {
      const response = await axios.get('/api/configs', {
        params: { category: selectedCategory !== 'all' ? selectedCategory : undefined }
      });
      setConfigs(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch configurations', 'error');
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [selectedCategory]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingConfig(null);
  };

  const handleSave = async () => {
    try {
      if (!editingConfig) return;

      if (editingConfig.id) {
        await axios.put(`/api/configs/${editingConfig.key}`, editingConfig);
      } else {
        await axios.post('/api/configs', editingConfig);
      }

      showSnackbar(
        `Configuration ${editingConfig.id ? 'updated' : 'created'} successfully`,
        'success'
      );
      handleClose();
      fetchConfigs();
    } catch (error) {
      showSnackbar('Failed to save configuration', 'error');
    }
  };

  const handleDelete = async (key: string) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      await axios.delete(`/api/configs/${key}`);
      showSnackbar('Configuration deleted successfully', 'success');
      fetchConfigs();
    } catch (error) {
      showSnackbar('Failed to delete configuration', 'error');
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPassword(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h5" component="h2">
          API Configuration Manager
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            setEditingConfig({});
            setOpenDialog(true);
          }}
        >
          Add New Configuration
        </Button>
      </div>

      <Tabs
        value={selectedCategory}
        onChange={(_, value) => setSelectedCategory(value)}
        className="mb-4"
      >
        <Tab label="All" value="all" />
        <Tab label="SMTP" value="smtp" />
        <Tab label="API" value="api" />
        <Tab label="Contact" value="contact" />
        <Tab label="General" value="general" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.key}</TableCell>
                <TableCell>
                  {config.is_sensitive ? (
                    <div className="flex items-center">
                      <span>
                        {showPassword[config.key] ? config.value : '********'}
                      </span>
                      <IconButton
                        size="small"
                        onClick={() => togglePasswordVisibility(config.key)}
                      >
                        {showPassword[config.key] ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </div>
                  ) : (
                    config.value
                  )}
                </TableCell>
                <TableCell>{config.description}</TableCell>
                <TableCell>{config.type}</TableCell>
                <TableCell>{config.category}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setEditingConfig(config);
                      setOpenDialog(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(config.key)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingConfig?.id ? 'Edit Configuration' : 'New Configuration'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Key"
              value={editingConfig?.key || ''}
              onChange={(e) => setEditingConfig(prev => ({ ...prev, key: e.target.value }))}
              disabled={!!editingConfig?.id}
            />
            <TextField
              fullWidth
              label="Value"
              type={editingConfig?.is_sensitive && !showPassword[editingConfig.key || ''] ? 'password' : 'text'}
              value={editingConfig?.value || ''}
              onChange={(e) => setEditingConfig(prev => ({ ...prev, value: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Description"
              value={editingConfig?.description || ''}
              onChange={(e) => setEditingConfig(prev => ({ ...prev, description: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={editingConfig?.type || 'text'}
                onChange={(e) => setEditingConfig(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="password">Password</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editingConfig?.category || 'general'}
                onChange={(e) => setEditingConfig(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="smtp">SMTP</MenuItem>
                <MenuItem value="api">API</MenuItem>
                <MenuItem value="contact">Contact</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ApiConfigManager;
