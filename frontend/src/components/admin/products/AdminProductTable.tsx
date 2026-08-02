import React from 'react';
import { formatVND } from '../../ProductCard';
import Pagination from '../../Pagination';

interface AdminProductTableProps {
  products?: any[];
  inventorySearch: string;
  setInventorySearch: (val: string) => void;
  inventoryPage: number;
  setInventoryPage: (page: number) => void;
  setIsAddProductModalOpen: (open: boolean) => void;
  handleOpenAdminDetail: (prod: any) => void;
  handleOpenStockEdit: (prod: any) => void;
}

export default function AdminProductTable({
  products = [],
  inventorySearch,
  setInventorySearch,
  inventoryPage,
  setInventoryPage,
  setIsAddProductModalOpen,
  handleOpenAdminDetail,
  handleOpenStockEdit,
}: AdminProductTableProps) {
  const safeProducts = Array.isArray(products) ? products : [];
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
    </div>
  );
}
