import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles, Loader2, ChevronDown, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { chatService } from '../services';
import type { ChatMessage } from '../services/chatService';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface CandidateChatPanelProps {
    jobId: string;
    jobTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_PROMPTS = [
    "Who has the most Python experience?",
    "Compare the top 3 candidates.",
    "Which candidates have management experience?",
    "Are any candidates missing critical skills?"
];

export function CandidateChatPanel({ jobId, jobTitle, isOpen, onClose }: CandidateChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: `Hi! I'm your AI hiring assistant for the **${jobTitle}** position. Ask me anything about your candidate pool!`
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    if (!isOpen) return null;

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const newUserMsg: ChatMessage = { role: 'user', content: text.trim() };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsLoading(true);
        setIsMinimized(false);

        try {
            // Send history excluding the initial greeting if we want to save tokens, 
            // but for context it's fine. We'll send the recent history.
            const historyToInclude = messages.slice(1).slice(-6); // last 6 messages
            
            const data = await chatService.sendMessage(jobId, newUserMsg.content, historyToInclude);
            
            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                toast.error(data.message || 'Failed to get response');
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error: any) {
            toast.error('Failed to communicate with AI');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, the connection failed. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputValue);
        }
    };

    return (
        <div className={`fixed right-0 bottom-0 z-40 transition-all duration-500 ease-in-out transform flex flex-col bg-white dark:bg-slate-900 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.3)] border-l border-slate-200 dark:border-slate-800 rounded-tl-2xl
            ${isMinimized ? 'w-80 h-16 translate-y-0' : 'w-full md:w-[450px] top-16 h-[calc(100vh-64px)]'}
        `}>
            {/* Header */}
            <div 
                className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md rounded-tl-2xl cursor-pointer select-none group"
                onClick={() => isMinimized && setIsMinimized(false)}
            >
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">AI Hiring Assistant</h3>
                            {isMinimized && <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />}
                        </div>
                        {!isMinimized && <p className="text-[10px] text-slate-500 uppercase tracking-widest">{jobTitle}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={isMinimized ? "Expand" : "Collapse"}
                    >
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        title="Close Chat"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Chat Area (hidden when minimized) */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30 dark:bg-slate-950/30 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                    msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-primary text-white'
                                }`}>
                                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={`px-4 py-3 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-tr-none' 
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                                }`}>
                                    {msg.role === 'user' ? (
                                        <p>{msg.content}</p>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="text-sm text-slate-500">Analyzing candidates...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    {messages.length === 1 && (
                        <div className="px-4 py-3 flex flex-wrap gap-2 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/50">
                            {QUICK_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendMessage(prompt)}
                                    className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <div className="relative flex items-center">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your candidates..."
                                className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none outline-none transition-all scrollbar-hide h-12"
                                rows={1}
                            />
                            <Button
                                size="sm"
                                onClick={() => handleSendMessage(inputValue)}
                                disabled={!inputValue.trim() || isLoading}
                                className="absolute right-1.5 h-9 w-9 p-0 rounded-xl"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-center text-slate-400 mt-2">
                            AI can make mistakes. Verify important information.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
