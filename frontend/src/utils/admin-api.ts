function direct(response: any) {
  return response?.data;
}

function wrapped(response: any) {
  return response?.data?.data;
}

function directList(response: any) {
  return Array.isArray(response?.data) ? response.data : [];
}

function wrappedList(response: any) {
  return Array.isArray(response?.data?.data) ? response.data.data : [];
}

function reviewPage(response: any) {
  const data = response?.data;
  if (!data || !Array.isArray(data.content)) return { content: [], totalPages: 1 };
  return {
    content: data.content,
    totalPages: Number(data.totalPages) > 0 ? Number(data.totalPages) : 1,
  };
}

function imageUrl(image: any) {
  return typeof image === 'string' ? image : image?.imageUrl;
}

export function buildProductRequest(product: any) {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: Number(product.basePrice),
    thumbnailUrl: product.thumbnailUrl,
    genderTarget: product.genderTarget,
    categoryId: Number(product.categoryId),
    images: (Array.isArray(product.images) ? product.images : []).map(imageUrl).filter(Boolean),
    variants: (Array.isArray(product.variants) ? product.variants : []).map((variant: any) => ({
      ...(variant.id != null ? { id: Number(variant.id) } : {}),
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      price: Number(variant.price),
      stockQuantity: Number(variant.stockQuantity),
    })),
  };
}

export function buildStockProductRequest(product: any, stockValues: Record<string, number>) {
  return buildProductRequest({
    ...product,
    variants: (Array.isArray(product?.variants) ? product.variants : []).map((variant: any) => ({
      ...variant,
      stockQuantity: stockValues[variant.id ?? variant.size] ?? variant.stockQuantity,
    })),
  });
}

export function validateProductDraft(draft: any): string | null {
  if (!String(draft?.name || '').trim()) return 'Vui lòng nhập tên sản phẩm.';
  if (!String(draft?.skuPrefix || '').trim()) return 'Vui lòng nhập mã SKU prefix.';
  if (!(Number(draft?.basePrice) > 0)) return 'Giá bán phải lớn hơn 0.';
  if (!draft?.categoryId || !(Number(draft.categoryId) > 0)) return 'Vui lòng chọn danh mục sản phẩm.';
  if (!String(draft?.thumbnailUrl || '').trim()) return 'Vui lòng tải ảnh chính của sản phẩm.';
  const variants = Array.isArray(draft?.variants) ? draft.variants : [];
  if (!variants.some((variant: any) => Number(variant.stockQuantity) > 0)) {
    return 'Vui lòng nhập tồn kho cho ít nhất một size.';
  }
  return null;
}

export function createAdminApi(client: any) {
  return {
    getReviews: (params: any) => client.get('/admin/reviews', { params }).then(reviewPage),
    toggleReview: (id: number) => client.patch(`/admin/reviews/${id}/toggle`).then(direct),
    replyToReview: (id: number, adminReply: string) =>
      client.post(`/admin/reviews/${id}/reply`, { adminReply }).then(direct),

    createProduct: (payload: any) => client.post('/admin/products', payload).then(wrapped),
    updateProduct: (id: number, payload: any) =>
      client.put(`/admin/products/${id}`, payload).then(wrapped),
    deleteProduct: (id: number) => client.delete(`/admin/products/${id}`).then(wrapped),

    createCategory: (payload: any) => client.post('/admin/categories', payload).then(wrapped),
    updateCategory: (id: number, payload: any) =>
      client.put(`/admin/categories/${id}`, payload).then(wrapped),
    deleteCategory: (id: number) => client.delete(`/admin/categories/${id}`).then(wrapped),

    getBanners: () => client.get('/admin/banners').then(directList),
    createBanner: (payload: any) => client.post('/admin/banners', payload).then(direct),
    updateBanner: (id: number, payload: any) =>
      client.put(`/admin/banners/${id}`, payload).then(direct),
    toggleBanner: (id: number) => client.patch(`/admin/banners/${id}/toggle`).then(direct),
    deleteBanner: (id: number) => client.delete(`/admin/banners/${id}`).then(direct),

    getMonthlySales: () => client.get('/admin/orders/analytics/monthly').then(wrappedList),
    getTopProducts: () => client.get('/admin/orders/analytics/top-products').then(wrappedList),
    uploadImage: (formData: FormData) =>
      client.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(wrapped),
  };
}
