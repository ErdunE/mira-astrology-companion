import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api/apiClient';
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

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await apiClient.auth.me();

        // Check if user has profile
        const profiles = await apiClient.entities.UserProfile.filter({
          user_email: currentUser.email
        });

        if (profiles.length === 0) {
          window.location.href = createPageUrl('Onboarding');
          return;
        }

        setUser(profiles[0]); // Use profile instead of auth user

        // Load conversations
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

        setLoading(false);
      } catch (error) {
        console.log('Backend not available - using mock data for development');
        // If backend is not ready, use mock data for development
        const devProfile = localStorage.getItem('dev_profile');
        if (devProfile) {
          setUser(JSON.parse(devProfile));
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