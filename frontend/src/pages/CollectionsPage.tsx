import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { formatVND } from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { catalogFailureState, normalizeCatalogProducts } from '../utils/catalog-state';

export default function CollectionsPage({ onQuickView, activeCategoryFilter = '', searchKeyword = '', initialSubCategoryId = null }) {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedGender, setSelectedGender] = useState(activeCategoryFilter || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialSubCategoryId || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [keyword, setKeyword] = useState(searchKeyword);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Fetch all categories with parent names
    api.get('/categories')
      .then(res => {
        if (res.data?.data) {
          setCategoriesList(res.data.data);
        }
      })
      .catch(() => setCategoriesList([]));
  }, []);

  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    setSelectedGender(activeCategoryFilter || '');
  }, [activeCategoryFilter]);

  useEffect(() => {
    if (initialSubCategoryId) {
      setSelectedSubCategory(initialSubCategoryId);
    }
  }, [initialSubCategoryId]);

  const fetchFilteredProducts = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    let url = `/products?page=0&size=50&sortBy=${sortBy}&sortDir=${sortDir}`;
    
    if (keyword.trim()) {
      url += `&keyword=${encodeURIComponent(keyword.trim())}`;
    }
    if (selectedSubCategory) {
      url += `&categoryId=${selectedSubCategory}`;
    } else if (selectedGender) {
      const g = selectedGender.toUpperCase() === 'MEN' ? 'MEN' : selectedGender.toUpperCase() === 'WOMEN' ? 'WOMEN' : 'UNISEX';
      url += `&gender=${g}`;
    }
    if (maxPrice < 10000000) {
      url += `&maxPrice=${maxPrice}`;
    }
    if (selectedSize) {
      url += `&sizeFilter=${selectedSize}`;
    }

    api.get(url)
      .then(res => {
        setLoading(false);
        setProducts(normalizeCatalogProducts(res.data?.data));
      })
      .catch(() => {
        setLoading(false);
        const failure = catalogFailureState();
        setProducts(failure.products);
        setLoadError(failure.error);
      });
  }, [sortBy, sortDir, keyword, selectedSubCategory, selectedGender, maxPrice, selectedSize]);

  useEffect(() => {
    setCurrentPage(1);
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  const filteredSubCategories = categoriesList.filter(c => {
    if (!c.parentId) return false; // Filter only subcategories
    if (!selectedGender) return true;
    if (selectedGender === 'Men') return c.genderTarget === 'MEN' || (c.parentName && c.parentName.includes('Nam'));
    if (selectedGender === 'Women') return c.genderTarget === 'WOMEN' || (c.parentName && c.parentName.includes('Nữ'));
    if (selectedGender === 'Accessories') return c.genderTarget === 'UNISEX' || (c.parentName && c.parentName.includes('Phụ'));
    return true;
  });

  const resetAllFilters = () => {
    setKeyword('');
    setSelectedGender('');
    setSelectedSubCategory('');
    setSelectedSize('');
    setMaxPrice(10000000);
    setSortBy('createdAt');
    setSortDir('desc');
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-28 mb-20">
      {/* Category Title & Sorting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-outline-variant pb-6 gap-4">
        <div>
          <span className="font-label-caps text-label-caps text-secondary mb-2 block uppercase tracking-widest">DuoStyle Search & Curation</span>
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg">
            {keyword ? `Kết quả tìm kiếm: "${keyword}"` : selectedSubCategory && categoriesList.find(c => c.id === Number(selectedSubCategory)) ? `Danh Mục: ${categoriesList.find(c => c.id === Number(selectedSubCategory)).name}` : selectedGender ? `Bộ Sưu Tập: ${selectedGender === 'Men' ? 'Thời Trang Nam' : selectedGender === 'Women' ? 'Thời Trang Nữ' : 'Phụ Kiện'}` : 'Tất Cả Bộ Sưu Tập'}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <p className="font-label-caps text-label-caps text-on-surface-variant">Sắp Xếp:</p>
          <div className="relative">
            <button 
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center gap-2 font-label-caps text-label-caps border border-primary px-4 py-2 hover:bg-primary hover:text-on-primary transition-all cursor-pointer font-bold"
            >
              <span>
                {sortBy === 'createdAt' && 'Mới Nhất'}
                {sortBy === 'basePrice' && sortDir === 'asc' && 'Giá: Thấp đến Cao'}
                {sortBy === 'basePrice' && sortDir === 'desc' && 'Giá: Cao đến Thấp'}
              </span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-surface-container-lowest border border-outline-variant shadow-lg z-20">
                <button 
                  onClick={() => { setSortBy('createdAt'); setSortDir('desc'); setIsSortDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 font-label-caps text-label-caps hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Mới Nhất
                </button>
                <button 
                  onClick={() => { setSortBy('basePrice'); setSortDir('asc'); setIsSortDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 font-label-caps text-label-caps hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Giá: Thấp đến Cao
                </button>
                <button 
                  onClick={() => { setSortBy('basePrice'); setSortDir('desc'); setIsSortDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 font-label-caps text-label-caps hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Giá: Cao đến Thấp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-gutter">
        {/* Left Sidebar Filter - Redesigned Luxury Style */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-8 bg-surface-container-lowest p-6 border border-outline-variant/60 shadow-sm rounded-lg">
            {/* Header reset */}
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/60">
              <h3 className="font-label-caps text-xs tracking-widest text-primary font-bold uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-base">tune</span>
                Bộ Lọc Tìm Kiếm
              </h3>
              <button 
                onClick={resetAllFilters}
                className="font-label-caps text-[10px] text-secondary hover:underline cursor-pointer border-none bg-transparent font-bold uppercase"
              >
                Xóa Tất Cả
              </button>
            </div>

            {/* Keyword Search Input Box */}
            <div>
              <label className="font-label-caps text-[11px] text-on-surface-variant mb-2 block uppercase tracking-wider font-bold">Từ Khóa</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full py-2 px-3 bg-surface-container/50 border border-outline-variant/60 rounded focus:border-primary focus:outline-none font-body-md text-xs pr-8 transition-colors"
                />
                {keyword && (
                  <button 
                    onClick={() => setKeyword('')}
                    className="absolute right-2 top-2 text-on-surface-variant hover:text-primary cursor-pointer border-none bg-transparent"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Category / Gender - Styled Pills */}
            <div>
              <label className="font-label-caps text-[11px] text-on-surface-variant mb-3 block uppercase tracking-wider font-bold">Danh Mục Chính</label>
              <div className="space-y-1.5">
                {[
                  { label: 'Tất Cả Giới Tính', value: '' },
                  { label: 'Thời Trang Nữ (Women)', value: 'Women' },
                  { label: 'Thời Trang Nam (Men)', value: 'Men' },
                  { label: 'Phụ Kiện (Accessories)', value: 'Accessories' }
                ].map((cat) => {
                  const isActive = selectedGender === cat.value && !selectedSubCategory;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => { setSelectedGender(cat.value); setSelectedSubCategory(''); }}
                      className={`w-full text-left py-2.5 px-3 text-xs font-body-md transition-all duration-300 cursor-pointer flex items-center justify-between rounded-md ${
                        isActive 
                          ? 'border-l-4 border-secondary bg-secondary/10 font-bold text-primary shadow-xs' 
                          : 'border-l-4 border-transparent text-on-surface-variant hover:bg-surface-container/60 hover:text-primary'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isActive && (
                        <span className="material-symbols-outlined text-xs text-secondary">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-categories Filter - Refined Luxury List */}
            {filteredSubCategories.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Danh Mục Con</label>
                  <span className="font-label-caps text-[9px] text-secondary tracking-widest">SUB-CATEGORY</span>
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  <button 
                    onClick={() => setSelectedSubCategory('')}
                    className={`w-full text-left py-2 px-3 text-xs font-body-md transition-all duration-300 cursor-pointer rounded-md ${
                      !selectedSubCategory 
                        ? 'border-l-4 border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-l-4 border-transparent text-on-surface-variant hover:bg-surface-container/60'
                    }`}
                  >
                    Tất Cả Danh Mục Con
                  </button>

                  {filteredSubCategories.map((sub) => {
                    const isSubActive = selectedSubCategory === sub.id;
                    return (
                      <button 
                        key={sub.id}
                        onClick={() => setSelectedSubCategory(isSubActive ? '' : sub.id)}
                        className={`w-full text-left py-2.5 px-3 text-xs font-body-md transition-all duration-300 cursor-pointer flex items-center justify-between rounded-md ${
                          isSubActive 
                            ? 'border-l-4 border-secondary bg-secondary/15 text-primary font-bold shadow-xs' 
                            : 'border-l-4 border-transparent text-on-surface-variant hover:bg-surface-container/60 hover:text-primary'
                        }`}
                      >
                        <span>{sub.name}</span>
                        {sub.parentName ? (
                          <span className="text-[10px] text-secondary font-medium">({sub.parentName})</span>
                        ) : (
                          isSubActive && <span className="material-symbols-outlined text-xs text-secondary">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter Size */}
            <div>
              <label className="font-label-caps text-[11px] text-on-surface-variant mb-3 block uppercase tracking-wider font-bold">Kích Thước (Size)</label>
              <div className="grid grid-cols-3 gap-2">
                {['S', 'M', 'L', 'XL', 'FREE_SIZE'].map((sz) => (
                  <button 
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    className={`py-2 font-label-caps text-[11px] transition-all cursor-pointer rounded ${
                      selectedSize === sz 
                        ? 'bg-primary text-on-primary font-bold shadow-sm' 
                        : 'border border-outline-variant/60 hover:border-secondary hover:text-secondary'
                    }`}
                  >
                    {sz === 'FREE_SIZE' ? 'FREE' : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Mức Giá Tối Đa</label>
                <span className="font-label-caps text-xs font-bold text-secondary">{formatVND(maxPrice)}</span>
              </div>
              <input 
                type="range"
                min="500000"
                max="10000000"
                step="250000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-outline-variant/60 accent-secondary appearance-none cursor-pointer rounded"
              />
              <div className="flex justify-between mt-2 font-label-caps text-on-surface-variant text-[10px]">
                <span>500.000 VNĐ</span>
                <span>10.000.000 VNĐ</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <section className="flex-grow">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <LoadingSpinner text="Đang tải dữ liệu sản phẩm..." />
            </div>
          ) : loadError ? (
            <div className="text-center py-20 border border-error/30 bg-error/5 rounded-lg">
              <span className="material-symbols-outlined text-4xl text-error mb-2">cloud_off</span>
              <h3 className="font-headline-sm text-headline-sm mb-2">Không thể tải danh sách sản phẩm</h3>
              <p className="font-body-md text-on-surface-variant mb-6">Vui lòng kiểm tra kết nối và thử lại.</p>
              <button
                onClick={fetchFilteredProducts}
                className="bg-primary text-white font-label-caps text-label-caps px-6 py-3 transition-colors cursor-pointer rounded"
              >
                Thử Lại
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-outline-variant bg-surface-container rounded-lg">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">search_off</span>
              <h3 className="font-headline-sm text-headline-sm mb-2">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="font-body-md text-on-surface-variant mb-6">Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc danh mục con của bạn.</p>
              <button 
                onClick={resetAllFilters}
                className="bg-primary text-white font-label-caps text-label-caps px-6 py-3 transition-colors cursor-pointer rounded"
              >
                Xóa Bộ Lọc
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {products.slice((currentPage - 1) * 12, currentPage * 12).map((product) => (
                  <div 
                    key={product.id} 
                    onClick={() => onQuickView && onQuickView(product)}
                    className="product-card cursor-pointer group transition-all duration-300"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low mb-4 rounded border border-outline-variant/10">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        src={product.image} 
                        alt={product.name}
                      />
                      <div className="product-card-overlay absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onQuickView) onQuickView(product);
                          }}
                          className="bg-white text-black font-label-caps text-label-caps px-6 py-3 tracking-widest hover:bg-black hover:text-white transition-colors cursor-pointer rounded-sm shadow-md font-bold"
                        >
                          Xem Chi Tiết
                        </button>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">{product.category}</p>
                      <h4 className="font-body-md text-sm font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">{product.name}</h4>
                      <p className="font-label-caps text-xs text-primary font-bold mt-1.5">{formatVND(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(products.length / 12) || 1}
                totalItems={products.length}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
