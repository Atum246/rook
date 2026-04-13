'use client';

import { useState, useEffect, useRef } from 'react';

export default function ChatPanel({ token, agent, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/chat/${agent.id}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch(`/api/chat/${agent.id}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply,
          timestamp: data.timestamp
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'system',
          content: `⚠️ ${data.error || 'Something went wrong'}`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: '⚠️ Could not reach agent. Try restarting it.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rook-600/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{agent.name}</h3>
              <p className="text-xs text-dark-400">
                {agent.status === 'live' ? '🟢 Online' : '🔴 Offline'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition p-2"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-dark-400">
                Start chatting with {agent.name}! ✨
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-rook-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-300'
                  : 'bg-dark-800 text-dark-100'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-50 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-dark-800 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-dark-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${agent.name}... 💬`}
              className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-600 focus:outline-none focus:border-rook-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-6 py-3 bg-rook-600 hover:bg-rook-500 text-white rounded-xl transition disabled:opacity-50"
            >
              Send 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
