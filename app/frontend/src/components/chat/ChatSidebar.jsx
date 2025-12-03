import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, User, Moon, Menu, X, Trash2, Pencil, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '../../utils';
import { Link } from 'react-router-dom';
import { cognitoAuth } from '@/services/cognitoAuth';

export default function ChatSidebar({
  conversations,
  currentConversation,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onUpdateTitle,
  user,
  isOpen,
  onToggle
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleLogout = () => {
    cognitoAuth.logout();
  };

  const handleDelete = (e, conversationId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      onDeleteConversation?.(conversationId);
    }
  };

  const handleStartEdit = (e, conversation) => {
    e.stopPropagation();
    setEditingId(conversation.conversation_id);
    setEditValue(conversation.title || 'New Chat');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = async (e) => {
    e?.stopPropagation();
    
    if (!editValue.trim() || !editingId) {
      handleCancelEdit();
      return;
    }

    setIsSaving(true);
    const success = await onUpdateTitle?.(editingId, editValue.trim());
    setIsSaving(false);

    if (success) {
      handleCancelEdit();
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      return '';
    }
  };

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
          {(!conversations || conversations.length === 0) ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
              <p className="text-purple-300/50 text-sm">No conversations yet</p>
              <p className="text-purple-300/30 text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            (Array.isArray(conversations) ? conversations : []).map((conversation) => {
              const isActive = currentConversation?.conversation_id === conversation.conversation_id;
              const isEditing = editingId === conversation.conversation_id;
              
              return (
                <div
                  key={conversation.conversation_id}
                  className={cn(
                    'group relative w-full text-left p-3 rounded-lg transition-all cursor-pointer',
                    'hover:bg-purple-500/20',
                    isActive
                      ? 'bg-purple-500/30 border border-purple-400/40'
                      : 'bg-white/5 border border-transparent'
                  )}
                  onClick={() => !isEditing && onSelectConversation(conversation)}
                >
                  <div className="flex items-center gap-2 pr-16">
                    <MessageSquare className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        onBlur={handleSaveEdit}
                        onClick={(e) => e.stopPropagation()}
                        disabled={isSaving}
                        className={cn(
                          'flex-1 text-sm text-purple-100 bg-purple-900/50 border border-purple-400/50 rounded px-2 py-0.5',
                          'focus:outline-none focus:ring-1 focus:ring-purple-400',
                          isSaving && 'opacity-50'
                        )}
                        maxLength={100}
                      />
                    ) : (
                      <span className="text-sm text-purple-100 truncate">
                        {conversation.title || 'New Chat'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-purple-300/60">
                      {formatDate(conversation.updated_at || conversation.created_at)}
                    </span>
                    {conversation.message_count > 0 && (
                      <span className="text-xs text-purple-300/40">
                        {conversation.message_count} message{conversation.message_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  {!isEditing && (
                    <div className={cn(
                      'absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5',
                      'opacity-0 group-hover:opacity-100 transition-opacity'
                    )}>
                      {/* Edit button */}
                      {onUpdateTitle && (
                        <button
                          onClick={(e) => handleStartEdit(e, conversation)}
                          className={cn(
                            'p-1.5 rounded',
                            'text-purple-300/50 hover:text-purple-200 hover:bg-purple-500/20'
                          )}
                          title="Edit title"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {/* Delete button */}
                      {onDeleteConversation && (
                        <button
                          onClick={(e) => handleDelete(e, conversation.conversation_id)}
                          className={cn(
                            'p-1.5 rounded',
                            'text-purple-300/50 hover:text-red-400 hover:bg-red-500/20'
                          )}
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Save indicator when editing */}
                  {isEditing && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className={cn(
                          'p-1.5 rounded',
                          'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                        )}
                        title="Save (Enter)"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* User section */}
        <div className="p-4 border-t border-purple-400/20">
          <Link to={createPageUrl('Profile')}>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-purple-500/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-sm font-medium text-purple-100 truncate">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-purple-300/60 truncate">
                  {user?.user_email || user?.email}
                </div>
              </div>
            </button>
          </Link>
          <Button
            onClick={handleLogout}
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
