export type AiUiMessage = { role: 'user' | 'assistant'; content: string };

export function buildAiChatRequest(messages: AiUiMessage[]) {
  const latest = messages.at(-1);
  const message = latest?.role === 'user' ? String(latest.content || '').trim() : '';
  if (!message) throw new Error('Latest user message is empty');
  const history = messages.slice(0, -1)
    .filter(item => (item.role === 'user' || item.role === 'assistant') && item.content?.trim())
    .slice(-10)
    .map(item => ({ role: item.role.toUpperCase(), content: item.content.trim() }));
  return { message, history };
}

export async function consumeSseStream(response: Response, onDelta: (content: string) => void) {
  if (!response.ok) throw new Error('Không thể kết nối với trợ lý AI.');
  if (!response.body) throw new Error('Trình duyệt không hỗ trợ phản hồi dạng stream.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const processEvent = (block: string) => {
    const event = block.split('\n').find(line => line.startsWith('event:'))?.slice(6).trim() || 'message';
    const data = block.split('\n').filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trimStart()).join('\n');
    if (!data) return;
    const payload = JSON.parse(data);
    if (event === 'error' || payload.type === 'error') {
      throw new Error(payload.content || payload.message || 'Trợ lý AI đang tạm thời không khả dụng.');
    }
    if (event === 'delta' || payload.type === 'delta') onDelta(payload.content || '');
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replaceAll('\r\n', '\n');
    let boundary = buffer.indexOf('\n\n');
    while (boundary >= 0) {
      processEvent(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf('\n\n');
    }
    if (done) break;
  }
  if (buffer.trim()) processEvent(buffer);
}
