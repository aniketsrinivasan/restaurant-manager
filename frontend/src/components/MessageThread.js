import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  useTheme,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const MessageBubble = ({ message, isReply = false }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isReply ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '80%',
          bgcolor: isReply 
            ? theme.palette.primary.main 
            : theme.palette.background.paper,
          color: isReply 
            ? theme.palette.primary.contrastText 
            : theme.palette.text.primary,
          borderRadius: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 10,
            [isReply ? 'right' : 'left']: -10,
            borderStyle: 'solid',
            borderWidth: '10px 10px 10px 0',
            borderColor: `transparent ${isReply ? theme.palette.primary.main : theme.palette.background.paper} transparent transparent`,
            transform: isReply ? 'scaleX(-1)' : 'none',
          },
        }}
      >
        <Typography variant="body1">{message}</Typography>
      </Paper>
    </Box>
  );
};

const MessageThread = ({ messages = [], onSendReply, reservation }) => {
  const [newMessage, setNewMessage] = useState('');
  const theme = useTheme();

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendReply(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ 
        maxHeight: '300px', 
        overflowY: 'auto',
        mb: 2,
        p: 2,
        bgcolor: theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.03)' 
          : 'rgba(0,0,0,0.02)',
        borderRadius: 1,
      }}>
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            message={msg.content}
            isReply={msg.isReply}
          />
        ))}
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 1,
        alignItems: 'flex-start'
      }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.background.paper,
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          startIcon={<SendIcon />}
          disabled={!newMessage.trim()}
          sx={{
            height: 40,
            minWidth: 100,
          }}
        >
          Send
        </Button>
        <IconButton
          color="primary"
          onClick={() => {
            // Handle AI suggestion
          }}
          sx={{
            bgcolor: theme.palette.background.paper,
            '&:hover': {
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          <AutoAwesomeIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MessageThread; 