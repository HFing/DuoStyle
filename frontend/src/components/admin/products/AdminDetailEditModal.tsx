import React from 'react';

interface AdminDetailEditModalProps {
  editingAdminDetailProduct: any;
  setEditingAdminDetailProduct: (prod: any) => void;
  detailName: string;
  setDetailName: (val: string) => void;
  detailSlug?: string;
  setDetailSlug?: (val: string) => void;
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
  handlePrimaryFileUpload: any;
  handleGalleryFilesUpload: any;
  categoryGroups: any[];
  selectedDetailGroup: any;
  firstSelectableCategory: (group: any) => any;
  showToast?: (msg: string, type?: string) => void;
}

export default function AdminDetailEditModal({
  editingAdminDetailProduct,
  setEditingAdminDetailProduct,
  detailName,
  setDetailName,
  detailSlug = '',
  setDetailSlug = () => {},
  detailGender = 'MEN',
  setDetailGender = () => {},
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
  handlePrimaryFileUpload,
  handleGalleryFilesUpload,
  categoryGroups,
  selectedDetailGroup,
  firstSelectableCategory,
  showToast,
}: AdminDetailEditModalProps) {
  if (!editingAdminDetailProduct) return null;

  const safeDetailGalleryImgs = Array.isArray(detailGalleryImgs) ? detailGalleryImgs : [];
  const safeDetailVariants = Array.isArray(detailVariants) ? detailVariants : [];

  return (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                  Tên Sản Phẩm *
                </label>
                <input
                  type="text"
                  value={detailName}
                  onChange={(e) => setDetailName(e.target.value)}
                  className="w-full p-2.5 border border-outline-variant rounded font-body-md text-xs font-bold"
                  placeholder="Nhập tên sản phẩm..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-label-caps text-xs text-primary font-bold block">
                    Đường Dẫn SEO (Slug) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = detailName
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[đĐ]/g, 'd')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-');
                      setDetailSlug(generated);
                    }}
                    className="text-[10px] text-secondary hover:underline cursor-pointer font-bold"
                  >
                    ⚡ Tự tạo Slug từ tên
                  </button>
                </div>
                <input
                  type="text"
                  value={detailSlug}
                  onChange={(e) => setDetailSlug(e.target.value)}
                  className="w-full p-2.5 border border-outline-variant rounded font-mono text-xs bg-surface-container-low"
                  placeholder="duong-dan-chuan-seo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-container/40 p-3 rounded-lg border border-outline-variant">
              <div>
                <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                  Đối Tượng (Gender Target) *
                </label>
                <select
                  value={detailGender}
                  onChange={(e) => setDetailGender(e.target.value)}
                  className="w-full p-2 border border-outline-variant rounded font-bold text-xs bg-white text-primary"
                >
                  <option value="MEN">Nam (MEN)</option>
                  <option value="WOMEN">Nữ (WOMEN)</option>
                  <option value="UNISEX">Unisex / Phụ kiện (UNISEX)</option>
                </select>
              </div>

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
                  Danh Mục Con (Sub-Category) *
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
                  Giá Bán Niêm Yết (VNĐ) *
                </label>
                <input
                  type="number"
                  value={detailPrice}
                  onChange={(e) => setDetailPrice(e.target.value)}
                  className="w-full p-2 border border-outline-variant rounded font-bold text-xs"
                  placeholder="VD: 350000"
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                  Màu Sắc Chính (Color)
                </label>
                <input
                  type="text"
                  value={detailColor}
                  onChange={(e) => setDetailColor(e.target.value)}
                  className="w-full p-2 border border-outline-variant rounded text-xs"
                  placeholder="VD: Trắng / Đen"
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                  Mã SKU Gốc (SKU Prefix)
                </label>
                <input
                  type="text"
                  value={detailSku}
                  onChange={(e) => setDetailSku(e.target.value)}
                  className="w-full p-2 border border-outline-variant rounded text-xs uppercase font-mono"
                  placeholder="VD: DS-SHIRT-01"
                />
              </div>
            </div>

            <div>
              <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                Mô Tả Sản Phẩm
              </label>
              <textarea
                rows={3}
                value={detailDesc}
                onChange={(e) => setDetailDesc(e.target.value)}
                className="w-full p-2 border border-outline-variant rounded text-xs leading-relaxed"
                placeholder="Nhập mô tả thông tin chi tiết sản phẩm..."
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
                placeholder="VD: 100% Cotton Ribbed, Lót lụa cao cấp"
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
  );
}
