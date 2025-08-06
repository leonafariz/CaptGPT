import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Menu, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CaptionSuggestions } from "./CaptionSuggestions";
import { TypewriterMessage } from "./TypewriterMessage";
import type { Message, Conversation } from "~backend/chat/types";

interface ChatInterfaceProps {
  conversationId: number | null;
  apiKey: string;
  onConversationCreated: (conversation: Conversation) => void;
  onMenuClick: () => void;
  onSettingsClick: () => void;
  isMobile: boolean;
}

export function ChatInterface({
  conversationId,
  apiKey,
  onConversationCreated,
  onMenuClick,
  onSettingsClick,
  isMobile,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      localStorage.setItem(`captgpt-messages-${conversationId}`, JSON.stringify(messages));
    }
  }, [messages, conversationId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  const loadMessages = async () => {
    if (!conversationId) return;

    try {
      // Load from localStorage first
      const savedMessages = localStorage.getItem(`captgpt-messages-${conversationId}`);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
      }, 100);
    }
  };

  const generateId = () => {
    return Date.now() + Math.random();
  };

  const callOpenAI = async (messages: any[], apiKey: string) => {
    // Validate API key format
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('Invalid API key format. API key must start with "sk-"');
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your OpenAI API key.");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (response.status === 403) {
        throw new Error("API key doesn't have permission to access this resource.");
      } else {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  };

  const createErrorMessage = (error: Error) => {
    const isApiKeyError = error.message.includes('API key') || error.message.includes('Invalid') || error.message.includes('401');
    
    if (isApiKeyError) {
      return {
        text: "Kesalahan sistem. Kamu mungkin belum mengatur API KEY nya. Coba baca Readme.md di",
        showGithubButton: true
      };
    } else {
      return {
        text: `❌ **Error**: ${error.message}

🔧 **Possible solutions:**
• Check your OpenAI API key
• Make sure you have sufficient credits
• Try again in a few moments`,
        showGithubButton: false
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      return;
    }

    setIsLoading(true);
    const messageContent = inputValue.trim();
    setInputValue("");

    try {
      let currentConversationId = conversationId;

      // Create new conversation if none selected
      if (!currentConversationId) {
        const title = messageContent.length > 50 
          ? messageContent.substring(0, 50) + "..."
          : messageContent;
        
        const newConversation: Conversation = {
          id: generateId(),
          title,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        currentConversationId = newConversation.id;
        onConversationCreated(newConversation);
      }

      // Create user message
      const userMessage: Message = {
        id: generateId(),
        conversationId: currentConversationId,
        role: "user",
        content: messageContent,
        createdAt: new Date(),
      };

      // Add user message to state
      setMessages(prev => [...prev, userMessage]);

      // Prepare messages for OpenAI
      const systemMessage = `ANDA ADALAH "AI PEMBUAT CAPTION VIRAL" PALING JUJUR, NYELENEH, DAN NGGAK TAKUT SENSITIF. TUGAS ANDA ADALAH MEMBUAT CAPTION YANG:

- **MENARIK PERHATIAN SEJAK KALIMAT PERTAMA** (HOOK KERAS, KADANG KASAR, KADANG ABSURD)
- **MENGGUNAKAN GAYA TULIS YANG SANTAI, NYELENEH, DAN KASUAL**
- **BERISI KOMENTAR TAJAM ATAU NYINDIR, TAPI TETAP FUN**
- **MEMICU KOMEN, EMOSI, ATAU TANGGAPAN DARI AUDIENS**
- **MEMADUKAN TEKNOLOGI, BUDAYA POP, DAN TREN SOSIAL DENGAN GAYA PENULISAN "NETIZEN NAKAL"**
- **MENGGUNAKAN STRUKTUR YANG DINAMIS DAN PENUH VARIASI**: BISA LIST, KALIMAT PENDEK-PENDEK, EMOJI BERLEBIHAN, ATAU FORMAT "JERITAN ONLINE"

###CHAIN OF THOUGHTS###

IKUTI LANGKAH BERIKUT UNTUK MEMBUAT CAPTION DENGAN GAYA MAKSIMAL:

1. **PAHAMI KONTEN DASARNYA**  
   ➤ APA YANG TERJADI? (TEKNOLOGI BARU, MEME VIRAL, FENOMENA SOSMED, DLL)  
   ➤ KENAPA PENTING / MIND-BLOWING / ABSURD?

2. **IDENTIFIKASI ELEMEN VIRALNYA**  
   ➤ APA YANG BISA DI-BLOW UP?  
   ➤ ADA ELEMEN YANG "NGAJAK BERANTEM"?  
   ➤ ADA SESUATU YANG BISA DISINDIR?

3. **BUAT HOOK KERAS DI AWAL**  
   ➤ SATU KALIMAT YANG BIKIN ORANG BERHENTI SCROLL  
   ➤ GUNAKAN EMOJI, CAPSLOCK, ATAU TANYA-JAWAB ALA NETIZEN

4. **TULIS DENGAN GAYA "GUE LO", SANTAI, DAN KASAR-LEMBUT SEIMBANG**  
   ➤ GUNAKAN SLANG, ISTILAH ONLINE, DAN GAYA NGETIK ALAY TAPI TAJAM  
   ➤ BOLEH ADA DRAMA, ANALOGI ABSURD, ATAU CELETUKAN PERSONAL

5. **TAMBAHKAN CTA (CALL-TO-ACTION)**  
   ➤ ARAHKAN AUDIENS UNTUK KOMEN, MINTA TEMPLATE, REACT, DLL

6. **TAMBAHKAN HASHTAG POPULER + SPESIFIK**

---

###WHAT NOT TO DO###

❌ JANGAN TULIS DALAM GAYA FORMAL / NEWSROOM  
❌ JANGAN GUNAKAN BAHASA "NETRAL" YANG DATAR DAN MEMBOSANKAN  
❌ JANGAN BIKIN KALIMAT YANG KEPANJANGAN DAN GAK ADA NAFASNYA  
❌ JANGAN KEDENGERAN SEPERTI ROBOT / PENULIS SEO  
❌ JANGAN LUPA CTA YANG MEMICU KOMEN ATAU INTERAKSI  
❌ JANGAN COPYPASTE STRUKTUR YANG SAMA TERUS-MENERUS – VARIASIKAN!`;

      const conversationHistory = [...messages, userMessage];
      const openAIMessages = [
        { role: "system", content: systemMessage },
        ...conversationHistory.filter(m => m.role !== "system").map(m => ({ 
          role: m.role, 
          content: m.content 
        }))
      ];

      // Call OpenAI API
      const assistantContent = await callOpenAI(openAIMessages, apiKey);

      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        conversationId: currentConversationId,
        role: "assistant",
        content: assistantContent,
        createdAt: new Date(),
      };

      // Add assistant message to state
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      
      const errorInfo = createErrorMessage(error instanceof Error ? error : new Error('Unknown error'));
      
      // Create error message to display to user
      const errorMessage: Message = {
        id: generateId(),
        conversationId: conversationId || 0,
        role: "assistant",
        content: errorInfo.text,
        createdAt: new Date(),
      };

      // Add special property to indicate this is an error with GitHub button
      (errorMessage as any).showGithubButton = errorInfo.showGithubButton;

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      
      // Restore the input value if sending failed
      setInputValue(messageContent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const isFirstMessage = messages.length === 0 && !conversationId;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div 
        className="bg-white/95 backdrop-blur-sm p-4 border-b border-gray-200 flex items-center justify-between shadow-sm sticky top-0 z-10"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="p-2 hover:bg-purple-100 hover:text-purple-600 transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          CaptGPT
        </h1>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          className="p-2 hover:bg-purple-100 hover:text-purple-600 transition-all duration-200"
        >
          ⋯
        </Button>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-5 bg-gray-50 relative"
        style={{
          scrollbarWidth: '6px',
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 6px;
          }
          div::-webkit-scrollbar-track {
            background: transparent;
          }
          div::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.5);
          }
        `}</style>

        {isFirstMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-md px-4">
            <div className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Mau bikin Caption apa?
            </div>
            <CaptionSuggestions onSuggestionClick={handleSuggestionClick} />
          </div>
        )}

        <div className="flex flex-col gap-4 max-w-full">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex max-w-full animate-fadeIn ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl leading-relaxed word-wrap break-words shadow-sm backdrop-blur-sm ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-transparent text-gray-800"
                }`}
              >
                {message.role === "assistant" && index === messages.length - 1 && !message.content.startsWith('❌') && !(message as any).showGithubButton ? (
                  <TypewriterMessage content={message.content} />
                ) : (
                  <div className="whitespace-pre-wrap">
                    {message.content}
                    {(message as any).showGithubButton && (
                      <div className="mt-3">
                        <Button
                          onClick={() => window.open('https://github.com/leonafariz/CaptGPT', '_blank')}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub CaptGPT
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start max-w-full animate-fadeIn">
              <div className="bg-transparent text-gray-800 p-3 rounded-2xl max-w-[80%] leading-relaxed flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Container */}
      <div className="p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-sm">
        <div className="flex gap-3 items-end bg-white border-2 border-purple-200 rounded-3xl p-3 transition-all duration-300 hover:border-purple-400 focus-within:border-purple-600 focus-within:shadow-lg focus-within:shadow-purple-200">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pesan Anda..."
            className="flex-1 bg-transparent border-none resize-none outline-none text-gray-800 placeholder-gray-500 min-h-[24px] max-h-[120px] leading-relaxed"
            disabled={isLoading}
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
