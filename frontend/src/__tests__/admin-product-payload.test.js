import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProductRequest, buildStockProductRequest, validateProductDraft } from '../services/adminService.ts';

const product = {
  id: 4,
  name: 'Linen Shirt',
  slug: 'linen-shirt',
  description: 'Breathable linen',
  basePrice: 250000,
  thumbnailUrl: 'https://cdn/main.jpg',
  genderTarget: 'MEN',
  categoryId: 9,
  images: ['https://cdn/main.jpg', 'https://cdn/back.jpg'],
  variants: [
    { id: 11, size: 'M', color: 'Black', sku: 'SKU-M', price: 250000, stockQuantity: 2 },
    { id: 12, size: 'L', color: 'Black', sku: 'SKU-L', price: 260000, stockQuantity: 3 },
  ],
};

test('stock product request changes quantities without dropping backend product fields', () => {
  assert.deepEqual(buildStockProductRequest(product, { 11: 4 }), {
    name: 'Linen Shirt',
    slug: 'linen-shirt',
    description: 'Breathable linen',
    basePrice: 250000,
    thumbnailUrl: 'https://cdn/main.jpg',
    genderTarget: 'MEN',
    categoryId: 9,
    images: ['https://cdn/main.jpg', 'https://cdn/back.jpg'],
    variants: [
      { id: 11, size: 'M', color: 'Black', sku: 'SKU-M', price: 250000, stockQuantity: 4 },
      { id: 12, size: 'L', color: 'Black', sku: 'SKU-L', price: 260000, stockQuantity: 3 },
    ],
  });
});

test('product request emits only fields accepted by ProductRequest and complete variants', () => {
  const request = buildProductRequest({
    ...product,
    materialCare: 'ignored legacy field',
    primaryImageUrl: 'ignored legacy field',
    variants: [{ size: 'S', color: 'Blue', sku: 'BLUE-S', price: '199000', stockQuantity: '6', id: 88 }],
  });

  assert.deepEqual(request, {
    name: 'Linen Shirt',
    slug: 'linen-shirt',
    description: 'Breathable linen',
    basePrice: 250000,
    thumbnailUrl: 'https://cdn/main.jpg',
    genderTarget: 'MEN',
    categoryId: 9,
    images: ['https://cdn/main.jpg', 'https://cdn/back.jpg'],
    variants: [{ id: 88, size: 'S', color: 'Blue', sku: 'BLUE-S', price: 199000, stockQuantity: 6 }],
  });
  assert.equal('materialCare' in request, false);
});

test('product draft validation rejects missing business input instead of inventing defaults', () => {
  const valid = {
    name: 'Áo linen',
    skuPrefix: 'LINEN',
    basePrice: 450000,
    categoryId: 7,
    thumbnailUrl: 'https://cdn/item.jpg',
    variants: [{ size: 'M', stockQuantity: 2 }],
  };

  assert.equal(validateProductDraft({ ...valid, name: ' ' }), 'Vui lòng nhập tên sản phẩm.');
  assert.equal(validateProductDraft({ ...valid, skuPrefix: '' }), 'Vui lòng nhập mã SKU prefix.');
  assert.equal(validateProductDraft({ ...valid, basePrice: 0 }), 'Giá bán phải lớn hơn 0.');
  assert.equal(validateProductDraft({ ...valid, categoryId: '' }), 'Vui lòng chọn danh mục sản phẩm.');
  assert.equal(validateProductDraft({ ...valid, thumbnailUrl: '' }), 'Vui lòng tải ảnh chính của sản phẩm.');
  assert.equal(validateProductDraft({ ...valid, variants: [] }), 'Vui lòng nhập tồn kho cho ít nhất một size.');
  assert.equal(validateProductDraft(valid), null);
});
