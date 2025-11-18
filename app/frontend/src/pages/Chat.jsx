import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ConversationList from "../components/chat/ConversationList";
import MainPanel from "../components/chat/MainPanel";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Chat() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const userProfiles = await base44.entities.Profile.filter({
        created_by: user.email
      });

      if (userProfiles.length === 0) {
        navigate(createPageUrl("Auth"));
        return;
      }

      setProfiles(userProfiles);
      
      const defaultProfile = userProfiles.find(p => p.is_default) || userProfiles[0];
      setSelectedProfile(defaultProfile);

      const allConversations = await base44.entities.Conversation.list("-updated_date");
      setConversations(allConversations);

      if (allConversations.length > 0) {
        setSelectedConversation(allConversations[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleNewChat = async () => {
    if (!selectedProfile) return;
    
    try {
      const agentConversation = await base44.agents.createConversation({
        agent_name: "mira",
        metadata: {
          profile_id: selectedProfile.id,
          profile_name: selectedProfile.profile_name
        }
      });

      const conversation = await base44.entities.Conversation.create({
        title: "New Reading",
        profile_id: selectedProfile.id,
        agent_conversation_id: agentConversation.id
      });

      setConversations(prev => [conversation, ...prev]);
      setSelectedConversation(conversation);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-b from-[#0a0e27] via-[#16213e] to-[#0f1729] flex items-center justify-center">
        <div className="text-white">Loading your cosmic journey...</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-[#0a0e27] via-[#16213e] to-[#0f1729] relative">
      {/* Stars Background */}
      <div className="fixed inset-0" style={{
        backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                         radial-gradient(2px 2px at 60% 70%, white, transparent),
                         radial-gradient(1px 1px at 50% 50%, white, transparent),
                         radial-gradient(1px 1px at 80% 10%, white, transparent),
                         radial-gradient(2px 2px at 90% 60%, white, transparent)`,
        backgroundSize: '200px 200px, 300px 300px, 250px 250px, 400px 400px, 350px 350px',
        backgroundRepeat: 'repeat',
        opacity: 0.5
      }}></div>

      {/* Glowing Orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 h-full flex">
        {/* Slim Conversation List - Left Sidebar */}
        <div className={`${showMobileNav ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0`}>
          <ConversationList
            profiles={profiles}
            selectedProfile={selectedProfile}
            onProfileChange={setSelectedProfile}
            conversations={conversations}
            selectedConversation={selectedConversation}
            onConversationSelect={setSelectedConversation}
            onNewChat={handleNewChat}
            onRefresh={loadData}
          />
        </div>

        {/* Main Panel - Takes up most of the screen */}
        <div className="flex-1 min-w-0">
          <MainPanel
            conversation={selectedConversation}
            profile={selectedProfile}
            onToggleMobileNav={() => setShowMobileNav(!showMobileNav)}
          />
        </div>
      </div>
    </div>
  );
}