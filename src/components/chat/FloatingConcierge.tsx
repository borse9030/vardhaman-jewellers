'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Send, Sparkles, MessageCircle, Phone, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useGoldRates } from '@/context/GoldRateContext';
import { useCart } from '@/context/CartContext';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  quickActions?: { label: string; url?: string; action?: string }[];
  timestamp: string;
}

export default function FloatingConcierge() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { rates, isLiveModalOpen } = useGoldRates();
  const { isCartDrawerOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: t('chatGreeting'),
      quickActions: [
        { label: 'Today’s 22K Gold Rate', action: 'What is today’s gold rate?' },
        { label: 'Store Locations in Maharashtra', action: 'Where are your stores located?' },
        { label: 'Sell / Exchange Old Gold', action: 'How does old gold exchange work?' },
        { label: 'Book Wedding Consultation', action: 'I want to book an appointment' },
      ],
      timestamp: 'Just now',
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, language, rates }),
      });

      const data = await res.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply,
        quickActions: data.quickActions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (e) {
      console.error('Chat error:', e);
      const fallback: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Our jewellery specialists are also available directly on WhatsApp (+91 98221 23456) for instant assistance.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isCartDrawerOpen || isLiveModalOpen || pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 select-none">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-2 bg-[#581825] hover:bg-[#380B12] text-[#FAF7F2] py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-full shadow-2xl border border-[#C5A880]/50 transition-all duration-300 hover:scale-105"
          aria-label="Open Jewellery Assistant"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A880] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 border-2 border-[#581825]"></span>
          </div>
          <span className="font-serif text-xs font-semibold tracking-wide hidden sm:inline">
            Vardhaman Sahayak
          </span>
          <span className="text-[9px] sm:text-[10px] bg-[#C5A880] text-[#380B12] px-1.5 py-0.5 rounded-full font-bold">
            Live
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm h-[480px] sm:h-[540px] max-h-[78vh] bg-white rounded-2xl shadow-2xl border border-[#E8E2D8] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-[#380B12] text-[#FAF7F2] p-4 flex items-center justify-between border-b border-[#581825]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#C5A880] flex items-center justify-center bg-[#581825] p-1 overflow-hidden shrink-0">
                <Image
                  src="/logo-monogram-gold.png"
                  alt="Vardhaman Jewellers"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold leading-tight">Vardhaman Sahayak</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-[#DFCDAE]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>AI Jewellery Specialist</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switch */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-[#581825] text-white text-[11px] rounded px-1.5 py-1 border border-[#C5A880]/40 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="mr">मराठी</option>
                <option value="hi">हिन्दी</option>
              </select>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-[#DFCDAE] hover:text-white hover:bg-[#581825]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF7F2]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#581825] text-white rounded-br-none shadow-xs'
                      : 'bg-white text-[#2B2625] rounded-bl-none border border-[#E8E2D8] shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Quick actions if provided */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.quickActions.map((qa, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (qa.action) {
                            handleSendMessage(qa.action);
                          } else if (qa.url) {
                            window.location.href = qa.url;
                          }
                        }}
                        className="text-[10px] font-medium bg-white hover:bg-[#581825] hover:text-white text-[#581825] border border-[#E8E2D8] px-2.5 py-1 rounded-full shadow-2xs transition-all flex items-center gap-1"
                      >
                        <span>{qa.label}</span>
                        {qa.url && <ArrowUpRight className="w-2.5 h-2.5" />}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-[#A8A29E] mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-[#E8E2D8] w-20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Direct Connect Strip */}
          <div className="bg-[#FAF7F2] px-3 py-1.5 border-t border-[#E8E2D8] flex items-center justify-between text-[11px]">
            <span className="text-[#78716C]">Prefer human assistance?</span>
            <a
              href="https://wa.me/919822123456?text=Hello%20Vardhaman%20Jewellers,%20I%20would%20like%20to%20speak%20with%20a%20jewellery%20specialist."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
            >
              <MessageCircle className="w-3 h-3 text-[#25D366]" />
              <span>WhatsApp Specialist</span>
            </a>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#E8E2D8] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask in English, मराठी or हिन्दी..."
              className="flex-1 bg-[#FAF7F2] text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] focus:outline-none focus:border-[#C5A880] text-[#1A1818]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#581825] text-white hover:bg-[#380B12] disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
