import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getHomeSectionState,
  loadHomeSections,
  mapCartItems,
  mapHomeProduct,
} from './utils/home-products.ts';

test('mapHomeProduct maps a database product without a sample fallback', () => {
  assert.deepEqual(mapHomeProduct({
    id: 7,
    categoryName: 'Ao khoac',
    name: 'Duo Jacket',
    basePrice: '990000',
    thumbnailUrl: null,
  }), {
    id: 7,
    category: 'Ao khoac',
    name: 'Duo Jacket',
    price: 990000,
    image: null,
  });
});

test('loadHomeSections maps MEN, WOMEN, and newest database pages', async () => {
  const calls = [];
  const pages = {
    '/products?gender=MEN&size=4': [{ id: 1, name: 'Men shirt', basePrice: 100000, thumbnailUrl: '/men.jpg' }],
    '/products?gender=WOMEN&size=4': [{ id: 2, name: 'Women shirt', basePrice: 200000, thumbnailUrl: '/women.jpg' }],
    '/products?size=4&sortBy=createdAt&sortDir=desc': [{ id: 3, name: 'Newest shirt', basePrice: 300000, thumbnailUrl: '/new.jpg' }],
  };
  const fakeApi = {
    async get(url) {
      calls.push(url);
      return { data: { data: { content: pages[url] } } };
    },
  };

  const sections = await loadHomeSections(fakeApi);

  assert.deepEqual(calls, [
    '/products?gender=MEN&size=4',
    '/products?gender=WOMEN&size=4',
    '/products?size=4&sortBy=createdAt&sortDir=desc',
  ]);
  assert.deepEqual(sections, {
    forHim: [{ id: 1, category: '', name: 'Men shirt', price: 100000, image: '/men.jpg' }],
    forHer: [{ id: 2, category: '', name: 'Women shirt', price: 200000, image: '/women.jpg' }],
    newArrivals: [{ id: 3, category: '', name: 'Newest shirt', price: 300000, image: '/new.jpg' }],
  });
});

test('loadHomeSections keeps empty database pages empty', async () => {
  const fakeApi = {
    async get() {
      return { data: { data: { content: [] } } };
    },
  };

  assert.deepEqual(await loadHomeSections(fakeApi), {
    forHim: [],
    forHer: [],
    newArrivals: [],
  });
});

test('mapCartItems preserves checkout variant IDs and resets an empty server cart', () => {
  assert.deepEqual(mapCartItems({
    items: [{
      id: 51,
      productVariantId: 801,
      productName: 'Duo Jacket',
      color: 'Black',
      size: 'M',
      price: 990000,
      quantity: 2,
      thumbnailUrl: null,
    }],
  }), [{
    id: 51,
    productVariantId: 801,
    productName: 'Duo Jacket',
    variantDetails: 'Black / Size M',
    price: 990000,
    quantity: 2,
    image: null,
  }]);
  assert.deepEqual(mapCartItems({ items: [] }), []);
  assert.deepEqual(mapCartItems(null), []);
});

test('getHomeSectionState distinguishes loading, failure, empty, and database results', () => {
  assert.equal(getHomeSectionState({ loading: true, error: false, products: [] }), 'loading');
  assert.equal(getHomeSectionState({ loading: false, error: true, products: [] }), 'error');
  assert.equal(getHomeSectionState({ loading: false, error: false, products: [] }), 'empty');
  assert.equal(getHomeSectionState({
    loading: false,
    error: false,
    products: [{ id: 7 }],
  }), 'results');
});
