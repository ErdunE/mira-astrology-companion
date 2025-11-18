import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, User, LogOut, Settings, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ProfileForm from "../onboarding/ProfileForm";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function ConversationList({
  profiles,
  selectedProfile,
  onProfileChange,
  conversations,
  selectedConversation,
  onConversationSelect,
  onNewChat,
  onRefresh
}) {
  const navigate = useNavigate();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleNewProfile = () => {
    setEditingProfile(null);
    setShowProfileForm(true);
  };

  const handleProfileFormComplete = () => {
    setShowProfileForm(false);
    setEditingProfile(null);
    onRefresh();
  };

  return (
    <>
      <div className="h-full backdrop-blur-xl bg-white/5 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Mira</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#16213e]/95 backdrop-blur-xl border-white/10 text-white">
                <DropdownMenuItem onClick={handleNewProfile} className="hover:bg-white/10">
                  <Plus className="w-4 h-4 mr-2" />
                  New Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Profile Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="truncate">{selectedProfile?.profile_name || "Select Profile"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 bg-[#16213e]/95 backdrop-blur-xl border-white/10 text-white">
              {profiles.map((profile) => (
                <DropdownMenuItem
                  key={profile.id}
                  onClick={() => onProfileChange(profile)}
                  className="hover:bg-white/10"
                >
                  <div>
                    <div className="font-medium">{profile.profile_name}</div>
                    <div className="text-xs text-white/60">{profile.full_name}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New Chat Button */}
          <Button
            onClick={onNewChat}
            className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border border-white/20 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Reading
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center text-white/40 text-sm mt-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              No conversations yet. Start a new reading!
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onConversationSelect(conv)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedConversation?.id === conv.id
                    ? "bg-white/10 border border-blue-400/30 shadow-lg shadow-blue-500/10"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                } backdrop-blur-md`}
              >
                <div className="font-medium text-white text-sm mb-1 truncate">
                  {conv.title}
                </div>
                {conv.last_message && (
                  <div className="text-xs text-white/50 truncate">
                    {conv.last_message}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Profile Form Dialog */}
      <Dialog open={showProfileForm} onOpenChange={setShowProfileForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-transparent border-none p-0">
          <ProfileForm
            editingProfile={editingProfile}
            onComplete={handleProfileFormComplete}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}