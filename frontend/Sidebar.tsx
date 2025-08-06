import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MessageSquare, Trash2, X, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Conversation } from "~backend/chat/types";

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: number | null;
  onConversationSelect: (id: number) => void;
  onNewConversation: () => void;
  onConversationDeleted: (id: number) => void;
  onConversationsUpdate: (conversations: Conversation[]) => void;
  onApiKeyClick: () => void;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({
  conversations,
  selectedConversationId,
  onConversationSelect,
  onNewConversation,
  onConversationDeleted,
  onConversationsUpdate,
  onApiKeyClick,
  onClose,
  isMobile,
}: SidebarProps) {
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleDeleteConversation = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      onConversationDeleted(conversationId);
      toast({
        title: "Success",
        description: "Conversation deleted",
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const handleClearAllHistory = () => {
    try {
      // Clear all conversations
      onConversationsUpdate([]);
      
      // Clear all messages from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('captgpt-messages-')) {
          localStorage.removeItem(key);
        }
      });
      
      setShowClearDialog(false);
      
      toast({
        title: "Success",
        description: "All chat history cleared",
      });
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`${isMobile ? 'w-80' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            CaptGPT
          </h1>
          {isMobile && (
            <Button variant="ghost" size="sm" className="p-1" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedConversationId === conversation.id ? "bg-purple-50 border border-purple-200" : ""
              }`}
              onClick={() => onConversationSelect(conversation.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm truncate">{conversation.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-red-100"
                onClick={(e) => handleDeleteConversation(conversation.id, e)}
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Button
            onClick={onApiKeyClick}
            variant="ghost"
            className="flex-1 justify-start gap-2 hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
            API Settings
          </Button>
          <Button
            onClick={() => setShowClearDialog(true)}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-red-100 hover:text-red-600"
            title="Clear all chat history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Clear History Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your conversations and messages from local storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllHistory}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Clear All History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
