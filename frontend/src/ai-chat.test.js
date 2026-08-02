import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAiChatRequest, consumeSseStream } from './utils/ai-chat.ts';
import { parseChatMarkdown } from './utils/chat-markdown.ts';

test('chat request sends the latest user message and at most ten prior messages', () => {
  const messages = Array.from({ length: 12 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }));
  messages.push({ role: 'user', content: '  hỏi áo nam  ' });
  const request = buildAiChatRequest(messages);
  assert.equal(request.message, 'hỏi áo nam');
  assert.equal(request.history.length, 10);
  assert.equal(request.history.at(-1).content, 'm11');
});

test('chat request rejects an empty latest user message', () => {
  assert.throws(() => buildAiChatRequest([{ role: 'user', content: '   ' }]), /empty/i);
});

test('SSE stream appends every delta including data split across network chunks', async () => {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('event: delta\ndata: {"content":"Xin '));
      controller.enqueue(encoder.encode('chào"}\n\nevent: delta\ndata: {"content":" bạn"}\n\nevent: done\ndata: {}\n\n'));
      controller.close();
    },
  });
  const deltas = [];

  await consumeSseStream(new Response(body), delta => deltas.push(delta));

  assert.deepEqual(deltas, ['Xin chào', ' bạn']);
});

test('SSE stream surfaces a server error event', async () => {
  const body = new Response('event: error\ndata: {"message":"Groq unavailable"}\n\n');

  await assert.rejects(
    () => consumeSseStream(body, () => {}),
    /Groq unavailable/,
  );
});

test('chat markdown recognizes bold text and compact lists', () => {
  assert.deepEqual(parseChatMarkdown('**Áo blazer**\n- Màu Navy\n- Chọn size M'), [
    { type: 'paragraph', content: [{ text: 'Áo blazer', bold: true }] },
    { type: 'ul', items: [
      [{ text: 'Màu Navy', bold: false }],
      [{ text: 'Chọn size M', bold: false }],
    ] },
  ]);
});

test('chat markdown keeps raw HTML as plain text tokens', () => {
  assert.deepEqual(parseChatMarkdown('<script>alert(1)</script>'), [
    { type: 'paragraph', content: [{ text: '<script>alert(1)</script>', bold: false }] },
  ]);
});
