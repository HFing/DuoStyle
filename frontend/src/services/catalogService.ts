import { resolveProductImage } from '../utils/product-image.ts';

export function normalizeCatalogProducts(data: any): any[] {
  const content = data && Array.isArray(data.content) ? data.content : [];
  return content.map((product: any) => ({
    id: product.id,
    category: product.categoryName || 'Chưa phân loại',
    name: product.name,
    price: product.basePrice,
    gender: product.genderTarget === 'MEN'
      ? 'Men'
      : product.genderTarget === 'WOMEN'
        ? 'Women'
        : 'Accessories',
    image: resolveProductImage(product.thumbnailUrl),
  }));
}

export function catalogFailureState() {
  return { products: [], error: true };
}
