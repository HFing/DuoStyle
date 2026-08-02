import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCategoryGroups,
  findCategoryGroup,
  firstSelectableCategory,
} from '../services/categoryService.ts';

const tree = [
  {
    id: 41,
    name: 'Thời trang Nam',
    genderTarget: 'MEN',
    subCategories: [
      { id: 77, name: 'Áo sơ mi', genderTarget: 'MEN', subCategories: [] },
      {
        id: 81,
        name: 'Áo khoác',
        genderTarget: 'MEN',
        subCategories: [{ id: 95, name: 'Áo măng tô', genderTarget: 'MEN', subCategories: [] }],
      },
    ],
  },
  {
    id: 58,
    name: 'Phụ kiện',
    genderTarget: 'UNISEX',
    subCategories: [{ id: 103, name: 'Túi xách', genderTarget: 'UNISEX', subCategories: [] }],
  },
];

test('category groups use live backend IDs and flatten selectable descendants', () => {
  assert.deepEqual(buildCategoryGroups(tree), [
    {
      id: 41,
      name: 'Thời trang Nam',
      genderTarget: 'MEN',
      categories: [
        { id: 77, name: 'Áo sơ mi' },
        { id: 81, name: 'Áo khoác' },
        { id: 95, name: 'Áo măng tô' },
      ],
    },
    {
      id: 58,
      name: 'Phụ kiện',
      genderTarget: 'UNISEX',
      categories: [{ id: 103, name: 'Túi xách' }],
    },
  ]);
});

test('category selection resolves the parent group and a safe default category', () => {
  const groups = buildCategoryGroups(tree);

  assert.equal(findCategoryGroup(groups, 95)?.id, 41);
  assert.equal(firstSelectableCategory(groups[1])?.id, 103);
  assert.equal(findCategoryGroup(groups, 999), null);
});

test('a root without children remains selectable instead of producing an empty dropdown', () => {
  const groups = buildCategoryGroups([{ id: 200, name: 'Sale', genderTarget: 'UNISEX', subCategories: [] }]);

  assert.deepEqual(groups[0].categories, [{ id: 200, name: 'Sale' }]);
});
