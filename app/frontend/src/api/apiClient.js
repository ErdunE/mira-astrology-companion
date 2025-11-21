// API Client - Configured via environment variables
import config from '../config/env.js';

const BASE_URL = config.api.baseUrl;

class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
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
          // Handle unauthorized - redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/landing';
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
    
    login: async (email, password) => {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      return data;
    },
    
    signup: async (email, password, name) => {
      const data = await this.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      return data;
    },
    
    logout: () => {
      localStorage.removeItem('auth_token');
      window.location.href = '/landing';
    },
    
    redirectToLogin: (returnUrl) => {
      localStorage.setItem('return_url', returnUrl || window.location.pathname);
      window.location.href = '/landing';
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

