import React, { useState } from 'react';
import { buildAiChatRequest, consumeSseStream, type AiUiMessage } from '../utils/ai-chat';
import { parseChatMarkdown, type InlineToken } from '../utils/chat-markdown';

const AI_STREAM_URL = 'http://localhost:8080/api/v1/ai/chat/stream';

function InlineMarkdown({ tokens }: { tokens: InlineToken[] }) {
  return <>{tokens.map((token, index) => token.bold
    ? <strong key={index}>{token.text}</strong>
    : <React.Fragment key={index}>{token.text}</React.Fragment>)}</>;
}

function ChatMarkdown({ content }: { content: string }) {
  return <div className="space-y-2">
    {parseChatMarkdown(content).map((block, index) => {
      if (block.type === 'ul') return <ul key={index} className="list-disc pl-5 space-y-1">{block.items.map((item, itemIndex) => <li key={itemIndex}><InlineMarkdown tokens={item} /></li>)}</ul>;
      if (block.type === 'ol') return <ol key={index} className="list-decimal pl-5 space-y-1">{block.items.map((item, itemIndex) => <li key={itemIndex}><InlineMarkdown tokens={item} /></li>)}</ol>;
      return <p key={index}><InlineMarkdown tokens={block.content} /></p>;
    })}
  </div>;
}

export default function AiChatBox() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AiUiMessage[]>([
    { role: 'assistant', content: 'Xin chào! Tôi có thể giúp bạn tìm và tư vấn sản phẩm DuoStyle.' },
  ]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      setMessages(current => [...current, { role: 'assistant', content: '' }]);
      const response = await fetch(AI_STREAM_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify(buildAiChatRequest(next)),
      });
      await consumeSseStream(response, delta => {
        setMessages(current => current.map((message, index) => index === current.length - 1
          ? { ...message, content: message.content + delta }
          : message));
      });
    } catch (error: unknown) {
      setMessages(current => {
        const errorMessage = error instanceof Error ? error.message : 'Trợ lý AI đang tạm thời không khả dụng.';
        if (current.at(-1)?.role === 'assistant' && !current.at(-1)?.content) {
          return current.map((message, index) => index === current.length - 1
            ? { ...message, content: errorMessage }
            : message);
        }
        return [...current, { role: 'assistant', content: errorMessage }];
      });
    } finally {
      setLoading(false);
    }
  };

  return <div className="fixed bottom-6 right-6 z-50">
    {open && <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] bg-white border border-outline-variant shadow-2xl rounded-xl flex flex-col overflow-hidden">
      <div className="bg-primary text-white px-4 py-3 flex justify-between items-center">
        <div><div className="font-bold">DuoStyle AI</div><div className="text-[11px] opacity-75">Tư vấn sản phẩm từ dữ liệu cửa hàng</div></div>
        <button onClick={() => setOpen(false)} className="text-xl cursor-pointer">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-low">
        {messages.map((message, index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${message.role === 'user' ? 'bg-primary text-white' : 'bg-white border border-outline-variant text-on-surface'}`}>
            {message.role === 'assistant' ? <ChatMarkdown content={message.content} /> : message.content}
          </div>
        </div>)}
        {loading && <div className="text-xs text-on-surface-variant">DuoStyle AI đang trả lời...</div>}
      </div>
      <form onSubmit={send} className="p-3 border-t border-outline-variant flex gap-2">
        <input value={input} onChange={event => setInput(event.target.value)} maxLength={2000} placeholder="Hỏi về sản phẩm..." className="flex-1 border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        <button disabled={loading || !input.trim()} className="bg-primary text-white px-4 rounded-lg disabled:opacity-40 cursor-pointer">Gửi</button>
      </form>
    </div>}
    <button onClick={() => setOpen(value => !value)} className="ml-auto w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center cursor-pointer" aria-label="Mở trợ lý AI">
      <span className="material-symbols-outlined">smart_toy</span>
    </button>
  </div>;
}
