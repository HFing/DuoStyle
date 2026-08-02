import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getProductDetailState,
  isProductVariantActionable,
  mapProductDetail,
  resolveSelectedProductId,
} from '../services/productService.ts';
import * as productDetail from '../services/productService.ts';

test('size and color selection resolves the exact in-stock variant', () => {
  assert.equal(typeof productDetail.getVariantSelection, 'function');
  const variants = [
    { id: 81, size: 'M', color: 'Đỏ', stockQuantity: 0 },
    { id: 82, size: 'M', color: 'Xanh', stockQuantity: 4 },
    { id: 83, size: 'L', color: 'Đen', stockQuantity: 2 },
  ];

  const selection = productDetail.getVariantSelection(variants, 'M', 'Xanh');

  assert.deepEqual(selection.sizeOptions, [
    { size: 'M', stockQuantity: 4, disabled: false },
    { size: 'L', stockQuantity: 2, disabled: false },
  ]);
  assert.deepEqual(selection.colorOptions, [
    { color: 'Đỏ', stockQuantity: 0, disabled: true },
    { color: 'Xanh', stockQuantity: 4, disabled: false },
  ]);
  assert.equal(selection.variant.id, 82);
});

test('variant selection never falls back to another color and chooses an in-stock initial variant', () => {
  assert.equal(typeof productDetail.getInitialVariantSelection, 'function');
  const variants = [
    { id: 81, size: 'M', color: 'Đỏ', stockQuantity: 0 },
    { id: 82, size: 'M', color: 'Xanh', stockQuantity: 4 },
  ];

  assert.equal(productDetail.getVariantSelection(variants, 'M', 'Tím').variant, null);
  assert.deepEqual(productDetail.getInitialVariantSelection(variants), { size: 'M', color: 'Xanh' });
});

test('mapProductDetail keeps only requested database product fields without sample fallbacks', () => {
  assert.deepEqual(mapProductDetail({
    id: 17,
    name: 'Duo Jacket',
    basePrice: '990000',
    categoryName: null,
    description: null,
    thumbnailUrl: null,
    images: [],
    variants: [],
  }), {
    id: 17,
    name: 'Duo Jacket',
    price: 990000,
    category: '',
    description: '',
    images: [],
    variants: [],
  });
});

test('mapProductDetail uses a database thumbnail when the database gallery is empty', () => {
  assert.deepEqual(mapProductDetail({
    id: 18,
    name: 'Duo Shirt',
    basePrice: 450000,
    thumbnailUrl: '/uploads/duo-shirt.jpg',
    variants: [{ id: 81, size: 'M', stockQuantity: 3 }],
  }).images, ['/uploads/duo-shirt.jpg']);
});

test('product detail state keeps loading and failure non-actionable', () => {
  assert.equal(getProductDetailState({ loading: true, error: false, product: null }), 'loading');
  assert.equal(getProductDetailState({ loading: false, error: true, product: null }), 'error');
  assert.equal(getProductDetailState({ loading: false, error: false, product: null }), 'empty');
  assert.equal(getProductDetailState({ loading: false, error: false, product: { id: 17 } }), 'ready');

  assert.equal(isProductVariantActionable(null, null), false);
  assert.equal(isProductVariantActionable({ id: 17 }, { id: 81, stockQuantity: 0 }), false);
  assert.equal(isProductVariantActionable({ id: 17 }, { id: 81, stockQuantity: 3 }), true);
});

test('product detail navigation never retains a prior ID when the requested ID is invalid', () => {
  assert.equal(resolveSelectedProductId('product-detail', 17), 17);
  assert.equal(resolveSelectedProductId('product-detail', '18'), 18);
  assert.equal(resolveSelectedProductId('product-detail', null), null);
  assert.equal(resolveSelectedProductId('product-detail', 0), null);
  assert.equal(resolveSelectedProductId('product-detail', -1), null);
  assert.equal(resolveSelectedProductId('product-detail', 'not-an-id'), null);
  assert.equal(resolveSelectedProductId('collections', 17), null);
});
