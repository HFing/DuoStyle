import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogFailureState, normalizeCatalogProducts } from './utils/catalog-state.ts';

test('catalog normalization maps only backend products and uses the neutral image placeholder', () => {
  assert.deepEqual(normalizeCatalogProducts({ content: [{
    id: 9,
    name: 'Áo linen',
    categoryName: 'Áo sơ mi',
    basePrice: 450000,
    genderTarget: 'MEN',
    thumbnailUrl: null,
  }] }), [{
    id: 9,
    name: 'Áo linen',
    category: 'Áo sơ mi',
    price: 450000,
    gender: 'Men',
    image: '/product-placeholder.svg',
  }]);
});

test('empty or malformed catalog data never becomes local sample products', () => {
  assert.deepEqual(normalizeCatalogProducts({ content: [] }), []);
  assert.deepEqual(normalizeCatalogProducts(null), []);
  assert.deepEqual(normalizeCatalogProducts({ content: 'invalid' }), []);
});

test('catalog failure explicitly clears products and marks the error', () => {
  assert.deepEqual(catalogFailureState(), { products: [], error: true });
});
