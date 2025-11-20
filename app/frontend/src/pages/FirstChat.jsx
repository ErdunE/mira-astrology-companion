import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api/apiClient';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Moon } from 'lucide-react';
import MessageBubble from '../components/chat/MessageBubble';

export default function FirstChat() {
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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

        // Create a new conversation
        const newConversation = await apiClient.agents.createConversation({
          agent_name: 'mira',
          metadata: { name: 'First Chat with MIRA' }
        });
        setConversation(newConversation);
      } catch (error) {
        console.log('Backend not available - using mock data for development');
        // If backend is not ready, use mock data for development
        const devProfile = localStorage.getItem('dev_profile');
        if (devProfile) {
          setUser(JSON.parse(devProfile));
        } else {
          setUser({ first_name: 'User', user_email: 'user@example.com' });
        }
        // Create mock conversation
        setConversation({ 
          id: 'dev-conversation-1', 
          agent_name: 'mira',
          messages: []
        });
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (conversation) {
      const unsubscribe = apiClient.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages || []);
      });
      return () => unsubscribe();
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    try {
      await apiClient.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });

      // After first message, redirect to main chat
      setTimeout(() => {
        window.location.href = createPageUrl('Chat') + '?conversation=' + conversation.id;
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      console.log('Backend not available - message will be sent once backend is ready');
      // For development without backend, show a mock response
      alert('Backend not connected yet!\n\nYour message: "' + userMessage + '"\n\nConnect your AWS backend to get AI responses.\nSee API_DOCUMENTATION.md for details.');
      setIsLoading(false);
      // Still redirect to chat page for development
      setTimeout(() => {
        window.location.href = createPageUrl('Chat') + '?conversation=' + conversation.id;
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <div className="w-1 h-1 bg-white rounded-full opacity-60" />
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Moon className="w-12 h-12 text-purple-300" />
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                Hello, {user?.first_name}
              </h1>
              <Sparkles className="w-12 h-12 text-purple-300" />
            </div>
            <p className="text-xl text-purple-200/80 max-w-2xl mx-auto">
              I'm MIRA, your cosmic companion. Ask me anything about astrology,
              your birth chart, compatibility, or seek guidance from the stars.
            </p>
          </div>
        )}

        {/* Chat container */}
        <div className="w-full max-w-2xl flex flex-col justify-center">
          {/* Messages */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto mb-6 space-y-4 px-4">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input area */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30 shadow-2xl">
            <div className="flex gap-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your cosmic journey..."
                className="flex-1 bg-white/10 border-purple-400/30 text-white placeholder:text-purple-300/50 resize-none min-h-[120px]"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 h-full px-8"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}