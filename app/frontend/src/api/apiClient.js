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
        
        // For 404, return the error response body instead of throwing
        if (response.status === 404) {
          const errorData = await response.json().catch(() => ({ error: 'Not found' }));
          const error = new Error('Not found');
          error.status = 404;
          error.data = errorData;
          throw error;
        }
        
        // For other errors, try to get error details from response
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        const error = new Error(JSON.stringify(errorData));
        error.status = response.status;
        error.data = errorData;
        throw error;
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
  profile = {
    // Create a new user profile (POST /profile)
    // Backend returns: {"message": "...", "profile": {...}}
    create: async (data) => {
      const response = await this.request('/profile', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return this._unwrapLambdaResponse(response);
    },
    
    // Get user profile (GET /profile)
    // Backend returns: {"profile": {...}} - we unwrap it for convenience
    // Note: Sometimes API Gateway returns raw Lambda format with statusCode/body
    get: async () => {
      const response = await this.request('/profile', {
        method: 'GET',
      });
      
      // Handle raw Lambda response format (statusCode + body as string)
      const unwrapped = this._unwrapLambdaResponse(response);
      
      // Unwrap the profile from the response
      return unwrapped.profile || unwrapped;
    },
    
    // Update user profile (PUT /profile)
    update: async (data) => {
      const response = await this.request('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return this._unwrapLambdaResponse(response);
    },
  };
  
  /**
   * Helper to unwrap raw Lambda response format.
   * Sometimes API Gateway returns: {"statusCode": 200, "body": "{...json string...}"}
   * This helper detects and parses such responses.
   */
  _unwrapLambdaResponse(response) {
    // Check if response is in raw Lambda format (has statusCode and body as string)
    if (response && typeof response.statusCode === 'number' && typeof response.body === 'string') {
      try {
        console.log('📦 Unwrapping raw Lambda response format');
        return JSON.parse(response.body);
      } catch (e) {
        console.warn('Failed to parse Lambda response body:', e);
        return response;
      }
    }
    return response;
  }

  // Legacy User Profile endpoints (kept for backward compatibility)
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
      const response = await this.request(`/conversations?agent_name=${agent_name}`);
      const unwrapped = this._unwrapLambdaResponse(response);
      // Return the conversations array or empty array
      return unwrapped.conversations || unwrapped || [];
    },
    
    getConversation: async (conversationId) => {
      const response = await this.request(`/conversations/${conversationId}`);
      return this._unwrapLambdaResponse(response);
    },
    
    createConversation: async ({ agent_name, metadata }) => {
      const response = await this.request('/conversations', {
        method: 'POST',
        body: JSON.stringify({ agent_name, metadata }),
      });
      return this._unwrapLambdaResponse(response);
    },
    
    addMessage: async (conversation, message) => {
      const response = await this.request(`/conversations/${conversation.id}/messages`, {
        method: 'POST',
        body: JSON.stringify(message),
      });
      return this._unwrapLambdaResponse(response);
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

