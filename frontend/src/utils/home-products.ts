export const mapHomeProduct = (product: any) => ({
  id: product.id,
  category: product.categoryName || '',
  name: product.name,
  price: Number(product.basePrice),
  image: product.thumbnailUrl || null,
});

const pageContent = (response: any) => response.data?.data?.content || [];

export async function loadHomeSections(api: any) {
  const [menResponse, womenResponse, newArrivalsResponse] = await Promise.all([
    api.get('/products?gender=MEN&size=4'),
    api.get('/products?gender=WOMEN&size=4'),
    api.get('/products?size=4&sortBy=createdAt&sortDir=desc'),
  ]);

  return {
    forHim: pageContent(menResponse).map(mapHomeProduct),
    forHer: pageContent(womenResponse).map(mapHomeProduct),
    newArrivals: pageContent(newArrivalsResponse).map(mapHomeProduct),
  };
}

export const mapCartItems = (cart: any) => (cart?.items || []).map((item: any) => ({
  id: item.id,
  productVariantId: item.productVariantId,
  productName: item.productName || '',
  variantDetails: `${item.color || 'Tiêu chuẩn'} / Size ${item.size || 'FREE'}`,
  price: item.price,
  quantity: item.quantity,
  image: item.thumbnailUrl || null,
}));

export function getHomeSectionState({ loading, error, products }: { loading: boolean; error: boolean; products: any[] }) {
  if (loading) return 'loading';
  if (error) return 'error';
  return products.length === 0 ? 'empty' : 'results';
}
