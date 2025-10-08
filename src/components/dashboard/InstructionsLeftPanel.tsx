import { useEffect, useRef, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'system';
  text: string;
  timestamp: string;
}

export function InstructionsLeftPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('instructions_chat');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('instructions_chat', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('instructions_chat');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Instructions</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Add specific instructions for the assistant</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Clear instructions"
            title="Clear instructions"
          >
            <Trash2 className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 p-3">
            No instructions yet. Type below to add guidance (e.g., formatting, tone, or task steps).
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className="flex">
              <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                m.role === 'user'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 ml-auto'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'
              }`}>
                {m.text}
                <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type an instruction and press Enter..."
            className="w-full pr-9 pl-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-healthcare-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSend}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Send instruction"
          >
            <Send className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}



