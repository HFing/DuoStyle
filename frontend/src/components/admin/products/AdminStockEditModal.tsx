import React from 'react';

interface AdminStockEditModalProps {
  editingStockProduct: any;
  setEditingStockProduct: (prod: any) => void;
  newStockValues: any;
  setNewStockValues: (val: any) => void;
  handleDeleteSizeInStockEdit: (sizeId: any) => void;
  addSizeName: string;
  setAddSizeName: (val: string) => void;
  addSizeStock: any;
  setAddSizeStock: (val: any) => void;
  handleAddNewSizeToStockEdit: () => void;
  handleSaveStock: () => void;
}

export default function AdminStockEditModal({
  editingStockProduct,
  setEditingStockProduct,
  newStockValues,
  setNewStockValues,
  handleDeleteSizeInStockEdit,
  addSizeName,
  setAddSizeName,
  addSizeStock,
  setAddSizeStock,
  handleAddNewSizeToStockEdit,
  handleSaveStock,
}: AdminStockEditModalProps) {
  if (!editingStockProduct) return null;

  return (
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
  );
}
