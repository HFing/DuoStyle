import assert from 'node:assert/strict';
import test from 'node:test';

import { requireCartVariant, runAuthoritativeCartMutation } from '../services/cartService.ts';

test('requireCartVariant preserves the exact selected database variant', () => {
  const blue = { id: 101, size: 'M', color: 'Blue', price: 500000, stockQuantity: 2 };
  const black = { id: 102, size: 'M', color: 'Black', price: 550000, stockQuantity: 3 };

  assert.equal(requireCartVariant({ id: 7, variants: [blue, black] }, black), black);
});

test('requireCartVariant rejects missing or foreign variants instead of inventing a fallback ID', () => {
  const product = { id: 7, variants: [{ id: 101, size: 'M', stockQuantity: 2 }] };

  assert.throws(() => requireCartVariant(product, null), /valid database variant/i);
  assert.throws(
    () => requireCartVariant(product, { id: 999, size: 'M', stockQuantity: 2 }),
    /valid database variant/i,
  );
});

test('requireCartVariant rejects database variants without positive stock', () => {
  for (const stockQuantity of [undefined, null, 0, -1]) {
    const variant = { id: 101, size: 'M', stockQuantity };
    assert.throws(
      () => requireCartVariant({ id: 7, variants: [variant] }, variant),
      /in-stock database variant/i,
    );
  }
});

test('runAuthoritativeCartMutation reloads server state after a successful mutation', async () => {
  const calls = [];

  await runAuthoritativeCartMutation({
    mutate: async () => { calls.push('mutate'); },
    reload: async () => { calls.push('reload'); },
  });

  assert.deepEqual(calls, ['mutate', 'reload']);
});

test('runAuthoritativeCartMutation rolls back from the server after a failed mutation', async () => {
  const calls = [];
  const failure = new Error('server rejected mutation');

  await assert.rejects(
    runAuthoritativeCartMutation({
      mutate: async () => {
        calls.push('mutate');
        throw failure;
      },
      reload: async () => { calls.push('reload'); },
    }),
    error => error === failure,
  );

  assert.deepEqual(calls, ['mutate', 'reload']);
});
