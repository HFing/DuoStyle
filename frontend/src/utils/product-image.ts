export const PRODUCT_PLACEHOLDER_IMAGE = '/product-placeholder.svg';

export function resolveProductImage(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : PRODUCT_PLACEHOLDER_IMAGE;
}
