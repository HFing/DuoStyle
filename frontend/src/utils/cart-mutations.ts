export function requireCartVariant(product: any, selectedVariant: any) {
  const variant = product?.variants?.find(
    (candidate: any) => String(candidate.id) === String(selectedVariant?.id),
  );

  if (!product?.id || !variant?.id) {
    throw new Error('A valid database variant is required for cart mutation');
  }

  if (!(Number(variant.stockQuantity) > 0)) {
    throw new Error('An in-stock database variant is required for cart mutation');
  }

  return variant;
}

export async function runAuthoritativeCartMutation({ mutate, reload }: { mutate: () => Promise<any>; reload: () => Promise<any> }) {
  try {
    await mutate();
  } catch (error) {
    try {
      await reload();
    } catch {
      // Preserve the original mutation failure for the UI.
    }
    throw error;
  }

  await reload();
}
