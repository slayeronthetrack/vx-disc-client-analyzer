/**
 * Floating Chat Widget - Melhorado
 * Chat IA com contexto DISC e sugestões personalizadas
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DISCContext {
  dominant_profile: 'D' | 'I' | 'S' | 'C';
  scores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
}

const profileNames = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

interface FloatingChatWidgetProps {
  onClose?: () => void;
  initialOpen?: boolean;
}

export default function FloatingChatWidget({ onClose, initialOpen = false }: FloatingChatWidgetProps = {}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [discContext, setDiscContext] = useState<DISCContext | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar histórico e contexto ao abrir
  useEffect(() => {
    if (isOpen && user && messages.length === 0) {
      loadChatData();
    }
  }, [isOpen, user]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatData = async () => {
    if (!user) return;

    try {
      setLoadingHistory(true);
      const response = await fetch(`/api/ai/chat?userId=${user.id}`);
      const data = await response.json();

      if (data.history && data.history.length > 0) {
        const formattedHistory = data.history.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));
        setMessages(formattedHistory);
      } else {
        // Mensagem inicial personalizada - Lucas Ferreira
        const greeting = data.discContext
          ? `Olá! Eu sou Lucas Ferreira, consultor comercial da VX. Analisei seu perfil DISC (${profileNames[data.discContext.dominant_profile as keyof typeof profileNames]}) e posso te ajudar a transformar esse diagnóstico em ações práticas para vendas, comunicação e liderança. Por onde quer começar?`
          : 'Olá! Eu sou Lucas Ferreira, consultor comercial da VX. Como posso ajudar você hoje?';
        
        setMessages([{ role: 'assistant', content: greeting }]);
      }

      setDiscContext(data.discContext);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error loading chat data:', error);
      setMessages([
        {
          role: 'assistant',
          content: 'Olá! Sou o Assistente VX. Como posso ajudar você hoje?',
        },
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading || !user) return;

    setInput('');
    setLoading(true);

    // Adicionar mensagem do usuário
    setMessages((prev) => [...prev, { role: 'user', content: textToSend }]);

    try {
      // Chamar API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend,
          userId: user.id,
        }),
      });

      const data = await response.json();

      // Adicionar resposta da IA
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);

      // Atualizar sugestões e contexto
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
      if (data.discContext) {
        setDiscContext(data.discContext);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro. Tente novamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleClearHistory = () => {
    if (confirm('Deseja limpar todo o histórico de conversas?')) {
      setMessages([
        {
          role: 'assistant',
          content: 'Histórico limpo! Eu sou Lucas Ferreira, consultor comercial da VX. Como posso ajudar você?',
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                  <MessageCircle size={20} className="text-gray-900" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Lucas Ferreira</h3>
                  <p className="text-gray-400 text-xs">Consultor Comercial • VX Comercial</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClearHistory}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Limpar histórico"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* DISC Context Badge */}
            {discContext && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <Sparkles size={14} className="text-orange-500" />
                <span className="text-orange-500 text-xs font-medium">
                  Perfil {profileNames[discContext.dominant_profile]} detectado
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <div className="px-4 pb-2">
              <p className="text-gray-400 text-xs mb-2">Sugestões:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 2).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua dúvida..."
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
