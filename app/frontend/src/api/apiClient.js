// API Client - Configured via environment variables
import config from '../config/env.js';
import { cognitoAuth } from '../services/cognitoAuth.js';

const BASE_URL = config.api.baseUrl;

class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  async request(endpoint, options = {}) {
    // Get token from Cognito auth service
    const authHeader = cognitoAuth.getAuthHeader();
    const headers = {
      'Content-Type': 'application/json',
      ...(authHeader && { Authorization: authHeader }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - clear session and redirect to login
          cognitoAuth.clearSession();
          window.location.href = '/';
          throw new Error('Unauthorized');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  auth = {
    me: async () => {
      return this.request('/auth/me');
    },
    
    // Note: Login/signup now handled by Cognito Hosted UI
    // These methods are kept for backward compatibility but will use Cognito
    login: async () => {
      console.warn('Direct login deprecated - use Cognito Hosted UI via cognitoAuth.login()');
      cognitoAuth.login();
    },
    
    signup: async () => {
      console.warn('Direct signup deprecated - use Cognito Hosted UI via cognitoAuth.signup()');
      cognitoAuth.signup();
    },
    
    logout: () => {
      cognitoAuth.logout();
    },
    
    redirectToLogin: (returnUrl) => {
      if (returnUrl) {
        localStorage.setItem('return_url', returnUrl);
      }
      window.location.href = '/';
    },
  };

  // User Profile endpoints
  entities = {
    UserProfile: {
      filter: async (filters) => {
        const params = new URLSearchParams(filters);
        return this.request(`/profiles?${params}`);
      },
      
      create: async (data) => {
        return this.request('/profiles', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },
      
      update: async (id, data) => {
        return this.request(`/profiles/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      },
      
      delete: async (id) => {
        return this.request(`/profiles/${id}`, {
          method: 'DELETE',
        });
      },
    },
  };

  // Agent/Chat endpoints
  agents = {
    listConversations: async ({ agent_name }) => {
      return this.request(`/conversations?agent_name=${agent_name}`);
    },
    
    getConversation: async (conversationId) => {
      return this.request(`/conversations/${conversationId}`);
    },
    
    createConversation: async ({ agent_name, metadata }) => {
      return this.request('/conversations', {
        method: 'POST',
        body: JSON.stringify({ agent_name, metadata }),
      });
    },
    
    addMessage: async (conversation, message) => {
      return this.request(`/conversations/${conversation.id}/messages`, {
        method: 'POST',
        body: JSON.stringify(message),
      });
    },
    
    subscribeToConversation: (conversationId, callback) => {
      // WebSocket or SSE connection for real-time updates
      // This is a placeholder - implement based on your AWS backend setup
      const wsUrl = config.api.websocketUrl || BASE_URL.replace('http', 'ws');
      const ws = new WebSocket(`${wsUrl}/conversations/${conversationId}/subscribe`);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(data);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      // Return unsubscribe function
      return () => {
        ws.close();
      };
    },
  };
}

export const apiClient = new ApiClient();

