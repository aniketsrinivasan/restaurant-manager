const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Verify Python script exists
const scriptPath = path.join(__dirname, '../scripts/generate_message.py');
if (!fs.existsSync(scriptPath)) {
  console.error('Error: generate_message.py script not found at:', scriptPath);
}

router.post('/generate', async (req, res) => {
  try {
    const { message, reservationContext } = req.body;
    
    if (!message || !reservationContext) {
      return res.status(400).json({ 
        error: 'Missing required fields: message and reservationContext' 
      });
    }

    // Call Python script to generate response
    const pythonProcess = spawn('python', [
      scriptPath,
      JSON.stringify({ message, reservationContext })
    ]);

    let responseData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorData);
        return res.status(500).json({ 
          error: errorData || 'Failed to generate message'
        });
      }
      try {
        const response = JSON.parse(responseData);
        if (!response.response) {
          throw new Error('Invalid response format from Python script');
        }
        res.json(response);
      } catch (e) {
        console.error('Error parsing Python response:', e);
        res.status(500).json({ 
          error: 'Invalid response format from Python script'
        });
      }
    });

  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 