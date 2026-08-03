import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('OrderInvoiceModal component file exists and contains essential features', () => {
  const filePath = path.resolve('src/components/admin/OrderInvoiceModal.tsx');
  assert.equal(fs.existsSync(filePath), true, 'OrderInvoiceModal.tsx should exist');
  
  const content = fs.readFileSync(filePath, 'utf8');
  assert.equal(content.includes('OrderInvoiceModal'), true, 'Should declare OrderInvoiceModal');
  assert.equal(content.includes('window.print()'), true, 'Should include print trigger window.print()');
  assert.equal(content.includes('@media print'), true, 'Should include @media print CSS rules');
  assert.equal(content.includes('HÓA ĐƠN BÁN HÀNG'), true, 'Should include invoice header');
});
