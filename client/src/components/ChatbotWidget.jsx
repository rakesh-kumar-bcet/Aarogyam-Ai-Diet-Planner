import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export default function ChatbotWidget({ user = null }) {
  const [open, setOpen] = useState(true);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  // auto-scroll to bottom when chat changes
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [chat, open]);

  const send = async () => {
    if (!msg) return;
    const userMessage = msg;
    setChat(prev => [...prev, { sender: 'user', text: userMessage }]);
    setMsg('');
    setLoading(true);

    try {
      console.log('Chat send payload:', { message: userMessage, user });
      const res = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: userMessage,
        user // may be null, backend should handle it
      }, { timeout: 20000 }); // 20s timeout

      console.log('Chat response:', res.data);
      const replyText = res.data?.reply || res.data?.error || 'No reply from server';
      setChat(prev => [...prev, { sender: 'bot', text: replyText }]);
    } catch (err) {
      console.error('Chat error:', err);
      // Friendly message
      const fallback = err?.response?.data?.reply
        || 'AI unavailable right now. For personal contact with a nutritionist, check the dashboard for contact information.';
      setChat(prev => [...prev, { sender: 'bot', text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const onEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed right-3 bottom-3 w-full max-w-xs sm:w-80 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 border">
        <div className="flex justify-between items-center mb-2">
          <strong className="text-lg">Diet Chatbot</strong>
          <div className="flex items-center">
            {loading && <small className="mr-2 text-gray-500">Sending...</small>}
            <button className="text-blue-500 hover:text-blue-700" onClick={() => setOpen(o => !o)}>
              {open ? 'Hide' : 'Open'}
            </button>
          </div>
        </div>

        {open && (
          <>
            <div
              ref={boxRef}
              className="h-48 sm:h-56 overflow-y-auto border border-gray-200 p-2 mb-2 rounded"
            >
              {chat.length === 0 && <div className="text-gray-500">Ask about diets, calories or healthy food.</div>}
              {chat.map((c, i) => (
                <div key={i} className={`mb-2 ${c.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-3 py-2 rounded-lg max-w-[80%] sm:max-w-4/5 ${
                    c.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {c.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex">
              <textarea
                rows={1}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={onEnter}
                placeholder="Ask about diet..."
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:opacity-50"
                onClick={send}
                disabled={loading}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
