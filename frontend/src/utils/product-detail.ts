export function mapProductDetail(product: any) {
  const gallery = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const images = gallery.length > 0
    ? gallery
    : (product.thumbnailUrl ? [product.thumbnailUrl] : []);

  return {
    id: product.id,
    name: product.name,
    price: Number(product.basePrice),
    category: product.categoryName || '',
    description: product.description || '',
    images,
    variants: Array.isArray(product.variants) ? product.variants : [],
  };
}

export function getProductDetailState({ loading, error, product }: { loading: boolean; error: boolean; product: any }) {
  if (loading) return 'loading';
  if (error) return 'error';
  return product ? 'ready' : 'empty';
}

export const isProductVariantActionable = (product: any, variant: any) => Boolean(
  product?.id
  && variant?.id
  && Number(variant.stockQuantity) > 0
);

export const productSizeLabel = (size: string) => (
  !size || size === 'FREE_SIZE' ? 'FREE' : size
);

export function getVariantSelection(variants: any[] = [], selectedSize = '', selectedColor = '') {
  const sizeOptions: any[] = [];
  const sizeIndex = new Map<string, number>();

  for (const variant of variants) {
    const size = productSizeLabel(variant.size);
    const stockQuantity = Math.max(0, Number(variant.stockQuantity) || 0);
    if (!sizeIndex.has(size)) {
      sizeIndex.set(size, sizeOptions.length);
      sizeOptions.push({ size, stockQuantity, disabled: stockQuantity === 0 });
    } else {
      const index = sizeIndex.get(size)!;
      const totalStock = sizeOptions[index].stockQuantity + stockQuantity;
      sizeOptions[index] = { size, stockQuantity: totalStock, disabled: totalStock === 0 };
    }
  }

  const colorOptions = variants
    .filter(variant => productSizeLabel(variant.size) === selectedSize)
    .map(variant => {
      const stockQuantity = Math.max(0, Number(variant.stockQuantity) || 0);
      return {
        color: variant.color || '',
        stockQuantity,
        disabled: stockQuantity === 0,
      };
    });

  const normalizedColor = selectedColor || '';
  const variant = variants.find(candidate => (
    productSizeLabel(candidate.size) === selectedSize
    && (candidate.color || '') === normalizedColor
  )) || null;

  return { sizeOptions, colorOptions, variant };
}

export function getInitialVariantSelection(variants: any[] = []) {
  const initialVariant = variants.find(variant => Number(variant.stockQuantity) > 0) || variants[0];
  return initialVariant
    ? { size: productSizeLabel(initialVariant.size), color: initialVariant.color || '' }
    : { size: '', color: '' };
}

export function resolveSelectedProductId(page: string, requestedProductId: any) {
  if (page !== 'product-detail') return null;

  const normalizedId = Number(requestedProductId);
  return Number.isInteger(normalizedId) && normalizedId > 0 ? normalizedId : null;
}
