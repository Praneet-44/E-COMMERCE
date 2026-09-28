import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function AIChatbot() {
  const { t, locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize bot greeting based on active language
  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: t('chatbot.subtitle', 'Welcome to the FashionHub Personal Styling Service. How may I help elevate your wardrobe today?'),
        products: []
      }
    ]);
  }, [locale]);

  // Listen for custom event to open chatbot
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    // Append user message
    const userMsg = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await api.ai.chat(messageText);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: response.reply,
        products: response.products || []
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: t('common.error', 'I apologize. I am having trouble connecting to our digital archives at the moment.'),
        products: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const sampleSuggestions = [
    t('chatbot.q1', 'What size should I choose for outerwear?'),
    t('chatbot.q2', 'Suggest an outfit for a formal evening event'),
    t('chatbot.q3', 'What are the trending fashion colors this season?'),
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center border border-luxury-accent/30"
        aria-label={t('chatbot.title', 'AI Fashion Assistant')}
      >
        <Sparkles className="w-6 h-6 text-luxury-accent animate-pulse-subtle" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="absolute right-0 top-0 h-full w-full sm:w-[450px] bg-white dark:bg-neutral-950 shadow-2xl flex flex-col border-l border-neutral-100 dark:border-neutral-900">
            
            {/* Header */}
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-900 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-luxury-accent" />
                <div>
                  <h3 className="font-serif font-bold text-base tracking-wide text-neutral-800 dark:text-neutral-100">
                    {t('chatbot.title', 'AI Fashion Assistant')}
                  </h3>
                  <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-semibold">Active Assistant</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow p-5 overflow-y-auto space-y-5">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Avatar */}
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 mb-1">
                    {msg.sender === 'bot' ? 'AI Assistant' : 'You'}
                  </span>
                  
                  {/* Bubble */}
                  <div className={`p-4 rounded-lg max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-medium' 
                      : 'bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200'
                  }`}>
                    {msg.text}

                    {/* Integrated Product Recommendations */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-neutral-200/50 dark:border-neutral-800 space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block mb-2">Curated Wardrobe Recommendations</span>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.products.map((p, idx) => {
                            const finalPrice = Math.round(p.price * (1 - (p.discount || 0)/100));
                            return (
                              <Link 
                                key={idx} 
                                href={`/products/${p.id || p._id}`}
                                locale={locale}
                                className="flex items-center gap-3 p-2 bg-white dark:bg-neutral-950 rounded-sm border border-neutral-100 dark:border-neutral-900 hover:border-luxury-accent/30 transition-all cursor-pointer group"
                                onClick={() => setIsOpen(false)}
                              >
                                <img 
                                  src={p.images[0]} 
                                  alt={p.name} 
                                  className="w-12 h-14 object-cover object-top rounded-sm"
                                />
                                <div className="flex-grow">
                                  <h4 className="text-xs font-semibold font-serif text-neutral-800 dark:text-neutral-200 line-clamp-1 group-hover:text-luxury-accent transition-colors">{p.name}</h4>
                                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest">{p.category}</span>
                                  <div className="flex items-baseline gap-1.5 mt-0.5">
                                    <span className="text-xs font-bold font-sans">₹{finalPrice.toLocaleString('en-IN')}</span>
                                    {p.discount > 0 && (
                                      <span className="text-[10px] text-neutral-400 line-through">₹{p.price}</span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 mb-1">AI Assistant</span>
                  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-lg flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-luxury-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-luxury-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-luxury-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips */}
            {messages.length === 1 && (
              <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-900">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-2 font-medium">
                  {t('chatbot.suggestedTitle', 'Suggested Questions:')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      className="text-[11px] text-left text-neutral-600 dark:text-neutral-400 hover:text-luxury-accent border border-neutral-200 dark:border-neutral-800 hover:border-luxury-accent/30 rounded-full px-3 py-1.5 bg-neutral-50/50 dark:bg-neutral-900/20 transition-all font-light"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="p-4 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900/30 flex gap-2">
              <input
                type="text"
                placeholder={t('chatbot.placeholder', 'Ask me anything about fashion or your order...')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
                className="flex-grow px-4 py-2 text-sm bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md outline-none text-neutral-800 dark:text-neutral-100 focus:border-luxury-accent transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-luxury-accent dark:hover:bg-luxury-accent hover:text-white dark:hover:text-neutral-950 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
