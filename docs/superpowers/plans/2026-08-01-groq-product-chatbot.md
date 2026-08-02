# DuoStyle Groq Product Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public floating product chatbot powered by Groq through Spring AI, with MySQL-backed admin-editable system instructions and database product tools.

**Architecture:** Spring AI's OpenAI-compatible `ChatClient` calls Groq and registers two local product tools. A singleton `AiSettings` row owns the active system prompt; the browser supplies only a bounded recent conversation, while the admin dashboard manages the prompt through role-protected endpoints.

**Tech Stack:** Java 25, Spring Boot 4.1, Spring AI OpenAI starter, Groq OpenAI-compatible API, JPA/MySQL, JUnit 5/Mockito, React 19/TypeScript, Node test runner, Vite.

## Global Constraints

- Public chat requires no login and stores no conversation in MySQL.
- MySQL stores one active system prompt only.
- Product facts must come from registered tools and current database responses.
- Read Groq credentials only from `GROQ_API_KEY`; never commit the key.
- Default model is `llama-3.3-70b-versatile` and base URL is `https://api.groq.com/openai/v1`.
- No streaming, RAG, vector database, analytics, prompt versions, or moderation dashboard.

---

### Task 1: Spring AI dependency and prompt settings persistence

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/application.yaml`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/entity/AiSettings.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/repository/AiSettingsRepository.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/service/AiSettingsService.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/AiSettingsServiceImpl.java`
- Create: `backend/src/test/java/com/DuoStyle/DuoStyle/ai/AiSettingsServiceImplTest.java`
- Modify: `backend/.env.example`

**Interfaces:**
- Produces `String getSystemPrompt()` and `AiSettingsResponse updateSystemPrompt(String prompt)`.
- Singleton row uses ID `1L`; missing data returns and persists a default Vietnamese product-adviser prompt.

- [ ] Write failing tests for default prompt creation, existing prompt retrieval, blank rejection, and prompt update.
- [ ] Run `mvn -Dtest=AiSettingsServiceImplTest test`; expect missing production types.
- [ ] Add Spring AI BOM/starter compatible with Spring Boot 4.1, Groq base URL/key/model properties, entity/repository/service, 8,000-character validation, and non-secret `.env.example` entries.
- [ ] Run the focused test and expect all cases to pass.

### Task 2: Product tool contracts

**Files:**
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/ai/ProductTools.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/response/AiProductSummary.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/response/AiProductDetail.java`
- Create: `backend/src/test/java/com/DuoStyle/DuoStyle/ai/ProductToolsTest.java`

**Interfaces:**
- Produces `searchProducts(String keyword, String gender, BigDecimal minPrice, BigDecimal maxPrice)` with at most six summaries.
- Produces `getProductDetail(Long productId)` with product and database variant data.
- Both methods are annotated with Spring AI `@Tool` and delegate to `ProductService`.

- [ ] Write failing tests for search filters/result limit, detail mapping, empty search, and real `ToolCallbacks.from(productTools)` schema plus JSON callback invocation.
- [ ] Run the focused test; expect missing tool class.
- [ ] Implement compact immutable DTOs and tool methods using the existing public product service.
- [ ] Run the focused test and expect it to pass.

### Task 3: Chat orchestration and HTTP APIs

**Files:**
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/request/AiChatRequest.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/request/AiChatMessage.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/request/UpdateAiSettingsRequest.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/response/AiChatResponse.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/response/AiSettingsResponse.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/service/AiChatService.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/AiChatServiceImpl.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/controller/AiChatController.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/controller/AdminAiSettingsController.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/config/SecurityConfig.java`
- Create: `backend/src/test/java/com/DuoStyle/DuoStyle/ai/AiChatServiceImplTest.java`
- Create: `backend/src/test/java/com/DuoStyle/DuoStyle/ai/AiControllerSecurityTest.java`

**Interfaces:**
- Public `POST /api/v1/ai/chat` accepts `{message, history:[{role,content}]}` and returns `{message}` inside `ApiResponse`.
- Admin `GET/PUT /api/v1/admin/ai-settings` reads/updates `{systemPrompt}`.
- Service retains only ten valid recent USER/ASSISTANT messages, limits content length, loads the current prompt, and registers `ProductTools`.

- [ ] Write failing orchestration tests for history bounds, prompt injection, tool registration, blank messages, and controlled upstream errors.
- [ ] Write failing MockMvc security tests proving public chat access and `ROLE_ADMIN` protection for settings.
- [ ] Implement minimal DTO validation, ChatClient orchestration, controllers, security matcher, and safe `503` provider error mapping.
- [ ] Run both focused test classes and expect them to pass.

### Task 4: Floating customer chatbox

**Files:**
- Create: `frontend/src/utils/ai-chat.ts`
- Create: `frontend/src/ai-chat.test.js`
- Create: `frontend/src/components/AiChatBox.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Produces `buildAiChatRequest(messages)` that sends the latest user message and at most ten earlier USER/ASSISTANT messages.
- `AiChatBox` calls `/ai/chat`, keeps local state only, shows loading/errors, and invokes `onOpenProduct(id)` for product links.

- [ ] Write failing Node tests for history truncation, role normalization, empty-message rejection, and safe product-reference parsing.
- [ ] Run `npm.cmd test`; expect missing helper exports.
- [ ] Implement helpers and the bottom-right floating panel, then mount it on all non-admin pages in `App.tsx`.
- [ ] Run all frontend tests and expect zero failures.

### Task 5: Admin system-prompt editor

**Files:**
- Create: `frontend/src/components/AdminAiSettings.tsx`
- Modify: `frontend/src/pages/AdminDashboardPage.tsx`

**Interfaces:**
- Component loads `/admin/ai-settings`, edits `systemPrompt`, saves via `PUT`, rejects blank or over-8,000-character text, and uses `showToast`.

- [ ] Add the `ai-settings` admin navigation item and render the focused editor component.
- [ ] Verify loading, save, validation, and API error states through frontend build/type checking.

### Task 6: Full verification

**Files:**
- Verify all files above; do not place secrets in source.

- [ ] Run full backend `mvn test`; expect zero failures.
- [ ] Run `npm.cmd test` and `npm.cmd run build`; expect zero failures.
- [ ] Search `backend/src`, `frontend/src`, and examples for an actual Groq key pattern; expect no secret values.
- [ ] Start MySQL/backend/frontend, call public chat with a product question, verify a tool-backed response, update the system prompt as admin, and verify the next chat uses it.
