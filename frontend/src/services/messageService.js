const RATE_LIMIT_MS = 3000; // 3 seconds
let lastRequestTime = 0;

// Message storage functions
export const getStoredMessages = (reservationId) => {
  try {
    const messages = localStorage.getItem(`messages_${reservationId}`);
    return messages ? JSON.parse(messages) : [];
  } catch (error) {
    console.error('Error reading messages from storage:', error);
    return [];
  }
};

export const saveMessage = (reservationId, message) => {
  try {
    const messages = getStoredMessages(reservationId);
    messages.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(`messages_${reservationId}`, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving message to storage:', error);
  }
};

export const generateAIResponse = async (message, reservationContext) => {
  // Check rate limit
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    throw new Error(`Please wait ${Math.ceil((RATE_LIMIT_MS - timeSinceLastRequest) / 1000)} seconds before generating another response`);
  }
  
  try {
    lastRequestTime = now;
    // Get base URL from environment or use default
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';
    const response = await fetch(`${API_URL}/api/messages/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        reservationContext
      })
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server is not responding with JSON. Is the server running?');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate message');
    }

    const data = await response.json();
    if (!data.response) {
      throw new Error('Invalid response format from server');
    }
    return data.response;
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to the server. Please ensure the server is running.');
    }
    console.error('Error generating message:', error.message);
    throw error;
  }
}; 