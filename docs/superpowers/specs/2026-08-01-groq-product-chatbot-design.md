# DuoStyle Groq Product Chatbot Design

## Goal

Add a public product-advice chatbot powered by Groq through Spring AI. Administrators can edit its system prompt in the existing admin UI, while all product facts come from registered tools backed by MySQL.

## Scope

- Chat is public and does not require authentication.
- Conversation history remains in the browser and is never stored in MySQL.
- MySQL stores one active system prompt record.
- The chatbot answers general fashion questions and uses tools for DuoStyle product facts.
- No streaming, vector database, RAG, moderation dashboard, analytics, or multi-prompt versioning is included.

## Model Integration

- Use Spring AI's OpenAI-compatible chat model integration.
- Configure `spring.ai.openai.base-url=https://api.groq.com/openai/v1`.
- Read the API key from `GROQ_API_KEY` and default the model to `llama-3.3-70b-versatile`.
- Use `ChatClient` with the current MySQL system prompt and registered local tools on each request.
- Bound browser-supplied history to the ten most recent messages and bound individual message length.

## Persistence

Create `ai_settings` with one logical settings row containing the system prompt and timestamps. The service returns a safe default prompt when the row does not yet exist. Admin update creates or replaces the singleton configuration.

The default prompt instructs the assistant to:

- Reply in Vietnamese unless the customer uses another language.
- Be concise, helpful, and act as a DuoStyle fashion adviser.
- Call product tools for product, price, variant, and availability questions.
- Never invent products, prices, stock, discounts, or product IDs.
- State clearly when no matching database product is found.

## Product Tools

`searchProducts(keyword, gender, minPrice, maxPrice)` searches existing public product data through the product service/repository path. It returns at most six compact results containing database ID, name, price, category, thumbnail, and gender.

`getProductDetail(productId)` reuses the existing public product-detail service and returns database ID, name, description, category, price, images, and variants. It exposes stock status or quantity only from current database fields and never infers unavailable data.

Tool descriptions explicitly tell the model when to call each function and what each argument means. Tool callbacks are tested through Spring AI's real tool schema/callback contract rather than prompt text inspection.

## HTTP API and Security

- `POST /api/v1/ai/chat` is public. Request: message plus optional recent role/content messages. Response: assistant text and optional product references gathered from tool results where feasible.
- `GET /api/v1/admin/ai-settings` requires `ROLE_ADMIN`.
- `PUT /api/v1/admin/ai-settings` requires `ROLE_ADMIN`, rejects null/blank prompts, and applies a practical maximum length.
- Existing Spring session authentication and admin authorization remain unchanged.

## Frontend

Add a floating chat launcher at the bottom-right of all non-admin customer pages. The panel shows messages, a text box, send/loading states, a retry-friendly error, and product links that navigate to the existing product-detail page.

Keep the current conversation in React state only. Opening and closing the panel preserves state until refresh; refreshing clears it.

Add an `AI Configuration` section to the existing admin dashboard. It loads the current prompt, allows editing, validates nonblank text, saves through the admin API, and displays existing toast feedback.

## Error Handling

- Missing or invalid `GROQ_API_KEY`: return a controlled service-unavailable response with a Vietnamese message.
- Groq timeout, rate limit, malformed tool call, or upstream failure: return a controlled chat error without exposing provider details or secrets.
- Tool lookup with no match: return an empty result or not-found tool result that the model can explain plainly.
- Invalid chat/admin requests: return the project's standard `ApiResponse` error shape.

## Testing

- Unit-test singleton prompt retrieval/update and validation.
- Test both product tools against service contracts and verify their Spring AI tool definitions/callback invocation.
- Test chat request history bounds, system-prompt loading, tool registration, and provider error mapping with the external model mocked at the boundary.
- Test public chat and admin-only settings endpoints through Spring Security.
- Add frontend pure-function tests for message/history normalization and product-link extraction where applicable.
- Run the full backend suite, frontend tests, and Vite production build.
