import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, TextField, Alert } from '@mui/material';
import * as firestoreUtils from '../utils/firestoreUtils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const FirestoreExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('DONOR');

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Function to load users from Firestore
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using our Firestore utility function (similar to Supabase API)
      const { data, error } = await firestoreUtils.getAll('users', {
        select: ['name', 'email', 'role'],
        where: [['role', '==', 'DONOR']],
        orderBy: [['created_at', 'desc']],
        limit: 10
      });
      
      if (error) {
        throw error;
      }
      
      setUsers(data as User[]);
    } catch (err) {
      setError('Failed to load users: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new user
  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await firestoreUtils.insert('users', {
        name,
        email,
        role: 'USER',
        created_at: new Date().toISOString()
      });
      
      if (error) {
        throw error;
      }
      
      // Reset form
      setName('');
      setEmail('');
      
      // Reload users
      loadUsers();
    } catch (err) {
      setError('Failed to add user: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Firestore Example
      </Typography>
      
      <Typography variant="body1" paragraph>
        This component demonstrates how to use the Firestore utility functions that provide a similar API to Supabase.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={addUser} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New User
        </Typography>
        
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          Add User
        </Button>
      </Box>
      
      <Typography variant="h6" gutterBottom>
        User List
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No users found.
        </Typography>
      ) : (
        <Box>
          {users.map((user) => (
            <Paper key={user.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1">
                <strong>{user.name}</strong>
              </Typography>
              <Typography variant="body2">
                Email: {user.email}
              </Typography>
              <Typography variant="body2">
                Role: {user.role}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
      
      <Box mt={3}>
        <Button 
          variant="outlined" 
          onClick={loadUsers} 
          disabled={loading}
        >
          Refresh Users
        </Button>
      </Box>
    </Paper>
  );
};

export default FirestoreExample; 