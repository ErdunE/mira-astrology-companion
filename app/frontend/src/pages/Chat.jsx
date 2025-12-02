import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api/apiClient';
import { cognitoAuth } from '@/services/cognitoAuth';
import { createPageUrl } from '../utils';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatArea from '../components/chat/ChatArea';
import VisualizationArea from '../components/chat/VisualizationArea';

export default function Chat() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Check if cached profile belongs to current user and is valid
   */
  const isValidCachedProfile = () => {
    try {
      const cachedProfile = localStorage.getItem('user_profile');
      const profileCheckTime = localStorage.getItem('profile_check_time');
      const cachedUserId = localStorage.getItem('profile_user_id');
      const currentUser = cognitoAuth.getCurrentUser();
      
      if (!cachedProfile || !profileCheckTime) return null;
      
      // Check if cache belongs to current user
      if (cachedUserId && currentUser?.sub && cachedUserId !== currentUser.sub) {
        console.log('🔄 Cache belongs to different user - need fresh profile');
        return null;
      }
      
      // Check if cache is still valid (5 minutes)
      const fiveMinutes = 5 * 60 * 1000;
      const timeSinceCheck = Date.now() - parseInt(profileCheckTime);
      if (timeSinceCheck >= fiveMinutes) {
        console.log('⏰ Cache expired');
        return null;
      }
      
      const profile = JSON.parse(cachedProfile);
      if (profile?.birth_date) {
        return profile;
      }
      
      return null;
    } catch (e) {
      console.error('Error checking cached profile:', e);
      return null;
    }
  };
  
  /**
   * Clear profile cache
   */
  const clearProfileCache = () => {
    localStorage.removeItem('user_profile');
    localStorage.removeItem('profile_check_time');
    localStorage.removeItem('profile_user_id');
  };
  
  /**
   * Cache user profile with user ID
   */
  const cacheUserProfile = (profile) => {
    const currentUser = cognitoAuth.getCurrentUser();
    localStorage.setItem('user_profile', JSON.stringify(profile));
    localStorage.setItem('profile_check_time', Date.now().toString());
    localStorage.setItem('profile_user_id', currentUser?.sub || '');
  };

  useEffect(() => {
    // First check if user is authenticated
    if (!cognitoAuth.isAuthenticated()) {
      console.warn('User not authenticated, redirecting to login');
      window.location.href = '/';
      return;
    }

    const init = async () => {
      try {
        // First check localStorage cache for faster initial load
        let userProfile = isValidCachedProfile();
        
        if (userProfile) {
          console.log('✅ Using cached profile for Chat');
        }
        
        // If no valid cache, try to fetch from API
        if (!userProfile) {
          try {
            console.log('🔍 Fetching profile from API...');
            userProfile = await apiClient.profile.get();
            
            if (userProfile && userProfile.birth_date) {
              // Cache the profile with user ID
              cacheUserProfile(userProfile);
              console.log('✅ Profile fetched and cached');
            }
          } catch (profileError) {
            // 404 means no profile - redirect to onboarding
            if (profileError.status === 404) {
              console.log('📝 No profile found (404) - redirecting to onboarding');
              clearProfileCache();
              window.location.href = createPageUrl('Onboarding');
              return;
            }
            // 500 or other errors - if we have no valid cache, redirect to onboarding
            console.warn('⚠️ Could not fetch profile:', profileError);
            clearProfileCache();
            console.log('Redirecting to onboarding to verify/create profile');
            window.location.href = createPageUrl('Onboarding');
            return;
          }
        }
        
        // If still no profile, redirect to onboarding
        if (!userProfile || !userProfile.birth_date) {
          console.log('📝 No valid profile - redirecting to onboarding');
          clearProfileCache();
          window.location.href = createPageUrl('Onboarding');
          return;
        }

        setUser(userProfile);

        // Load conversations
        try {
          const convos = await apiClient.agents.listConversations({
            agent_name: 'mira'
          });
          setConversations(convos);

          // Check for conversation ID in URL
          const urlParams = new URLSearchParams(window.location.search);
          const conversationId = urlParams.get('conversation');

          if (conversationId) {
            const convo = await apiClient.agents.getConversation(conversationId);
            setCurrentConversation(convo);
            setMessages(convo.messages || []);
          } else if (convos.length > 0) {
            // Load the most recent conversation
            const latest = convos[0];
            const convo = await apiClient.agents.getConversation(latest.id);
            setCurrentConversation(convo);
            setMessages(convo.messages || []);
          }
        } catch (convError) {
          console.log('Could not load conversations:', convError);
          setConversations([]);
        }

        setLoading(false);
      } catch (error) {
        console.log('Backend not available - using mock data for development');
        // If backend is not ready, try to use cached/local data for development
        const cachedProfile = localStorage.getItem('user_profile');
        if (cachedProfile) {
          try {
            setUser(JSON.parse(cachedProfile));
          } catch (e) {
            setUser({ first_name: 'User', user_email: 'user@example.com' });
          }
        } else {
          setUser({ first_name: 'User', user_email: 'user@example.com' });
        }
        
        // Check for conversation ID in URL
        const urlParams = new URLSearchParams(window.location.search);
        const conversationId = urlParams.get('conversation');
        
        if (conversationId) {
          setCurrentConversation({ 
            id: conversationId, 
            agent_name: 'mira',
            messages: []
          });
        }
        
        setConversations([]);
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      const unsubscribe = apiClient.agents.subscribeToConversation(
        currentConversation.id,
        (data) => {
          setMessages(data.messages || []);
        }
      );
      return () => unsubscribe();
    }
  }, [currentConversation]);

  const handleNewChat = async () => {
    try {
      const newConversation = await apiClient.agents.createConversation({
        agent_name: 'mira',
        metadata: { name: 'New Chat' }
      });
      
      const convos = await apiClient.agents.listConversations({
        agent_name: 'mira'
      });
      setConversations(convos);
      setCurrentConversation(newConversation);
      setMessages([]);
      
      window.history.pushState({}, '', createPageUrl('Chat') + '?conversation=' + newConversation.id);
    } catch (error) {
      console.log('Backend not available - creating mock conversation');
      // Create mock conversation for development
      const mockConversation = {
        id: 'dev-conversation-' + Date.now(),
        agent_name: 'mira',
        metadata: { name: 'New Chat' },
        messages: []
      };
      setCurrentConversation(mockConversation);
      setMessages([]);
      window.history.pushState({}, '', createPageUrl('Chat') + '?conversation=' + mockConversation.id);
    }
  };

  const handleSelectConversation = async (conversation) => {
    try {
      const convo = await apiClient.agents.getConversation(conversation.id);
      setCurrentConversation(convo);
      setMessages(convo.messages || []);
      window.history.pushState({}, '', createPageUrl('Chat') + '?conversation=' + conversation.id);
    } catch (error) {
      console.log('Backend not available');
      setCurrentConversation(conversation);
      setMessages([]);
      window.history.pushState({}, '', createPageUrl('Chat') + '?conversation=' + conversation.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        user={user}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex overflow-hidden">
        <ChatArea
          conversation={currentConversation}
          messages={messages}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Visualization area */}
        <VisualizationArea />
      </div>
    </div>
  );
}