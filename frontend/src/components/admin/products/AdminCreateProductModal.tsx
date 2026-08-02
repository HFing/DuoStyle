import React from 'react';

interface AdminCreateProductModalProps {
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: (open: boolean) => void;
  handleCreateProductSubmit: (e: React.FormEvent) => void;
  newProdName: string;
  setNewProdName: (val: string) => void;
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
  categoryGroups: any[];
  selectedNewGroup: any;
  firstSelectableCategory: (group: any) => any;
}

export default function AdminCreateProductModal({
  isAddProductModalOpen,
  setIsAddProductModalOpen,
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
  categoryGroups,
  selectedNewGroup,
  firstSelectableCategory,
}: AdminCreateProductModalProps) {
  if (!isAddProductModalOpen) return null;

  const safeGalleryImages = Array.isArray(galleryImages) ? galleryImages : [];

  return (
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
  );
}
