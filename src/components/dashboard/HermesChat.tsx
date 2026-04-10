"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Plus, Lightbulb, Users, History, Bot, Zap, Sparkles, TrendingUp, DollarSign, Upload, FileText, MicIcon, Star, MessageSquare, Terminal, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserAgent } from "@/hooks/useUserAgent";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProTipsModal from "./ProTipsModal";
import { Suggestion } from "@/lib/suggestions";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "file" | "voice" | "plan";
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
}

interface ChatProps {
  className?: string;
}

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: "Suggestions",
    description: "Get AI-powered recommendations",
    action: "suggestions"
  },
  {
    icon: Users,
    title: "Explore agents",
    description: "Browse available AI agents",
    action: "skills"
  },
  {
    icon: History,
    title: "Pro tips",
    description: "Learn advanced techniques",
    action: "protips"
  },
  {
    icon: Bot,
    title: "Connect bot",
    description: "Connect external bots",
    action: "channels"
  },
];

const FEATURED_CARD = {
  title: "Earn Money by Creating Skills!",
  description: "Create and sell your own skills on Agent Place and earn money. No catch.",
  action: "Create",
  secondaryAction: "Earn Money"
};

export default function HermesChat({ className }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlanningMode, setIsPlanningMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<string[]>([]);
  const [showProTips, setShowProTips] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { agent, hasAgent, loading: agentLoading } = useUserAgent();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial suggestions
  useEffect(() => {
    loadSuggestions();
  }, []);

  // Load dynamic suggestions
  const loadSuggestions = async (type: string = 'featured') => {
    try {
      setIsLoadingSuggestions(true);
      const response = await fetch(`/api/suggestions?type=${type}&count=4`);
      if (response.ok) {
        const data = await response.json();
        setDynamicSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Regenerate suggestions
  const regenerateSuggestions = async () => {
    await loadSuggestions('random');
  };

  // Handle suggestion card clicks
  const handleSuggestionClick = (action: string) => {
    switch (action) {
      case 'suggestions':
        regenerateSuggestions();
        break;
      case 'skills':
        // Navigate to skills/agents page
        window.location.href = '/dashboard/agents';
        break;
      case 'protips':
        setShowProTips(true);
        break;
      case 'channels':
        // Navigate to channels page
        window.location.href = '/dashboard/channels';
        break;
    }
  };

  // Handle dynamic suggestion click
  const handleDynamicSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.text);
    inputRef.current?.focus();
  };

  // Slash command suggestions
  const SLASH_COMMANDS = [
    '/help', '/skills', '/memory', '/sessions', '/session', '/clear', 
    '/agent', '/learn', '/forget', '/mode', '/export', '/reset'
  ];

  // Handle input change for slash command detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Show command suggestions when typing slash commands
    if (value.startsWith('/')) {
      const query = value.slice(1).toLowerCase();
      const suggestions = SLASH_COMMANDS.filter(cmd => 
        cmd.slice(1).toLowerCase().startsWith(query)
      );
      setCommandSuggestions(suggestions);
      setShowCommandMenu(suggestions.length > 0);
    } else {
      setShowCommandMenu(false);
      setCommandSuggestions([]);
    }
  };

  // Handle slash command execution
  const executeSlashCommand = async (commandText: string) => {
    const parts = commandText.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    try {
      const response = await fetch('/api/hermes/commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, args }),
      });

      if (!response.ok) {
        throw new Error('Command failed');
      }

      const result = await response.json();
      
      // Add command result to chat
      const commandMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: commandText,
        timestamp: new Date(),
        type: "text"
      };

      const resultMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.result.message,
        timestamp: new Date(),
        type: "text"
      };

      setMessages(prev => [...prev, commandMessage, resultMessage]);

      // Handle special actions
      if (result.result.action === 'clear_chat') {
        setTimeout(() => setMessages([]), 1000);
      } else if (result.result.action === 'export_chat') {
        // Handle chat export
        exportChatHistory(result.result.format);
      } else if (result.result.action === 'new_session') {
        // Start new session
        setTimeout(() => setMessages([]), 1000);
      } else if (result.result.action === 'save_session') {
        // Save current session
        await saveCurrentSession(result.result.title);
      } else if (result.result.action === 'load_session') {
        // Load session
        await loadSession(result.result.session);
      }

    } catch (error) {
      console.error('Slash command error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ Command failed: ${commandText}. Type /help for available commands.`,
        timestamp: new Date(),
        type: "text"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Export chat history
  const exportChatHistory = (format: string = 'json') => {
    const data = format === 'json' 
      ? JSON.stringify(messages, null, 2)
      : messages.map(m => `[${m.timestamp.toLocaleString()}] ${m.role}: ${m.content}`).join('\n');
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history.${format === 'json' ? 'json' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Save current session
  const saveCurrentSession = async (title: string) => {
    if (!agent || messages.length === 0) {
      console.error('No agent or messages to save');
      return;
    }

    try {
      const response = await fetch('/api/hermes/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent.id,
          title,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            type: m.type
          }))
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Session saved:', result.sessionId);
        
        // Add success message
        const successMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `✅ Session saved as "${title}" (ID: ${result.sessionId})`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  // Load session
  const loadSession = async (session: any) => {
    try {
      const sessionMessages = JSON.parse(session.messages);
      const loadedMessages: Message[] = sessionMessages.map((msg: any, index: number) => ({
        id: `loaded-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        type: msg.type || 'text'
      }));

      setMessages(loadedMessages);
      
      // Add load confirmation
      setTimeout(() => {
        const confirmMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `📂 Loaded session "${session.title}" with ${loadedMessages.length} messages`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmMessage]);
      }, 500);
      
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploadingFile(true);
      
      // Step 1: Upload file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      
      // Add file message to chat
      const fileMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: `Uploaded file: ${file.name}`,
        timestamp: new Date(),
        type: "file",
        fileInfo: uploadResult.file
      };

      setMessages(prev => [...prev, fileMessage]);
      setShowUploadMenu(false);

      // Step 2: Analyze file content and get AI response directly
      setIsLoading(true);
      
      const analyzeResponse = await fetch('/api/analyze-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileInfo: uploadResult.file
        }),
      });

      if (analyzeResponse.ok) {
        const analyzeResult = await analyzeResponse.json();
        
        // Step 3: Send analysis directly to AI chat API for streaming response
        const response = await fetch("/api/hermes/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...messages,
              fileMessage,
              {
                role: "user",
                content: file.type.startsWith('image/') 
                  ? `Please analyze this image I just uploaded: ${file.name}\n\nImage Analysis:\n${analyzeResult.analysis}\n\nProvide insights, describe what you see, and let me know how I can work with this image.`
                  : `Please analyze this file I just uploaded: ${file.name}\n\nFile Content:\n${analyzeResult.analysis}\n\nProvide insights about the content and let me know how I can work with this data.`
              }
            ].map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: msg.content + content }
                      : msg
                  ));
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } else {
        // Fallback if analysis fails - still give AI response
        const fallbackMessage = `I see you've uploaded a file: ${file.name} (${file.type}). While I couldn't analyze the content automatically, I'm here to help! Please tell me what you'd like to do with this file.`;
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fallbackMessage,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploadingFile(false);
      setIsLoading(false);
    }
  };

  // Voice Recording Handler
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      setInput(result.text);
      
      // Focus input for user to review/edit
      inputRef.current?.focus();
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio. Please try again.');
    }
  };

  // Planning Mode Handler
  const handlePlanningMode = async () => {
    if (!input.trim()) {
      alert('Please enter a task or goal to create a plan for.');
      return;
    }

    setIsPlanningMode(true);
    setIsLoading(true);

    const planMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Create a plan for: ${input.trim()}`,
      timestamp: new Date(),
      type: "plan"
    };

    setMessages(prev => [...prev, planMessage]);
    const currentInput = input.trim();
    setInput("");

    try {
      const response = await fetch('/api/planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error('Planning failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        type: "plan"
      };

      setMessages(prev => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: msg.content + content }
                    : msg
                ));
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Planning error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while creating your plan. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsPlanningMode(false);
    }
  };

  // Feedback Handler
  const submitFeedback = async (rating: number, message?: string) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat',
          rating,
          message,
          context: {
            agentId: agent?.id,
            messagesCount: messages.length
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Feedback submission failed');
      }

      setShowFeedback(false);
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  // Send Message (refactored from handleSubmit)
  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading || !hasAgent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageContent) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/hermes/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          agentId: agent?.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: msg.content + content }
                    : msg
                ));
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if it's a slash command
    if (input.trim().startsWith('/')) {
      await executeSlashCommand(input.trim());
      setInput("");
      setShowCommandMenu(false);
      setCommandSuggestions([]);
      return;
    }
    
    await sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isEmpty = messages.length === 0;

  // Upload Menu Component
  const UploadMenu = () => (
    <AnimatePresence>
      {showUploadMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="absolute bottom-12 left-0 bg-white/[0.08] backdrop-blur-sm border border-border rounded-xl p-2 min-w-[200px] z-50"
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFile}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {isUploadingFile ? "Uploading..." : "Upload File"}
          </button>
          <button
            onClick={() => {
              setShowUploadMenu(false);
              // Add image upload functionality here
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Upload Image
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Command Menu Component
  const CommandMenu = () => (
    <AnimatePresence>
      {showCommandMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="absolute bottom-12 left-0 bg-white/[0.08] backdrop-blur-sm border border-border rounded-xl p-2 min-w-[250px] z-50"
        >
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 border-b border-border mb-1">
            <Terminal className="w-3 h-3" />
            Hermes Commands
          </div>
          {commandSuggestions.map((command) => (
            <button
              key={command}
              onClick={() => {
                setInput(command + ' ');
                setShowCommandMenu(false);
                inputRef.current?.focus();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors text-left"
            >
              <span className="font-mono text-blue-400">{command}</span>
              <span className="text-xs text-muted-foreground">
                {getCommandDescription(command)}
              </span>
            </button>
          ))}
          <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border mt-1">
            Type <span className="font-mono text-blue-400">/help</span> for all commands
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Get command description helper
  const getCommandDescription = (command: string) => {
    const descriptions: Record<string, string> = {
      '/help': 'Show all commands',
      '/skills': 'List agent skills',
      '/memory': 'Show agent memory',
      '/sessions': 'List chat sessions',
      '/session': 'Manage sessions',
      '/clear': 'Clear chat history',
      '/agent': 'Agent information',
      '/learn': 'Teach agent',
      '/forget': 'Remove memory',
      '/mode': 'Change agent mode',
      '/export': 'Export chat',
      '/reset': 'Reset agent'
    };
    return descriptions[command] || '';
  };

  // Feedback Modal Component
  const FeedbackModal = () => (
    <AnimatePresence>
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowFeedback(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-foreground font-semibold text-lg mb-4">Share Your Feedback</h3>
            <p className="text-muted-foreground text-sm mb-6">How was your experience with the AI assistant?</p>
            
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => submitFeedback(rating)}
                  className="w-10 h-10 rounded-lg bg-accent hover:bg-accent/90 border border-border flex items-center justify-center text-muted-foreground hover:text-amber-400 transition-colors"
                >
                  <Star className="w-5 h-5" />
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFeedback(false)}
                className="flex-1 px-4 py-2 bg-accent hover:bg-accent/90 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const message = prompt("Any additional feedback? (Optional)");
                  submitFeedback(5, message || undefined);
                }}
                className="flex-1 px-4 py-2 bg-primary hover:bg-blue-700 rounded-lg text-foreground transition-colors"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (agentLoading) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-background", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!hasAgent) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-background", className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-foreground font-semibold text-lg mb-2">No agent found</h3>
          <p className="text-muted-foreground mb-6">
            You need to complete the onboarding process to create your AI agent.
          </p>
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Complete Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.csv,.docx,.xlsx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* Pro Tips Modal */}
      <ProTipsModal isOpen={showProTips} onClose={() => setShowProTips(false)} />

      {/* Feedback Modal */}
      <FeedbackModal />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            {/* Welcome Message */}
            <div className="text-center mb-12 max-w-2xl">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                What would you like to do?
              </h1>
              <p className="text-muted-foreground text-lg">
                {agent?.name} is ready
              </p>
            </div>

            {/* Input Area - Moved to center for empty state */}
            <div className="w-full max-w-2xl mb-8">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-end gap-3">
                  {/* Add Button with Upload Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowUploadMenu(!showUploadMenu)}
                      className={cn(
                        "w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0",
                        showUploadMenu ? "bg-primary text-foreground" : "bg-accent hover:bg-accent/80"
                      )}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <UploadMenu />
                    <CommandMenu />
                  </div>

                  {/* Input Field */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything... (type / for commands)"
                      className="w-full bg-card border border-border rounded-2xl px-4 py-3 pr-20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                      rows={1}
                      style={{
                        minHeight: "48px",
                        maxHeight: "120px",
                      }}
                    />
                    
                    {/* Right side buttons */}
                    <div className="absolute right-2 bottom-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          isRecording 
                            ? "bg-red-600 hover:bg-red-700 text-foreground animate-pulse" 
                            : "bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="w-8 h-8 rounded-lg bg-primary hover:bg-blue-700 disabled:bg-accent disabled:text-muted-foreground/60 flex items-center justify-center text-foreground transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePlanningMode}
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "flex items-center gap-2 text-xs transition-colors",
                        isPlanningMode 
                          ? "text-blue-400" 
                          : "text-muted-foreground hover:text-muted-foreground disabled:text-white/20"
                      )}
                    >
                      <Zap className="w-3 h-3" />
                      {isPlanningMode ? "Planning..." : "Plan"}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <button 
                      onClick={() => setShowFeedback(true)}
                      className="hover:text-muted-foreground transition-colors"
                    >
                      Feedback
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-4xl">
              {SUGGESTIONS.map((suggestion, index) => (
                <motion.button
                  key={suggestion.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSuggestionClick(suggestion.action)}
                  className="p-4 bg-card hover:bg-accent border border-border rounded-xl text-left transition-colors group"
                >
                  <suggestion.icon className="w-5 h-5 text-muted-foreground mb-3 group-hover:text-foreground transition-colors" />
                  <h3 className="text-foreground font-medium text-sm mb-1">
                    {suggestion.title}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {suggestion.description}
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Dynamic Suggestions */}
            {dynamicSuggestions.length > 0 && (
              <div className="w-full max-w-4xl mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-foreground font-semibold text-lg">Try these suggestions</h3>
                  <button
                    onClick={regenerateSuggestions}
                    disabled={isLoadingSuggestions}
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent/90 border border-border rounded-lg text-muted-foreground hover:text-foreground text-sm transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={cn("w-3 h-3", isLoadingSuggestions && "animate-spin")} />
                    Regenerate
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dynamicSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleDynamicSuggestionClick(suggestion)}
                      className="p-4 bg-card hover:bg-accent border border-border rounded-xl text-left transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          suggestion.category === 'creative' && "bg-purple-500/20 text-purple-400",
                          suggestion.category === 'productivity' && "bg-blue-500/20 text-blue-400",
                          suggestion.category === 'technical' && "bg-green-500/20 text-green-400",
                          suggestion.category === 'business' && "bg-orange-500/20 text-orange-400",
                          suggestion.category === 'learning' && "bg-pink-500/20 text-pink-400"
                        )}>
                          {suggestion.category === 'creative' && <Sparkles className="w-4 h-4" />}
                          {suggestion.category === 'productivity' && <TrendingUp className="w-4 h-4" />}
                          {suggestion.category === 'technical' && <Bot className="w-4 h-4" />}
                          {suggestion.category === 'business' && <DollarSign className="w-4 h-4" />}
                          {suggestion.category === 'learning' && <Lightbulb className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 text-sm leading-relaxed group-hover:text-foreground transition-colors">
                            {suggestion.text}
                          </p>
                          <span className={cn(
                            "inline-block mt-2 px-2 py-1 rounded-md text-xs font-medium capitalize",
                            suggestion.category === 'creative' && "bg-purple-500/10 text-purple-400",
                            suggestion.category === 'productivity' && "bg-blue-500/10 text-blue-400",
                            suggestion.category === 'technical' && "bg-green-500/10 text-green-400",
                            suggestion.category === 'business' && "bg-orange-500/10 text-orange-400",
                            suggestion.category === 'learning' && "bg-pink-500/10 text-pink-400"
                          )}>
                            {suggestion.category}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold text-lg mb-2">
                    {FEATURED_CARD.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {FEATURED_CARD.description}
                  </p>
                  <div className="flex gap-3">
                    <button className="bg-green-600 hover:bg-green-700 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      {FEATURED_CARD.action}
                    </button>
                    <button className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      {FEATURED_CARD.secondaryAction}
                    </button>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-foreground ml-auto"
                      : "bg-accent text-foreground border border-border"
                  )}
                >
                  {/* File message display */}
                  {message.type === "file" && message.fileInfo && (
                    <div className="mb-2 p-3 bg-accent rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">{message.fileInfo.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(message.fileInfo.size / 1024).toFixed(1)} KB • {message.fileInfo.type}
                      </div>
                    </div>
                  )}

                  {/* Plan message indicator */}
                  {message.type === "plan" && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-blue-400">
                      <Zap className="w-3 h-3" />
                      <span>Planning Mode</span>
                    </div>
                  )}

                  <div className="text-sm leading-relaxed">
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Custom styling for markdown elements
                            h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>,
                            h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-medium mb-1 text-foreground">{children}</h3>,
                            p: ({children}) => <p className="mb-2 text-white/90 last:mb-0">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside mb-2 text-white/90">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside mb-2 text-white/90">{children}</ol>,
                            li: ({children}) => <li className="mb-1">{children}</li>,
                            strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                            em: ({children}) => <em className="italic text-white/80">{children}</em>,
                            code: ({children}) => <code className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono text-blue-300">{children}</code>,
                            pre: ({children}) => <pre className="bg-white/5 p-3 rounded-lg overflow-x-auto text-xs font-mono mb-2">{children}</pre>,
                            blockquote: ({children}) => <blockquote className="border-l-2 border-white/20 pl-3 italic text-muted-foreground mb-2">{children}</blockquote>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-white/90">{message.content}</p>
                    )}
                  </div>
                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">U</span>
                  </div>
                )}
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-foreground" />
                </div>
                <div className="bg-accent border border-border rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area for conversation state */}
      {!isEmpty && (
        <div className="border-t border-border/60 p-6">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end gap-3">
              {/* Add Button with Upload Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUploadMenu(!showUploadMenu)}
                  className={cn(
                    "w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0",
                    showUploadMenu ? "bg-primary text-foreground" : "bg-accent hover:bg-accent/80"
                  )}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <UploadMenu />
                <CommandMenu />
              </div>

              {/* Input Field */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... (type / for commands)"
                  className="w-full bg-card border border-border rounded-2xl px-4 py-3 pr-20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                  rows={1}
                  style={{
                    minHeight: "48px",
                    maxHeight: "120px",
                  }}
                />
                
                {/* Right side buttons */}
                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      isRecording 
                        ? "bg-red-600 hover:bg-red-700 text-foreground animate-pulse" 
                        : "bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-8 h-8 rounded-lg bg-primary hover:bg-blue-700 disabled:bg-accent disabled:text-muted-foreground/60 flex items-center justify-center text-foreground transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handlePlanningMode}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "flex items-center gap-2 text-xs transition-colors",
                    isPlanningMode 
                      ? "text-blue-400" 
                      : "text-muted-foreground hover:text-muted-foreground disabled:text-white/20"
                  )}
                >
                  <Zap className="w-3 h-3" />
                  {isPlanningMode ? "Planning..." : "Plan"}
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <button 
                  onClick={() => setShowFeedback(true)}
                  className="hover:text-muted-foreground transition-colors"
                >
                  Feedback
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


