import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ChatInterface } from "./components/ChatInterface";
import { Sidebar } from "./components/Sidebar";
import { ApiKeyModal } from "./components/ApiKeyModal";
import type { Conversation } from "~backend/chat/types";

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedApiKey = localStorage.getItem("openai-api-key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // Show modal but allow user to close it
      setIsApiKeyModalOpen(true);
    }

    // Load conversations from localStorage
    const savedConversations = localStorage.getItem("captgpt-conversations");
    if (savedConversations) {
      try {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);
      } catch (error) {
        console.error("Failed to parse saved conversations:", error);
      }
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("captgpt-conversations", JSON.stringify(conversations));
  }, [conversations]);

  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem("openai-api-key", key);
    } else {
      localStorage.removeItem("openai-api-key");
    }
    setIsApiKeyModalOpen(false);
  };

  const handleConversationSelect = (conversationId: number) => {
    setSelectedConversationId(conversationId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewConversation = () => {
    setSelectedConversationId(null);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleConversationCreated = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev]);
    setSelectedConversationId(conversation.id);
  };

  const handleConversationDeleted = (conversationId: number) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
    }
    
    // Also remove messages from localStorage
    localStorage.removeItem(`captgpt-messages-${conversationId}`);
  };

  const handleConversationsUpdate = (updatedConversations: Conversation[]) => {
    setConversations(updatedConversations);
  };

  return (
    <div className="flex h-screen bg-white relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Only show on desktop or when open on mobile */}
      {(!isMobile || isSidebarOpen) && (
        <div className={`
          ${isMobile 
            ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative'
          }
        `}>
          <Sidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            onConversationDeleted={handleConversationDeleted}
            onConversationsUpdate={handleConversationsUpdate}
            onApiKeyClick={() => setIsApiKeyModalOpen(true)}
            onClose={() => setIsSidebarOpen(false)}
            isMobile={isMobile}
          />
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatInterface
          conversationId={selectedConversationId}
          apiKey={apiKey}
          onConversationCreated={handleConversationCreated}
          onMenuClick={() => setIsSidebarOpen(true)}
          onSettingsClick={() => setIsApiKeyModalOpen(true)}
          isMobile={isMobile}
        />
      </div>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleApiKeySave}
        currentApiKey={apiKey}
      />

      <Toaster />
    </div>
  );
}
