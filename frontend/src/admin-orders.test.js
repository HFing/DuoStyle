import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAdminOrders } from './utils/admin-orders.ts';

test('admin orders unwraps the paginated API response into an array', () => {
  const orders = [{ id: 1, totalAmount: 299000 }];

  assert.deepEqual(normalizeAdminOrders({ content: orders, totalPages: 1 }), orders);
});

test('admin orders keeps legacy array responses and rejects invalid values', () => {
  const orders = [{ id: 2 }];

  assert.deepEqual(normalizeAdminOrders(orders), orders);
  assert.deepEqual(normalizeAdminOrders(null), []);
  assert.deepEqual(normalizeAdminOrders({ content: null }), []);
});
