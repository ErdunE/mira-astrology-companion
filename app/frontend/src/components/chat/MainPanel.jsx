import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Menu, Loader2, Sparkles, MessageSquare, Moon, Sun, Star } from "lucide-react";
import MessageBubble from "./MessageBubble";
import VisualizationPanel from "./VisualizationPanel";

export default function MainPanel({ conversation, profile, onToggleMobileNav }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation?.agent_conversation_id) {
      loadConversation();
    } else {
      setMessages([]);
    }
  }, [conversation]);

  const loadConversation = async () => {
    if (!conversation?.agent_conversation_id) return;
    
    try {
      const agentConv = await base44.agents.getConversation(conversation.agent_conversation_id);
      setMessages(agentConv.messages || []);
      
      const unsubscribe = base44.agents.subscribeToConversation(
        conversation.agent_conversation_id,
        (data) => {
          setMessages(data.messages || []);
          scrollToBottom();
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation?.agent_conversation_id || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    try {
      const agentConv = await base44.agents.getConversation(conversation.agent_conversation_id);
      
      let contextMessage = userMessage;
      if (profile && messages.length === 0) {
        contextMessage = `User Profile: ${profile.full_name}, born on ${profile.birth_date}${
          profile.birth_time ? ` at ${profile.birth_time}` : ""
        }${profile.birth_place ? ` in ${profile.birth_place}` : ""}. ${
          profile.sun_sign ? `Sun sign: ${profile.sun_sign}.` : ""
        } ${profile.moon_sign ? `Moon sign: ${profile.moon_sign}.` : ""} ${
          profile.rising_sign ? `Rising sign: ${profile.rising_sign}.` : ""
        }\n\nUser question: ${userMessage}`;
      }

      await base44.agents.addMessage(agentConv, {
        role: "user",
        content: contextMessage
      });

      if (messages.length === 0) {
        await base44.entities.Conversation.update(conversation.id, {
          title: userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : ""),
          last_message: userMessage
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!profile) {
    return (
      <div className="h-full backdrop-blur-xl bg-white/5 flex items-center justify-center">
        <p className="text-white/50 text-center">Select a profile to begin</p>
      </div>
    );
  }

  return (
    <div className="h-full flex backdrop-blur-xl bg-white/5">
      {/* Left Side - Chat Messages (Slim Column) */}
      <div className="w-96 flex flex-col border-r border-white/10 backdrop-blur-md bg-white/5">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMobileNav}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">
                {conversation?.title || "New Reading"}
              </h3>
              <p className="text-white/60 text-xs truncate">{profile.profile_name}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/50 text-sm">
                  Start a conversation with Mira
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} compact />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Mira..."
              className="min-h-[50px] max-h-24 bg-white/5 border-white/20 text-white text-sm placeholder:text-white/40 backdrop-blur-md resize-none focus:border-blue-400/50"
              disabled={!conversation || isSending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || !conversation || isSending}
              size="icon"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-[50px] w-[50px] flex-shrink-0 shadow-lg shadow-blue-500/30"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Visualizations (Takes up most space) */}
      <div className="flex-1 overflow-y-auto">
        <VisualizationPanel 
          profile={profile} 
          conversation={conversation}
        />
      </div>
    </div>
  );
}