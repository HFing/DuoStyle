# DuoStyle AI guidance-only chat design

## Goal

Make product chat concise and readable while ensuring it never claims to add to cart, place an order, or complete payment. The assistant only searches database products, explains product details, and guides the customer to use the existing UI.

## Backend behavior

- Keep the existing `searchProducts` and `getProductDetail` tools.
- Extend the effective system instruction with application-owned safety rules that administrators cannot remove:
  - Never claim an item was added to cart, ordered, reserved, or paid.
  - When a customer supplies size, color, or quantity, explain how to open the product detail page, choose the variant, and click `Thêm vào giỏ` or `Mua ngay`.
  - Do not use Markdown tables because the chat panel is narrow.
  - Prefer short bullet lists and return at most the number of products requested; use at most three when no quantity is requested.
- The administrator-managed prompt remains editable and is combined with these fixed capability rules for every request.

## Frontend behavior

- Render safe basic Markdown for assistant messages: paragraphs, bold text, and unordered/ordered lists.
- Do not render raw HTML.
- Tables are intentionally not supported because the backend prompt forbids them.
- Preserve the current SSE streaming behavior.

## Error handling

- Existing AI stream errors continue to show the controlled unavailable message.
- Product tool failures must not be represented as successful cart or order actions.

## Verification

- Backend tests verify fixed capability rules are included even when an administrator supplies a custom prompt.
- Backend tests verify the effective prompt explicitly forbids successful cart/order/payment claims and Markdown tables.
- Frontend tests verify safe Markdown formatting for bold text and lists without enabling raw HTML.
- Run the full backend test suite, frontend test suite, and frontend production build.
