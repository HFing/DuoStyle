import React from 'react';
import { formatVND } from '../ProductCard';
import Pagination from '../Pagination';
import { buildCategoryGroups, findCategoryGroup, firstSelectableCategory } from '../../utils/category-selection';

interface AdminProductsTabProps {
  products?: any[];
  inventorySearch: string;
  setInventorySearch: (val: string) => void;
  inventoryPage: number;
  setInventoryPage: (page: number) => void;
  setIsAddProductModalOpen: (open: boolean) => void;
  handleOpenAdminDetail: (prod: any) => void;
  handleOpenStockEdit: (prod: any) => void;

  // Add product modal props
  isAddProductModalOpen: boolean;
  handleCreateProductSubmit: (e: React.FormEvent) => void;
  newProdName: string;
  setNewProdName: (val: string) => void;
  newProdGender: string;
  setNewProdGender: (val: string) => void;
  newProdSubCatId: any;
  setNewProdSubCatId: (val: any) => void;
  newProdPrice: string;
  setNewProdPrice: (val: string) => void;
  newProdColor: string;
  setNewProdColor: (val: string) => void;
  newProdSku: string;
  setNewProdSku: (val: string) => void;
  newProdDesc: string;
  setNewProdDesc: (val: string) => void;
  newProdMaterial: string;
  setNewProdMaterial: (val: string) => void;
  primaryImage: string;
  setPrimaryImage: (val: string) => void;
  galleryImages?: string[];
  setGalleryImages: any;
  uploadingPrimary: boolean;
  setUploadingPrimary: (val: boolean) => void;
  uploadingGallery: boolean;
  setUploadingGallery: (val: boolean) => void;
  handlePrimaryFileUpload: any;
  handleGalleryFilesUpload: any;
  handleRemoveGalleryImage: (idx: number) => void;
  newProdSizeS: any;
  setNewProdSizeS: (val: any) => void;
  newProdSizeM: any;
  setNewProdSizeM: (val: any) => void;
  newProdSizeL: any;
  setNewProdSizeL: (val: any) => void;
  newProdSizeXL: any;
  setNewProdSizeXL: (val: any) => void;
  categoryTree: any[];

  // Stock edit modal props
  editingStockProduct: any;
  setEditingStockProduct: (prod: any) => void;
  newStockValues: any;
  setNewStockValues: (val: any) => void;
  handleDeleteSizeInStockEdit: (sizeId: any) => void;
  addSizeName: string;
  setAddSizeName: (val: string) => void;
  addSizeCustom: string;
  setAddSizeCustom: (val: string) => void;
  addSizeStock: any;
  setAddSizeStock: (val: any) => void;
  handleAddNewSizeToStockEdit: () => void;
  handleSaveStock: () => void;

  // Detail edit modal props
  editingAdminDetailProduct: any;
  setEditingAdminDetailProduct: (prod: any) => void;
  detailName: string;
  setDetailName: (val: string) => void;
  detailGender: string;
  setDetailGender: (val: string) => void;
  detailSubCatId: any;
  setDetailSubCatId: (val: any) => void;
  detailPrice: string;
  setDetailPrice: (val: string) => void;
  detailColor: string;
  setDetailColor: (val: string) => void;
  detailSku: string;
  setDetailSku: (val: string) => void;
  detailDesc: string;
  setDetailDesc: (val: string) => void;
  detailMaterial: string;
  setDetailMaterial: (val: string) => void;
  detailPrimaryImg: string;
  setDetailPrimaryImg: (val: string) => void;
  detailGalleryImgs?: string[];
  setDetailGalleryImgs: any;
  detailVariants?: any[];
  setDetailVariants: any;
  detailAddSize: string;
  setDetailAddSize: (val: string) => void;
  detailAddSizeStock: any;
  setDetailAddSizeStock: (val: any) => void;
  handleSaveAdminDetail: () => void;
  showToast?: (msg: string, type?: string) => void;
}

export default function AdminProductsTab({
  products = [],
  inventorySearch,
  setInventorySearch,
  inventoryPage,
  setInventoryPage,
  setIsAddProductModalOpen,
  handleOpenAdminDetail,
  handleOpenStockEdit,
  isAddProductModalOpen,
  handleCreateProductSubmit,
  newProdName,
  setNewProdName,
  setNewProdGender,
  newProdSubCatId,
  setNewProdSubCatId,
  newProdPrice,
  setNewProdPrice,
  newProdColor,
  setNewProdColor,
  newProdSku,
  setNewProdSku,
  newProdDesc,
  setNewProdDesc,
  newProdMaterial,
  setNewProdMaterial,
  primaryImage,
  setPrimaryImage,
  galleryImages = [],
  setGalleryImages,
  uploadingPrimary,
  setUploadingPrimary,
  uploadingGallery,
  setUploadingGallery,
  handlePrimaryFileUpload,
  handleGalleryFilesUpload,
  handleRemoveGalleryImage,
  newProdSizeS,
  setNewProdSizeS,
  newProdSizeM,
  setNewProdSizeM,
  newProdSizeL,
  setNewProdSizeL,
  newProdSizeXL,
  setNewProdSizeXL,
  categoryTree = [],
  editingStockProduct,
  setEditingStockProduct,
  newStockValues = {},
  setNewStockValues,
  handleDeleteSizeInStockEdit,
  addSizeName,
  setAddSizeName,
  addSizeStock,
  setAddSizeStock,
  handleAddNewSizeToStockEdit,
  handleSaveStock,
  editingAdminDetailProduct,
  setEditingAdminDetailProduct,
  detailName,
  setDetailName,
  setDetailGender,
  detailSubCatId,
  setDetailSubCatId,
  detailPrice,
  setDetailPrice,
  detailColor,
  setDetailColor,
  detailSku,
  setDetailSku,
  detailDesc,
  setDetailDesc,
  detailMaterial,
  setDetailMaterial,
  detailPrimaryImg,
  setDetailPrimaryImg,
  detailGalleryImgs = [],
  setDetailGalleryImgs,
  detailVariants = [],
  setDetailVariants,
  detailAddSize,
  setDetailAddSize,
  detailAddSizeStock,
  setDetailAddSizeStock,
  handleSaveAdminDetail,
  showToast,
}: AdminProductsTabProps) {
  const safeProducts = Array.isArray(products) ? products : [];
  const safeGalleryImages = Array.isArray(galleryImages) ? galleryImages : [];
  const safeDetailGalleryImgs = Array.isArray(detailGalleryImgs) ? detailGalleryImgs : [];
  const safeDetailVariants = Array.isArray(detailVariants) ? detailVariants : [];
  const categoryGroups = buildCategoryGroups(categoryTree);
  const selectedNewGroup = findCategoryGroup(categoryGroups, newProdSubCatId) || categoryGroups[0] || null;
  const selectedDetailGroup = findCategoryGroup(categoryGroups, detailSubCatId) || categoryGroups[0] || null;

  const filtered = safeProducts.filter(
    (p) =>
      !inventorySearch ||
      p?.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p?.sku?.toLowerCase().includes(inventorySearch.toLowerCase())
  );
  const pageSize = 10;
  const paginated = filtered.slice((inventoryPage - 1) * pageSize, inventoryPage * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-outline-variant">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Products & Stock Control</h2>
          <p className="font-body-md text-on-surface-variant/60 text-sm">
            Quản lý kho hàng, hiệu chỉnh thuộc tính, bộ ảnh và danh mục sản phẩm.
          </p>
        </div>
        <button
          onClick={() => setIsAddProductModalOpen(true)}
          className="bg-primary text-white font-label-caps text-xs px-5 py-3 rounded hover:bg-secondary transition-colors cursor-pointer flex items-center gap-2 font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm Sản Phẩm Mới Vào Kho
        </button>
      </div>

      {/* Product Search Bar */}
      <div className="flex justify-between items-center gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-md">
        <div className="relative flex-grow max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
            className="w-full py-1.5 pl-9 pr-3 border border-outline-variant rounded text-xs outline-none bg-white font-body-md"
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/60 border-b border-outline-variant">
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Sản Phẩm</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold whitespace-nowrap">
                Danh Mục
              </th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold whitespace-nowrap">
                Giá Niêm Yết
              </th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold min-w-[180px]">
                Tồn Kho Theo Size
              </th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-center whitespace-nowrap">
                Trạng Thái
              </th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-right whitespace-nowrap">
                Thao Tác Admin
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-on-surface-variant font-medium">
                  Không tìm thấy sản phẩm nào trong kho phù hợp
                </td>
              </tr>
            ) : (
              paginated.map((prod) => {
                const variants = Array.isArray(prod?.variants) ? prod.variants : [];
                const totalStock = variants.reduce(
                  (acc: number, v: any) => acc + (Number(v?.stockQuantity) || 0),
                  0
                );
                const isLow = variants.some(
                  (v: any) => v.stockQuantity > 0 && v.stockQuantity <= 5
                );
                const isOut = totalStock === 0;

                return (
                  <tr key={prod.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.thumbnailUrl}
                          alt={prod.name}
                          className="w-12 h-14 object-cover rounded bg-surface-container flex-shrink-0"
                        />
                        <div>
                          <p className="font-body-md font-bold text-primary text-xs leading-snug">
                            {prod.name}
                          </p>
                          <p className="font-label-caps text-[10px] text-on-surface-variant mt-0.5">
                            SKU: {prod.sku || `DS-${prod.id}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant font-medium whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-surface-container rounded text-[10px] font-bold whitespace-nowrap border border-outline-variant/40">
                        {prod.categoryName || 'Thời Trang'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-primary whitespace-nowrap text-xs">
                      {formatVND(prod.basePrice)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {variants.length > 0 ? (
                          variants.map((v: any, idx: number) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-[10px] font-label-caps font-bold border whitespace-nowrap ${
                                v.stockQuantity === 0
                                  ? 'bg-red-50 text-red-700 border-red-200 line-through'
                                  : v.stockQuantity <= 5
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {v.size === 'FREE_SIZE' ? 'FREE' : v.size}: {v.stockQuantity}
                            </span>
                          ))
                        ) : (
                          <span className="text-on-surface-variant">Chưa có size</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {isOut ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-label-caps font-bold whitespace-nowrap border border-red-200">
                          HẾT HÀNG
                        </span>
                      ) : isLow ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-label-caps font-bold whitespace-nowrap border border-amber-300">
                          SẮP HẾT
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-label-caps font-bold whitespace-nowrap border border-emerald-200">
                          CÒN HÀNG ({totalStock})
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenAdminDetail(prod)}
                          className="bg-secondary text-primary border border-secondary text-[11px] px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-colors cursor-pointer font-label-caps font-bold flex items-center gap-1 whitespace-nowrap"
                          title="Hiệu chỉnh toàn bộ thuộc tính & Bộ ảnh"
                        >
                          <span className="material-symbols-outlined text-xs">edit_note</span>
                          <span>Sửa Thuộc Tính</span>
                        </button>
                        <button
                          onClick={() => handleOpenStockEdit(prod)}
                          className="bg-primary text-white text-[11px] px-3 py-1.5 rounded hover:bg-secondary transition-colors cursor-pointer font-label-caps font-bold whitespace-nowrap flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">inventory_2</span>
                          <span>Sửa Kho</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Products Pagination */}
      <Pagination
        currentPage={inventoryPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        onPageChange={(p) => setInventoryPage(p)}
      />

      {/* ADD NEW PRODUCT MODAL */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
              <div>
                <h4 className="font-headline-sm text-lg font-bold text-primary">
                  Thêm Sản Phẩm Mới Vào Kho
                </h4>
                <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                  Thiết lập Đầy đủ Thuộc tính & Danh mục Con
                </p>
              </div>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                  Tên Sản Phẩm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Áo Măng Tô Dạ Cashmere Double-Breasted"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full p-2.5 border border-outline-variant rounded bg-white font-body-md text-xs"
                />
              </div>

              {/* PARENT & SUB CATEGORY SELECTION */}
              <div className="grid grid-cols-2 gap-4 bg-surface-container/40 p-3 rounded-lg border border-outline-variant">
                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    1. Danh Mục Cha *
                  </label>
                  <select
                    value={selectedNewGroup?.id || ''}
                    onChange={(e) => {
                      const group = categoryGroups.find((item) => item.id === Number(e.target.value));
                      const category = firstSelectableCategory(group);
                      if (group) setNewProdGender(group.genderTarget);
                      if (category) setNewProdSubCatId(category.id);
                    }}
                    className="w-full p-2 border border-outline-variant rounded bg-white font-bold text-xs"
                  >
                    {categoryGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.genderTarget})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    2. Danh Mục Con (Sub-Category) *
                  </label>
                  <select
                    value={newProdSubCatId}
                    onChange={(e) => setNewProdSubCatId(e.target.value)}
                    className="w-full p-2 border border-outline-variant rounded bg-white font-bold text-xs"
                  >
                    {(selectedNewGroup?.categories || []).map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PRICE, COLOR, SKU */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    Giá Bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full p-2 border border-outline-variant rounded bg-white font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    Màu Sắc (Color)
                  </label>
                  <input
                    type="text"
                    value={newProdColor}
                    onChange={(e) => setNewProdColor(e.target.value)}
                    className="w-full p-2 border border-outline-variant rounded bg-white font-body-md text-xs"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    Mã SKU Prefix
                  </label>
                  <input
                    type="text"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full p-2 border border-outline-variant rounded bg-white font-body-md text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                  Mô Tả Sản Phẩm
                </label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full p-2 border border-outline-variant rounded bg-white font-body-md text-xs"
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                  Chất Liệu & Hướng Dẫn Bảo Quản
                </label>
                <input
                  type="text"
                  value={newProdMaterial}
                  onChange={(e) => setNewProdMaterial(e.target.value)}
                  className="w-full p-2 border border-outline-variant rounded bg-white font-body-md text-xs"
                />
              </div>

              {/* IMAGE UPLOADER SECTION */}
              <div className="bg-surface-container/40 p-4 rounded-lg border border-outline-variant space-y-3">
                <span className="font-label-caps text-xs text-primary font-bold uppercase tracking-wider block border-b border-outline-variant/60 pb-2">
                  1. Tải Ảnh Chính (Ảnh Đại Diện)
                </span>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-24 bg-surface-container border border-outline-variant rounded overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                    {uploadingPrimary ? (
                      <span className="material-symbols-outlined text-primary animate-spin">
                        sync
                      </span>
                    ) : primaryImage ? (
                      <img
                        src={primaryImage}
                        alt="Primary preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant">image</span>
                    )}
                  </div>

                  <div className="space-y-2 flex-grow">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-label-caps font-bold rounded cursor-pointer hover:bg-secondary transition-colors">
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      <span>
                        {uploadingPrimary
                          ? 'Đang Tải Ảnh Lên...'
                          : 'Chọn File Ảnh Chính Từ Máy Tính'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handlePrimaryFileUpload(e, setPrimaryImage, setUploadingPrimary)
                        }
                      />
                    </label>
                    <p className="text-[10px] text-on-surface-variant">
                      Hỗ trợ JPG, PNG, WEBP. Ảnh chính sẽ làm Thumbnail cho toàn hệ thống.
                    </p>
                  </div>
                </div>

                <span className="font-label-caps text-xs text-primary font-bold uppercase tracking-wider block border-b border-outline-variant/60 pb-2 pt-2">
                  2. Tải Bộ Ảnh Phụ (Bộ Sưu Tập)
                </span>

                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container border border-primary text-primary text-xs font-label-caps font-bold rounded cursor-pointer hover:bg-primary hover:text-white transition-colors mb-3">
                    <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                    <span>
                      {uploadingGallery ? 'Đang Tải Các Ảnh Lên...' : '+ Chọn Nhiều Ảnh Gallery Phụ'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleGalleryFilesUpload(e, setGalleryImages, setUploadingGallery)
                      }
                    />
                  </label>

                  {safeGalleryImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {safeGalleryImages.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-[4/5] bg-surface-container rounded overflow-hidden border border-outline-variant group"
                        >
                          <img
                            src={url}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 rounded font-bold">
                            Ảnh #{idx + 2}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SIZE STOCKS SETUP BOX */}
              <div className="bg-surface-container/60 p-4 rounded-lg border border-secondary/40 space-y-3">
                <div className="flex justify-between items-center border-b border-outline-variant/60 pb-2">
                  <span className="font-label-caps text-xs text-secondary font-bold uppercase tracking-wider">
                    Cài Đặt Số Lượng Tồn Kho Theo Size
                  </span>
                  <span className="text-[10px] text-red-600 font-bold">* Nhập = 0 để làm Size Hết Hàng</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-2.5 rounded border border-outline-variant text-center">
                    <span className="font-bold text-xs block text-primary mb-1">Size S</span>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={newProdSizeS}
                      onChange={(e) => setNewProdSizeS(e.target.value)}
                      className="w-full text-center py-1 border border-outline-variant rounded font-bold text-xs bg-red-50 text-red-700"
                    />
                    <span className="text-[9px] text-red-600 block mt-1">
                      {Number(newProdSizeS) === 0 ? 'Sẽ hiện HẾT HÀNG' : `Còn ${newProdSizeS}`}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-outline-variant text-center">
                    <span className="font-bold text-xs block text-primary mb-1">Size M</span>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={newProdSizeM}
                      onChange={(e) => setNewProdSizeM(e.target.value)}
                      className="w-full text-center py-1 border border-outline-variant rounded font-bold text-xs"
                    />
                    <span className="text-[9px] text-emerald-600 block mt-1">Còn {newProdSizeM}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-outline-variant text-center">
                    <span className="font-bold text-xs block text-primary mb-1">Size L</span>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={newProdSizeL}
                      onChange={(e) => setNewProdSizeL(e.target.value)}
                      className="w-full text-center py-1 border border-outline-variant rounded font-bold text-xs"
                    />
                    <span className="text-[9px] text-emerald-600 block mt-1">Còn {newProdSizeL}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-outline-variant text-center">
                    <span className="font-bold text-xs block text-primary mb-1">Size XL</span>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={newProdSizeXL}
                      onChange={(e) => setNewProdSizeXL(e.target.value)}
                      className="w-full text-center py-1 border border-outline-variant rounded font-bold text-xs bg-red-50 text-red-700"
                    />
                    <span className="text-[9px] text-red-600 block mt-1">
                      {Number(newProdSizeXL) === 0 ? 'Sẽ hiện HẾT HÀNG' : `Còn ${newProdSizeXL}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant font-label-caps uppercase rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white font-label-caps uppercase rounded font-bold hover:bg-secondary transition-colors cursor-pointer"
                >
                  + Tạo Sản Phẩm & Lưu Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SỬA KHO MODAL */}
      {editingStockProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
              <div>
                <h4 className="font-headline-sm text-base font-bold text-primary">
                  Cập Nhật Tồn Kho & Xóa/Thêm Size
                </h4>
                <p className="font-label-caps text-[10px] text-secondary tracking-wider">
                  {editingStockProduct.name}
                </p>
              </div>
              <button
                onClick={() => setEditingStockProduct(null)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <p className="font-label-caps text-xs font-bold text-primary mb-2">
                  1. Danh Sách Size Đang Có (Nhấn X để Xóa Size):
                </p>
                <div className="space-y-2">
                  {Array.isArray(editingStockProduct.variants) && editingStockProduct.variants.length > 0 ? (
                    editingStockProduct.variants.map((v: any) => (
                      <div
                        key={v.id || v.size}
                        className="flex items-center justify-between bg-surface-container/50 p-2.5 rounded border border-outline-variant/60"
                      >
                        <span className="font-label-caps font-bold text-primary text-xs flex items-center gap-2">
                          Size {v.size === 'FREE_SIZE' ? 'FREE' : v.size}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-on-surface-variant">Kho:</span>
                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={newStockValues[v.id || v.size] ?? v.stockQuantity}
                              onChange={(e) =>
                                setNewStockValues({
                                  ...newStockValues,
                                  [v.id || v.size]: Number(e.target.value),
                                })
                              }
                              className="w-20 py-1 px-2 border border-outline-variant rounded text-xs text-center font-bold bg-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSizeInStockEdit(v.id || v.size)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Xóa Size này khỏi sản phẩm"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-red-600 font-bold italic py-2">
                      Sản phẩm hiện chưa có Size nào! Hãy thêm Size bên dưới.
                    </p>
                  )}
                </div>
              </div>

              {/* ADD NEW SIZE SECTION */}
              <div className="bg-surface-container/60 p-3.5 rounded-lg border border-secondary/40 space-y-2.5">
                <p className="font-label-caps text-xs font-bold text-secondary uppercase tracking-wider">
                  2. + Thêm Size Mới Cho Sản Phẩm Này:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-label-caps font-bold text-primary block mb-1">
                      Chọn Size:
                    </label>
                    <select
                      value={addSizeName}
                      onChange={(e) => setAddSizeName(e.target.value)}
                      className="w-full p-1.5 border border-outline-variant rounded text-xs bg-white font-bold"
                    >
                      <option value="XS">Size XS</option>
                      <option value="S">Size S</option>
                      <option value="M">Size M</option>
                      <option value="L">Size L</option>
                      <option value="XL">Size XL</option>
                      <option value="XXL">Size XXL</option>
                      <option value="FREE_SIZE">FREE SIZE</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-label-caps font-bold text-primary block mb-1">
                      Số Lượng Kho:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={addSizeStock}
                      onChange={(e) => setAddSizeStock(e.target.value)}
                      className="w-full p-1.5 border border-outline-variant rounded text-xs font-bold text-center bg-white"
                    />
                  </div>

                  <div className={`flex items-end ${addSizeName === 'CUSTOM' ? 'sm:col-span-3' : ''}`}>
                    <button
                      type="button"
                      onClick={handleAddNewSizeToStockEdit}
                      className="w-full py-1.5 bg-secondary text-primary font-label-caps text-xs font-bold rounded border border-secondary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                      + Thêm Size Này
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
              <button
                onClick={() => setEditingStockProduct(null)}
                className="px-4 py-1.5 border border-outline-variant text-xs font-label-caps uppercase rounded cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveStock}
                className="px-5 py-1.5 bg-primary text-white text-xs font-label-caps uppercase rounded font-bold hover:bg-secondary transition-colors cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PRODUCT DETAIL EDIT WORKSPACE MODAL */}
      {editingAdminDetailProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl w-full max-w-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
              <div>
                <h4 className="font-headline-sm text-lg font-bold text-primary">
                  Admin Product Management Workspace
                </h4>
                <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                  Hiệu chỉnh Toàn bộ Thuộc tính, Bộ Ảnh & Size của Sản Phẩm
                </p>
              </div>
              <button
                onClick={() => setEditingAdminDetailProduct(null)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4 space-y-6 text-xs">
              {/* SECTION 1: GENERAL ATTRIBUTES */}
              <div className="space-y-4">
                <span className="font-label-caps text-xs text-primary font-bold uppercase tracking-wider block border-b border-outline-variant pb-1">
                  1. Thuộc Tính Cơ Bản & Danh Mục
                </span>

                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    Tên Sản Phẩm
                  </label>
                  <input
                    type="text"
                    value={detailName}
                    onChange={(e) => setDetailName(e.target.value)}
                    className="w-full p-2.5 border border-outline-variant rounded font-body-md text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-surface-container/40 p-3 rounded-lg border border-outline-variant">
                  <div>
                    <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                      Danh Mục Cha
                    </label>
                    <select
                      value={selectedDetailGroup?.id || ''}
                      onChange={(e) => {
                        const group = categoryGroups.find((item) => item.id === Number(e.target.value));
                        const category = firstSelectableCategory(group);
                        if (group) setDetailGender(group.genderTarget);
                        if (category) setDetailSubCatId(category.id);
                      }}
                      className="w-full p-2 border border-outline-variant rounded font-bold text-xs bg-white"
                    >
                      {categoryGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name} ({group.genderTarget})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                      Danh Mục Con (Sub-Category)
                    </label>
                    <select
                      value={detailSubCatId}
                      onChange={(e) => setDetailSubCatId(e.target.value)}
                      className="w-full p-2 border border-outline-variant rounded font-bold text-xs bg-white"
                    >
                      {(selectedDetailGroup?.categories || []).map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                      Giá Bán (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={detailPrice}
                      onChange={(e) => setDetailPrice(e.target.value)}
                      className="w-full p-2 border border-outline-variant rounded font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                      Màu Sắc (Color)
                    </label>
                    <input
                      type="text"
                      value={detailColor}
                      onChange={(e) => setDetailColor(e.target.value)}
                      className="w-full p-2 border border-outline-variant rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                      Mã SKU
                    </label>
                    <input
                      type="text"
                      value={detailSku}
                      onChange={(e) => setDetailSku(e.target.value)}
                      className="w-full p-2 border border-outline-variant rounded text-xs uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    Mô Tả Sản Phẩm
                  </label>
                  <textarea
                    rows={2}
                    value={detailDesc}
                    onChange={(e) => setDetailDesc(e.target.value)}
                    className="w-full p-2 border border-outline-variant rounded text-xs"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    Chất Liệu & Hướng Dẫn Bảo Quản (Materials & Care)
                  </label>
                  <input
                    type="text"
                    value={detailMaterial}
                    onChange={(e) => setDetailMaterial(e.target.value)}
                    className="w-full p-2 border border-outline-variant rounded text-xs"
                    placeholder="VD: 100% Cashmere Wool, Lót lụa cao cấp"
                  />
                </div>
              </div>

              {/* SECTION 2: PRODUCT IMAGES MANAGEMENT */}
              <div className="space-y-4 bg-surface-container/40 p-4 rounded-lg border border-outline-variant">
                <span className="font-label-caps text-xs text-primary font-bold uppercase tracking-wider block border-b border-outline-variant pb-2">
                  2. Quản Lý Bộ Ảnh Sản Phẩm (Thumbnail & Gallery)
                </span>

                {/* Primary Image */}
                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-2">
                    Ảnh Đại Diện Chính (Thumbnail):
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={detailPrimaryImg}
                      alt="Primary Cover"
                      className="w-20 h-24 object-cover rounded border border-outline-variant"
                    />
                    <div>
                      <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary text-white text-xs font-label-caps font-bold rounded cursor-pointer hover:bg-secondary transition-colors">
                        <span className="material-symbols-outlined text-sm">upload</span>
                        Đổi File Ảnh Chính
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePrimaryFileUpload(e, setDetailPrimaryImg, () => {})}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-2">
                    Bộ Ảnh Phụ (Gallery Images):
                  </label>
                  <div className="flex items-center gap-3 mb-3">
                    <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-primary text-primary text-xs font-label-caps font-bold rounded cursor-pointer hover:bg-primary hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        add_photo_alternate
                      </span>
                      + Tải Thêm Ảnh Phụ Từ Máy Tính
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleGalleryFilesUpload(e, setDetailGalleryImgs, () => {})}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    {safeDetailGalleryImgs.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-[4/5] bg-white rounded border border-outline-variant overflow-hidden group"
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDetailGalleryImgs(safeDetailGalleryImgs.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: VARIANTS & STOCK MANAGEMENT */}
              <div className="space-y-4 bg-surface-container/60 p-4 rounded-lg border border-secondary/40">
                <span className="font-label-caps text-xs text-secondary font-bold uppercase tracking-wider block border-b border-outline-variant pb-2">
                  3. Quản Lý Kích Thước (Size) & Tồn Kho Thực Tế
                </span>

                <div className="space-y-2">
                  {safeDetailVariants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white p-2.5 rounded border border-outline-variant"
                    >
                      <span className="font-label-caps font-bold text-primary text-xs">
                        Size {v.size === 'FREE_SIZE' ? 'FREE' : v.size}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant">Tồn kho:</span>
                          <input
                            type="number"
                            min="0"
                            value={v.stockQuantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setDetailVariants(
                                safeDetailVariants.map((item, i) =>
                                  i === idx ? { ...item, stockQuantity: val } : item
                                )
                              );
                            }}
                            className="w-20 py-1 px-2 border border-outline-variant rounded text-xs font-bold text-center"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDetailVariants(safeDetailVariants.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          title="Xóa size này"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add size inline */}
                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/60">
                  <select
                    value={detailAddSize}
                    onChange={(e) => setDetailAddSize(e.target.value)}
                    className="p-1.5 border border-outline-variant rounded text-xs bg-white font-bold"
                  >
                    <option value="XS">Size XS</option>
                    <option value="S">Size S</option>
                    <option value="M">Size M</option>
                    <option value="L">Size L</option>
                    <option value="XL">Size XL</option>
                    <option value="XXL">Size XXL</option>
                    <option value="FREE_SIZE">FREE SIZE</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Số lượng kho"
                    value={detailAddSizeStock}
                    onChange={(e) => setDetailAddSizeStock(e.target.value)}
                    className="w-24 p-1.5 border border-outline-variant rounded text-xs text-center font-bold bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (safeDetailVariants.some((v) => v.size === detailAddSize)) {
                        if (showToast)
                          showToast(`Size ${detailAddSize} đã có trong danh sách!`, 'error');
                        return;
                      }
                      setDetailVariants([
                        ...safeDetailVariants,
                        {
                          size: detailAddSize,
                          color: detailColor,
                          sku: `${detailSku}-${detailAddSize}`,
                          price: Number(detailPrice),
                          stockQuantity: Number(detailAddSizeStock),
                        },
                      ]);
                    }}
                    className="px-3 py-1.5 bg-secondary text-primary font-label-caps text-xs font-bold rounded border border-secondary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    + Thêm Size Này
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
              <button
                onClick={() => setEditingAdminDetailProduct(null)}
                className="px-4 py-2 border border-outline-variant font-label-caps uppercase rounded cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAdminDetail}
                className="px-6 py-2 bg-primary text-white font-label-caps uppercase rounded font-bold hover:bg-secondary transition-colors cursor-pointer"
              >
                Lưu Tất Cả Cập Nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
