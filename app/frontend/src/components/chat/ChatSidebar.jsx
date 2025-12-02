import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, User, Moon, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '../../utils';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';

export default function ChatSidebar({
  conversations,
  currentConversation,
  onSelectConversation,
  onNewChat,
  user,
  isOpen,
  onToggle
}) {
  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          'w-80 bg-slate-900/50 backdrop-blur-sm border-r border-purple-400/20 flex flex-col transition-transform duration-300',
          'fixed lg:relative inset-y-0 left-0 z-40',
          !isOpen && '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-400/20">
          <div className="flex items-center gap-3 mb-6">
            <Moon className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              MIRA
            </h1>
          </div>
          <Button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {(Array.isArray(conversations) ? conversations : []).map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={cn(
                'w-full text-left p-3 rounded-lg transition-all',
                'hover:bg-purple-500/20',
                currentConversation?.id === conversation.id
                  ? 'bg-purple-500/30 border border-purple-400/40'
                  : 'bg-white/5 border border-transparent'
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm text-purple-100 truncate">
                  {conversation.metadata?.name || 'Chat'}
                </span>
              </div>
              <div className="text-xs text-purple-300/60 mt-1">
                {new Date(conversation.created_date).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>

        {/* User section */}
        <div className="p-4 border-t border-purple-400/20">
          <Link to={createPageUrl('Profile')}>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-purple-500/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-purple-100">{user?.first_name} {user?.last_name}</div>
                <div className="text-xs text-purple-300/60">{user?.user_email}</div>
              </div>
            </button>
          </Link>
          <Button
            onClick={() => apiClient.auth.logout()}
            variant="ghost"
            className="w-full mt-2 text-purple-300 hover:text-purple-100 hover:bg-purple-500/20"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}