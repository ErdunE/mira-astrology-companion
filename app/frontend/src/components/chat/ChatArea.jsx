import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, MessageSquare } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function ChatArea({ conversation, messages, onNewChat, onToggleSidebar }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
    } catch (error) {
      console.error('Error sending message:', error);
      console.log('Backend not available - message will be sent once backend is ready');
      alert('Backend not connected yet!\n\nYour message: "' + userMessage + '"\n\nConnect your AWS backend to get AI responses.\nSee API_DOCUMENTATION.md for backend setup details.');
    } finally {
      setIsLoading(false);
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
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Sparkles className="w-16 h-16 text-purple-400 mb-4" />
        <h2 className="text-2xl font-semibold text-purple-200 mb-2">Start a New Journey</h2>
        <p className="text-purple-300/60 mb-6">Begin a conversation with MIRA</p>
        <Button
          onClick={onNewChat}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="w-96 flex flex-col overflow-hidden border-r border-purple-400/20">
      {/* Header with chat history icon */}
      <div className="p-4 border-b border-purple-400/20 flex items-center justify-between">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon"
          className="text-purple-200 hover:text-purple-100 hover:bg-purple-500/20"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
        <h2 className="text-purple-200 font-semibold">MIRA</h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mb-4" />
            <h2 className="text-xl font-semibold text-purple-200 mb-2">
              What would you like to explore?
            </h2>
            <p className="text-purple-300/60 max-w-md">
              Ask about your birth chart, compatibility, daily guidance, or any astrological insights.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-6 border-t border-purple-400/20 bg-slate-900/30 backdrop-blur-sm">
        <div className="flex gap-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask MIRA anything about astrology..."
            className="flex-1 bg-white/10 border-purple-400/30 text-white placeholder:text-purple-300/50 resize-none min-h-[60px] max-h-[200px]"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}