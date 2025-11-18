import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Menu, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";

export default function ChatArea({ conversation, profile, onToggleMobileNav }) {
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
      
      // Subscribe to updates
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
      
      // Add context about the user's profile
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

      // Update conversation title if it's the first message
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

  return (
    <div className="h-full flex flex-col backdrop-blur-xl bg-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/20 backdrop-blur-md bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMobileNav}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-white font-semibold">
                {conversation?.title || "New Reading"}
              </h2>
              {profile && (
                <p className="text-white/60 text-sm">{profile.profile_name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Start Your Cosmic Journey
              </h3>
              <p className="text-white/70">
                Ask Mira about your birth chart, daily guidance, or any astrological insights.
              </p>
            </div>
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

      {/* Input */}
      <div className="p-4 border-t border-white/20 backdrop-blur-md bg-white/5">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Mira anything about your cosmic journey..."
            className="min-h-[60px] max-h-32 bg-white/10 border-white/30 text-white placeholder:text-white/50 backdrop-blur-md resize-none"
            disabled={!conversation || isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !conversation || isSending}
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-6"
          >
            {isSending ? (
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