import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again later.');
      setUsers([]);
    }
  };

  const handleEdit = (id) => {
    // TODO: Implement edit functionality
    console.log('Edit user:', id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${id}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || `Failed to delete user: ${response.status}`);
        }
        
        setUsers(users.filter(user => user._id !== id));
        setSuccess('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.message || 'Failed to delete user. Please try again later.');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to update user status: ${response.status}`);
      }
      
      setUsers(users.map(user => 
        user._id === id ? { ...user, active: !currentStatus } : user
      ));
      setSuccess('User status updated successfully');
    } catch (error) {
      console.error('Error updating user status:', error);
      setError(error.message || 'Failed to update user status. Please try again later.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Users Management
      </Typography>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === 'admin' ? 'secondary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <Chip
                    label={user.active ? 'Active' : 'Inactive'}
                    color={user.active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user._id)} color="primary">
                    <EditIcon />
                  </IconButton>
                  {user.role !== 'admin' && (
                    <>
                      <IconButton
                        onClick={() => handleToggleStatus(user._id, user.active)}
                        color={user.active ? 'error' : 'success'}
                      >
                        {user.active ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                      <IconButton onClick={() => handleDelete(user._id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Users; 