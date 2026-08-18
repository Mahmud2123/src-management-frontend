"use client";
import React, { useState } from 'react';
import { postChat } from '../lib/api/ai';

export default function AIPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const userMsg = { id: 'u' + Date.now(), role: 'user', content: message };
    setMessages((m) => [...m, userMsg]);
    try {
      const res = await postChat(message);
      setMessages((m) => [...m, { id: 'a' + Date.now(), role: 'assistant', content: res.answer }]);
    } catch (e: any) {
      setMessages((m) => [...m, { id: 'e' + Date.now(), role: 'assistant', content: 'Error: ' + (e?.message || 'unknown') }]);
    } finally {
      setMessage('');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">SAZU AI Assistant</h2>
      <div className="border rounded p-4 min-h-[300px] mb-4">
        {messages.length === 0 && <div className="text-muted">Ask a question about SAZU policies, announcements or FAQs.</div>}
        {messages.map((m) => (
          <div key={m.id} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>{m.content}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 p-2 border rounded" />
        <button disabled={loading} onClick={send} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Sending...' : 'Send'}</button>
      </div>
    </div>
  );
}
