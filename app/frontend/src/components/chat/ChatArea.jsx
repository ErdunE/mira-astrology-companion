import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function ChatArea({ 
  conversation, 
  messages, 
  onNewChat, 
  onSendMessage,
  isLoading,
  onToggleSidebar 
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    onSendMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // When there's no conversation, show welcome screen
  if (!conversation && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
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
          <div className="w-10" />
        </div>
        
        {/* Welcome content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-8">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-purple-200 mb-2">Start a New Journey</h2>
            <p className="text-purple-300/60 max-w-md">
              Ask about your birth chart, compatibility, daily guidance, or any astrological insights.
            </p>
          </div>
          
          {/* Quick start input */}
          <div className="w-full max-w-lg">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/20">
              <div className="flex gap-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask MIRA anything about astrology..."
                  className="flex-1 bg-white/10 border-purple-400/30 text-white placeholder:text-purple-300/50 resize-none min-h-[80px] max-h-[200px]"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 px-6"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with chat history icon */}
      <div className="p-4 border-b border-purple-400/20 flex items-center justify-between shrink-0">
        <Button
          onClick={onToggleSidebar}
          variant="ghost"
          size="icon"
          className="text-purple-200 hover:text-purple-100 hover:bg-purple-500/20"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
        <h2 className="text-purple-200 font-semibold truncate px-4">
          {conversation?.title || 'MIRA'}
        </h2>
        <div className="w-10" />
      </div>
      
      {/* Messages area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
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
              <MessageBubble 
                key={`${message.timestamp}-${index}`} 
                message={message}
                isPending={message._pending}
              />
            ))}
            
            {/* Loading indicator for AI response */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">M</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-purple-400/30 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="text-purple-200 text-sm">MIRA is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-6 border-t border-purple-400/20 bg-slate-900/30 backdrop-blur-sm shrink-0">
        <div className="flex gap-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask MIRA anything about astrology..."
            className="flex-1 bg-white/10 border-purple-400/30 text-white placeholder:text-purple-300/50 resize-none min-h-[60px] max-h-[200px]"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 px-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
