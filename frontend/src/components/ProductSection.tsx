import React from 'react';
import ProductCard from './ProductCard';
import { getHomeSectionState } from '../utils/home-products';

const NEUTRAL_PRODUCT_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"%3E%3Crect width="800" height="1000" fill="%23e7e5e4"/%3E%3Cpath d="M300 430h200v140H300z" fill="none" stroke="%2378716c" stroke-width="12"/%3E%3Ccircle cx="360" cy="475" r="22" fill="%2378716c"/%3E%3Cpath d="m320 545 58-58 42 42 32-32 48 48" fill="none" stroke="%2378716c" stroke-width="12"/%3E%3C/svg%3E';

export default function ProductSection({
  id,
  title,
  subtitle,
  linkText,
  isDark = false,
  products = [],
  loading = false,
  error = false,
  onRetry,
  onQuickShop,
}) {
  const state = getHomeSectionState({ loading, error, products });

  return (
    <section id={id} className={`py-section-gap ${isDark ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-primary'}`}>
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
          <div>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg italic tracking-tight uppercase">
              {title}
            </h2>
            {subtitle && (
              <p className={`font-label-caps text-label-caps uppercase tracking-widest mt-2 ${isDark ? 'text-on-primary/60' : 'text-on-surface-variant'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {linkText && (
            <a 
              className={`font-label-caps text-label-caps uppercase tracking-widest border-b pb-1 ${
                isDark ? 'border-on-primary text-on-primary' : 'border-primary text-primary'
              }`} 
              href="#"
            >
              {linkText}
            </a>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {state === 'loading' && Array.from({ length: 4 }, (_, index) => (
            <div
              aria-hidden="true"
              className={`animate-pulse aspect-[4/5] ${isDark ? 'bg-white/10' : 'bg-surface-container'}`}
              key={index}
            />
          ))}

          {state === 'error' && (
            <div className="col-span-2 md:col-span-4 py-14 text-center">
              <p className="font-body-md text-body-md mb-5">
                Không thể tải sản phẩm. Vui lòng thử lại.
              </p>
              <button
                className={`font-label-caps text-label-caps uppercase tracking-widest border px-6 py-3 ${
                  isDark ? 'border-on-primary text-on-primary' : 'border-primary text-primary'
                }`}
                onClick={onRetry}
                type="button"
              >
                Thử lại
              </button>
            </div>
          )}

          {state === 'empty' && (
            <p className="col-span-2 md:col-span-4 py-14 text-center font-body-md text-body-md">
              Chưa có sản phẩm trong mục này.
            </p>
          )}

          {state === 'results' && products.map((prod, idx) => (
            <ProductCard 
              key={prod.id || idx} 
              id={prod.id}
              category={prod.category} 
              name={prod.name} 
              price={prod.price} 
              image={prod.image || NEUTRAL_PRODUCT_PLACEHOLDER} 
              isDark={isDark} 
              onQuickShop={onQuickShop}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
