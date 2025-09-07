/**
 * API service for communicating with the psychological advisor backend
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Send a message to the psychological advisor
 * @param {string} message - User message
 * @param {string|null} sessionId - Session ID for conversation continuity
 * @returns {Promise<{response: string, sessionId: string}>}
 */
export const sendMessage = async (message, sessionId = null) => {
  try {
    const response = await apiClient.post('/chat/message', {
      message,
      session_id: sessionId,
    });
    
    // Convert snake_case to camelCase for frontend
    const data = response.data;
    return {
      response: data.response,
      sessionId: data.session_id, // Convert snake_case to camelCase
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(
      error.response?.data?.detail || 
      'Failed to send message. Please try again.'
    );
  }
};

/**
 * Create a new conversation session
 * @returns {Promise<{sessionId: string}>}
 */
export const createNewSession = async () => {
  try {
    const response = await apiClient.post('/chat/session/new');
    return response.data;
  } catch (error) {
    console.error('Error creating new session:', error);
    throw new Error('Failed to create new session');
  }
};

/**
 * Get conversation history for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<{sessionId: string, messages: Array, createdAt: string}>}
 */
export const getConversationHistory = async (sessionId) => {
  try {
    const response = await apiClient.get(`/chat/session/${sessionId}/history`);
    return response.data;
  } catch (error) {
    console.error('Error getting conversation history:', error);
    throw new Error('Failed to get conversation history');
  }
};

/**
 * End a conversation session
 * @param {string} sessionId - Session ID
 * @returns {Promise<{message: string}>}
 */
export const endSession = async (sessionId) => {
  try {
    const response = await apiClient.delete(`/chat/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error ending session:', error);
    throw new Error('Failed to end session');
  }
};

/**
 * Health check endpoint
 * @returns {Promise<Object>}
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health', {
      baseURL: 'http://localhost:8000', // Direct health check
    });
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw new Error('Backend service is not available');
  }
};
