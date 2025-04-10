import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchChats = async () => {
    try {
      const response = await axios.get(`/api/chat/admin/chats`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter || undefined,
        },
      });
      setChats(response.data.chats);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [page, rowsPerPage, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewChat = async (chatId) => {
    try {
      const response = await axios.get(`/api/chat/admin/chats/${chatId}`);
      setSelectedChat(response.data);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching chat details:', error);
    }
  };

  const handleStatusChange = async (chatId, newStatus) => {
    try {
      await axios.patch(`/api/chat/admin/chats/${chatId}`, {
        status: newStatus,
      });
      fetchChats();
    } catch (error) {
      console.error('Error updating chat status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'resolved':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Customer Chat History
      </Typography>

      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Messages</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chats.map((chat) => (
              <TableRow key={chat._id}>
                <TableCell>{chat.userName}</TableCell>
                <TableCell>{chat.userEmail}</TableCell>
                <TableCell>
                  {new Date(chat.lastUpdated).toLocaleString()}
                </TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={chat.status}
                      onChange={(e) => handleStatusChange(chat._id, e.target.value)}
                      size="small"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{chat.messages.length}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewChat(chat._id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chat History - {selectedChat?.userName}
          <Chip
            label={selectedChat?.status}
            color={getStatusColor(selectedChat?.status)}
            size="small"
            sx={{ ml: 1 }}
          />
        </DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {selectedChat?.messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Paper
                  sx={{
                    p: 1,
                    maxWidth: '80%',
                    bgcolor: msg.isUser ? 'primary.main' : 'grey.100',
                    color: msg.isUser ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2">
                    {msg.text}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatList; 