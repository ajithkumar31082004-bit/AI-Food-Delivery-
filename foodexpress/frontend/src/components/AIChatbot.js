import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m FoodGPT 🍕 Ask me anything — "spicy chicken under ₹300", order status, or meal suggestions!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const { user } = useSelector(s => s.auth);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      let reply;
      const lower = text.toLowerCase();
      if (user && (lower.includes('order') || lower.includes('status') || lower.includes('refund'))) {
        const { data } = await API.post('/ai/support', { query: text });
        reply = data.response;
      } else if (user) {
        const { data } = await API.post('/ai/assistant', { query: text });
        reply = data.message || 'Here are my suggestions!';
        if (data.recommendations?.length) {
          reply += '\n\n' + data.recommendations.map(r => `• ${r.name}: ${r.reason}`).join('\n');
        }
      } else {
        const { data } = await API.get(`/food/search?q=${encodeURIComponent(text)}`);
        reply = data.results?.length
          ? `Found ${data.results.length} items! Try logging in for personalized recommendations.\n\n` +
            data.results.slice(0, 5).map(r => `• ${r.name} — ₹${r.price}`).join('\n')
          : 'Try searching for dishes, cuisines, or budget. Login for AI-powered recommendations!';
      }
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I couldn\'t process that. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice not supported in this browser');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript;
      setMessages(prev => [...prev, { role: 'user', text: `🎤 ${transcript}` }]);
      if (user) {
        try {
          const { data } = await API.post('/ai/voice-order', { transcript });
          setMessages(prev => [...prev, { role: 'bot', text: data.message || `Parsed ${data.items?.length || 0} items from your order.` }]);
        } catch {
          sendMessage(transcript);
        }
      } else {
        sendMessage(transcript);
      }
    };
    recognition.start();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
        aria-label="Open AI assistant"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-slide-up" style={{ height: '480px' }}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">FoodGPT</h3>
              <p className="text-xs text-gray-500">AI Food Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-gray-400 animate-pulse">FoodGPT is thinking...</div>}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <button onClick={startVoice} className={`p-2 rounded-lg ${listening ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <MicrophoneIcon className="w-5 h-5" />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask FoodGPT..."
              className="flex-1 input-field py-2 text-sm"
            />
            <button onClick={() => sendMessage(input)} disabled={loading} className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
