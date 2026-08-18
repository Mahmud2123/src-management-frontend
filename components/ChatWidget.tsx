"use client";
import React, { useState, useEffect, useRef } from 'react';
import { postChat } from '@/lib/api/ai';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { id: 's0', role: 'assistant', content: "I'd be happy to help you out. What's on your mind? Need assistance with something related to Sa'adu Zungur University or the SRC?" },
  ]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const streamRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [open, messages]);

  const streamText = (fullText: string, onChunk: (chunk: string) => void) => {
    let i = 0;
    setStreaming(true);
    streamRef.current = setInterval(() => {
      i += Math.ceil(Math.max(1, fullText.length / 60));
      const chunk = fullText.slice(0, i);
      onChunk(chunk);
      if (i >= fullText.length) {
        clearInterval(streamRef.current);
        setStreaming(false);
      }
    }, 30);
  };

  const send = async () => {
    if (!message.trim()) return;
    const userMsg = { id: 'u' + Date.now(), role: 'user', content: message };
    setMessages((m) => [...m, userMsg]);
    setMessage('');
    setSending(true);

    try {
      const placeholderId = 'a' + Date.now();
      setMessages((m) => [...m, { id: placeholderId, role: 'assistant', content: '' }]);
      const res = await postChat(message);
      const answer = res.answer || 'Sorry, the AI did not return an answer.';
      // stream into the last assistant message
      streamText(answer, (chunk) => {
        setMessages((m) => m.map((it) => (it.id === placeholderId ? { ...it, content: chunk } : it)));
      });
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.message || 'The AI service is unavailable.';
      const text = status === 429 ? msg : status === 504 ? 'The AI is taking longer than expected. Please try again.' : 'Error: ' + msg;
      setMessages((m) => [...m, { id: 'e' + Date.now(), role: 'assistant', content: text }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        aria-label="Open SRC SAZU AI Assistant"
        onClick={() => setOpen(true)}
        className="fixed z-50 left-6 bottom-6 sm:right-6 sm:left-auto sm:bottom-6 bg-white hover:scale-105 transform transition-shadow rounded-full p-1 shadow-lg flex items-center justify-center"
        title="Open SRC SAZU AI Assistant"
      >
        <img src="/src-logo.png" alt="SRC" className="h-10 w-10 rounded-full object-cover" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

          <div className="relative w-full max-w-md mx-4 mb-6 sm:mb-0 bg-white rounded-lg shadow-xl overflow-hidden" style={{ height: '70vh' }}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">SRC</div>
                <div>
                  <div className="font-semibold">SRC SAZU AI Assistant</div>
                  <div className="text-xs text-gray-500">How can I help?</div>
                </div>
              </div>
              <div>
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">Close</button>
              </div>
            </div>

            <div ref={containerRef} className="p-4 overflow-auto" style={{ height: 'calc(70vh - 160px)' }}>
              {messages.map((m) => (
                <div key={m.id} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>{m.content}</div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 p-2 border rounded" />
                <button disabled={sending || streaming} onClick={send} className="px-4 py-2 bg-green-600 text-white rounded">{sending || streaming ? 'Sending...' : 'Send'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
