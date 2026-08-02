import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveProductImage } from './utils/product-image.ts';

test('missing product images use the shared neutral placeholder', () => {
  assert.equal(resolveProductImage(null), '/product-placeholder.svg');
  assert.equal(resolveProductImage(undefined), '/product-placeholder.svg');
  assert.equal(resolveProductImage('   '), '/product-placeholder.svg');
});

test('a backend product image URL is preserved', () => {
  assert.equal(resolveProductImage('https://cdn.example/item.jpg'), 'https://cdn.example/item.jpg');
});
