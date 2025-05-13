import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, TextField, Alert } from '@mui/material';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const SupabaseExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('donor');

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Function to load users from Supabase
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using Supabase API directly
      const { data, error } = await supabase
        .from('users')
        .select('id, name:display_name, email, role')
        .eq('role', 'donor')
        .order('created_at', { ascending: false })
        .limit(10);
      
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
      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: 'TemporaryPassword123!', // In a real app, you'd collect this from the user
        options: {
          data: {
            name,
            role: role.toLowerCase()
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) throw new Error('Failed to create user account');
      
      // The user record in public.users will be created automatically via a trigger
      // when the user confirms their email
      
      // Reset form
      setName('');
      setEmail('');
      
      // Show success message
      setError('User created successfully! They will need to confirm their email.');
      
      // Reload users
      loadUsers();
    } catch (err) {
      setError('Failed to add user: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Supabase Example
      </Typography>
      
      <Typography variant="body1" paragraph>
        This component demonstrates how to use the Supabase API for database operations.
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

export default SupabaseExample; 