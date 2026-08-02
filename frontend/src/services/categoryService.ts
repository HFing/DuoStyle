export interface SelectableCategory {
  id: number;
  name: string;
}

export interface CategoryGroup {
  id: number;
  name: string;
  genderTarget: string;
  categories: SelectableCategory[];
}

function descendants(category: any): SelectableCategory[] {
  const children = Array.isArray(category?.subCategories) ? category.subCategories : [];
  return children.flatMap((child: any) => [
    { id: Number(child.id), name: String(child.name || '') },
    ...descendants(child),
  ]);
}

export function buildCategoryGroups(tree: any): CategoryGroup[] {
  if (!Array.isArray(tree)) return [];
  return tree
    .filter((root) => root?.id != null)
    .map((root) => {
      const nested = descendants(root);
      return {
        id: Number(root.id),
        name: String(root.name || ''),
        genderTarget: String(root.genderTarget || 'UNISEX'),
        categories: nested.length > 0
          ? nested
          : [{ id: Number(root.id), name: String(root.name || '') }],
      };
    });
}

export function findCategoryGroup(groups: CategoryGroup[], categoryId: number | string | null) {
  const id = Number(categoryId);
  return groups.find((group) => group.categories.some((category) => category.id === id)) || null;
}

export function firstSelectableCategory(group: CategoryGroup | null | undefined) {
  return group?.categories?.[0] || null;
}
