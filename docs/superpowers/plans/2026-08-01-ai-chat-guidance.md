# DuoStyle AI Guidance-Only Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make product chat readable in its narrow panel and prevent it from claiming cart, order, or payment actions it cannot perform.

**Architecture:** Combine the administrator-managed prompt with immutable application capability rules in the AI service before every synchronous or streaming request. Render a deliberately small safe Markdown subset in React without raw HTML or a new runtime dependency.

**Tech Stack:** Java 25, Spring Boot 4.1, Spring AI 2.0.0-M4, JUnit, React 19, TypeScript, Node test runner.

## Global Constraints

- Keep the existing `searchProducts` and `getProductDetail` tools.
- Preserve SSE streaming.
- Never claim an item was added to cart, ordered, reserved, or paid.
- Guide customers to the existing product detail, `Thêm vào giỏ`, and `Mua ngay` controls.
- Do not enable raw HTML rendering.
- Do not use Markdown tables in AI answers.
- Return no more than the requested product count; use at most three when no count is requested.

---

### Task 1: Immutable AI capability rules

**Files:**
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/AiChatServiceImpl.java`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/ai/AiChatServiceImplTest.java`

**Interfaces:**
- Consumes: `AiSettingsService.getSystemPrompt()` administrator text.
- Produces: `String effectiveSystemPrompt()` used by both `chat()` and `stream()`.

- [ ] **Step 1: Write failing tests**

Add tests that capture the system text passed to `ChatClient` and assert it contains explicit prohibitions for successful cart/order/payment claims, forbids Markdown tables, requires UI guidance, and limits recommendations to three by default.

- [ ] **Step 2: Verify the tests fail**

Run the AI service test class and confirm the immutable rules are absent from the current prompt.

- [ ] **Step 3: Implement the effective prompt**

Add one application-owned Vietnamese instruction constant and append it to the editable database prompt. Use the combined prompt in both synchronous and streaming calls.

- [ ] **Step 4: Verify the tests pass**

Run the AI service tests and confirm all assertions pass.

### Task 2: Safe compact Markdown rendering

**Files:**
- Create: `frontend/src/utils/chat-markdown.tsx`
- Modify: `frontend/src/components/AiChatBox.tsx`
- Test: `frontend/src/ai-chat.test.js`

**Interfaces:**
- Consumes: assistant message text accumulated by the SSE parser.
- Produces: `renderChatMarkdown(content: string): React.ReactNode` supporting paragraphs, bold spans, and list items.

- [ ] **Step 1: Write failing formatter tests**

Test a pure exported `parseChatMarkdown(content)` representation so bold content and ordered/unordered list lines are recognized while raw HTML remains plain text.

- [ ] **Step 2: Verify the tests fail**

Run the frontend AI chat tests and confirm the parser export is missing.

- [ ] **Step 3: Implement parser and renderer**

Create a dependency-free parser for paragraphs and list lines with inline `**bold**`. Render React elements from parsed tokens and never use `dangerouslySetInnerHTML`.

- [ ] **Step 4: Integrate the renderer**

Use the Markdown renderer only for assistant messages; keep user messages as plain text. Retain SSE state updates and existing layout.

- [ ] **Step 5: Verify frontend behavior**

Run frontend tests and the Vite production build.

### Task 3: End-to-end verification

**Files:**
- Verify all modified files from Tasks 1 and 2.

**Interfaces:**
- Consumes: MySQL product data, Groq streaming endpoint, and the existing chat UI.
- Produces: verified guidance-only product responses.

- [ ] **Step 1: Run all backend tests**

Run Maven tests and require zero failures.

- [ ] **Step 2: Run all frontend tests and build**

Run `npm test` and `npm run build`, requiring successful exits.

- [ ] **Step 3: Smoke-test a product selection message**

Send `Navy Blue M 1` after a product recommendation and verify the response instructs the customer to use the product page instead of claiming an order succeeded.

Git commit steps are omitted because `C:\Study\CayThue\DuoStyle` is not a Git repository.
