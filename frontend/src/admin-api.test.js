import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminApi } from './utils/admin-api.ts';

function recordingClient(responses = {}) {
  const calls = [];
  const invoke = (method) => (url, dataOrConfig, maybeConfig) => {
    const call = { method, url };
    if (method === 'get' || method === 'delete') {
      if (dataOrConfig !== undefined) call.config = dataOrConfig;
    } else {
      if (dataOrConfig !== undefined) call.data = dataOrConfig;
      if (maybeConfig !== undefined) call.config = maybeConfig;
    }
    calls.push(call);
    const key = `${method.toUpperCase()} ${url}`;
    return Promise.resolve(responses[key] ?? { data: { data: null } });
  };

  return {
    calls,
    client: {
      get: invoke('get'),
      post: invoke('post'),
      put: invoke('put'),
      patch: invoke('patch'),
      delete: invoke('delete'),
    },
  };
}

test('admin review operations use backend URLs, methods, query names, and direct responses', async () => {
  const reviewPage = { content: [{ id: 7 }], totalPages: 3 };
  const toggled = { id: 7, active: false };
  const replied = { id: 7, adminReply: 'Thanks' };
  const { client, calls } = recordingClient({
    'GET /admin/reviews': { data: reviewPage },
    'PATCH /admin/reviews/7/toggle': { data: toggled },
    'POST /admin/reviews/7/reply': { data: replied },
  });
  const admin = createAdminApi(client);

  assert.deepEqual(await admin.getReviews({ search: 'linen', rating: 5, page: 1, size: 10 }), reviewPage);
  assert.equal(await admin.toggleReview(7), toggled);
  assert.equal(await admin.replyToReview(7, 'Thanks'), replied);
  assert.deepEqual(calls, [
    { method: 'get', url: '/admin/reviews', config: { params: { search: 'linen', rating: 5, page: 1, size: 10 } } },
    { method: 'patch', url: '/admin/reviews/7/toggle' },
    { method: 'post', url: '/admin/reviews/7/reply', data: { adminReply: 'Thanks' } },
  ]);
});

test('admin product and category mutations use admin routes and unwrap ApiResponse data', async () => {
  const product = { id: 4, name: 'Linen Shirt' };
  const category = { id: 9, name: 'Shirts' };
  const payload = { name: 'Linen Shirt' };
  const { client, calls } = recordingClient({
    'POST /admin/products': { data: { data: product } },
    'PUT /admin/products/4': { data: { data: product } },
    'POST /admin/categories': { data: { data: category } },
    'PUT /admin/categories/9': { data: { data: category } },
  });
  const admin = createAdminApi(client);

  assert.equal(await admin.createProduct(payload), product);
  assert.equal(await admin.updateProduct(4, payload), product);
  await admin.deleteProduct(4);
  assert.equal(await admin.createCategory(payload), category);
  assert.equal(await admin.updateCategory(9, payload), category);
  await admin.deleteCategory(9);
  assert.deepEqual(calls, [
    { method: 'post', url: '/admin/products', data: payload },
    { method: 'put', url: '/admin/products/4', data: payload },
    { method: 'delete', url: '/admin/products/4' },
    { method: 'post', url: '/admin/categories', data: payload },
    { method: 'put', url: '/admin/categories/9', data: payload },
    { method: 'delete', url: '/admin/categories/9' },
  ]);
});

test('banner, analytics, and upload operations match their backend response styles', async () => {
  const banners = [{ id: 2, title: 'Summer' }];
  const banner = banners[0];
  const monthly = [{ month: 8, revenue: 1000 }];
  const top = [{ productId: 4, quantitySold: 3 }];
  const formData = new FormData();
  const { client, calls } = recordingClient({
    'GET /admin/banners': { data: banners },
    'POST /admin/banners': { data: banner },
    'PUT /admin/banners/2': { data: banner },
    'PATCH /admin/banners/2/toggle': { data: banner },
    'GET /admin/orders/analytics/monthly': { data: { data: monthly } },
    'GET /admin/orders/analytics/top-products': { data: { data: top } },
    'POST /images/upload': { data: { data: 'https://cdn/image.jpg' } },
  });
  const admin = createAdminApi(client);

  assert.equal(await admin.getBanners(), banners);
  assert.equal(await admin.createBanner(banner), banner);
  assert.equal(await admin.updateBanner(2, banner), banner);
  assert.equal(await admin.toggleBanner(2), banner);
  await admin.deleteBanner(2);
  assert.equal(await admin.getMonthlySales(), monthly);
  assert.equal(await admin.getTopProducts(), top);
  assert.equal(await admin.uploadImage(formData), 'https://cdn/image.jpg');
  assert.deepEqual(calls, [
    { method: 'get', url: '/admin/banners' },
    { method: 'post', url: '/admin/banners', data: banner },
    { method: 'put', url: '/admin/banners/2', data: banner },
    { method: 'patch', url: '/admin/banners/2/toggle' },
    { method: 'delete', url: '/admin/banners/2' },
    { method: 'get', url: '/admin/orders/analytics/monthly' },
    { method: 'get', url: '/admin/orders/analytics/top-products' },
    { method: 'post', url: '/images/upload', data: formData, config: { headers: { 'Content-Type': 'multipart/form-data' } } },
  ]);
});

test('admin list operations reject malformed response bodies instead of exposing sample data', async () => {
  const { client } = recordingClient({
    'GET /admin/banners': { data: { data: [{ id: 99 }] } },
    'GET /admin/reviews': { data: null },
    'GET /admin/orders/analytics/monthly': { data: { data: null } },
    'GET /admin/orders/analytics/top-products': { data: { data: { content: [] } } },
  });
  const admin = createAdminApi(client);

  assert.deepEqual(await admin.getBanners(), []);
  assert.deepEqual(await admin.getReviews({ page: 0, size: 10 }), { content: [], totalPages: 1 });
  assert.deepEqual(await admin.getMonthlySales(), []);
  assert.deepEqual(await admin.getTopProducts(), []);
});
