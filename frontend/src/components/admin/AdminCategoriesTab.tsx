import React from 'react';

interface AdminCategoriesTabProps {
  categoryTree?: any[];
  openCatModal: (category?: any, parentId?: number | null) => void;
  handleDeleteCategory: (id: number, name: string) => void;
}

export default function AdminCategoriesTab({
  categoryTree = [],
  openCatModal,
  handleDeleteCategory,
}: AdminCategoriesTabProps) {
  const safeTree = Array.isArray(categoryTree) ? categoryTree : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-outline-variant">
        <div>
          <span className="font-label-caps text-label-caps text-secondary mb-1 block uppercase tracking-widest font-bold">
            CATEGORY STRUCTURE MANAGEMENT
          </span>
          <h2 className="font-headline-md text-headline-md text-primary">Quản Lý Danh Mục Sản Phẩm DuoStyle</h2>
          <p className="font-body-md text-on-surface-variant/60 text-sm">
            Tổ chức cây danh mục phân cấp theo đối tượng (Nam / Nữ / Unisex) và quản lý các danh mục con.
          </p>
        </div>
        <button
          onClick={() => openCatModal(null, null)}
          className="bg-primary text-white font-label-caps text-xs px-5 py-3 rounded hover:bg-secondary transition-colors cursor-pointer flex items-center gap-2 font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm Danh Mục Gốc Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeTree.length === 0 ? (
          <div className="col-span-full p-8 text-center text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-md">
            Chưa có danh mục nào trong hệ thống. Hãy tạo danh mục đầu tiên!
          </div>
        ) : (
          safeTree.map((rootCat) => (
            <div
              key={rootCat.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-xs hover:border-primary/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-outline-variant/60">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">folder</span>
                    <div>
                      <h3 className="font-bold text-sm text-primary">{rootCat.name}</h3>
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        /{rootCat.slug}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-label-caps font-bold ${
                      rootCat.genderTarget === 'MEN'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : rootCat.genderTarget === 'WOMEN'
                        ? 'bg-pink-50 text-pink-800 border border-pink-200'
                        : 'bg-purple-50 text-purple-800 border border-purple-200'
                    }`}
                  >
                    {rootCat.genderTarget}
                  </span>
                </div>

                {/* Subcategories List */}
                <div className="space-y-1.5 mb-4">
                  <p className="text-[10px] font-label-caps font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Danh mục con ({rootCat.children?.length || 0}):
                  </p>
                  {rootCat.children && rootCat.children.length > 0 ? (
                    rootCat.children.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between bg-surface-container/40 px-3 py-1.5 rounded text-xs hover:bg-surface-container-high transition-colors"
                      >
                        <span className="font-medium text-on-surface">{sub.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openCatModal(sub, rootCat.id)}
                            className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="Sửa danh mục con"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(sub.id, sub.name)}
                            className="p-1 text-on-surface-variant hover:text-red-600 transition-colors cursor-pointer"
                            title="Xóa danh mục con"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-on-surface-variant/50 italic py-1">
                      Chưa có danh mục con nào.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/60">
                <button
                  onClick={() => openCatModal(null, rootCat.id)}
                  className="text-xs text-secondary font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Thêm Con
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCatModal(rootCat, null)}
                    className="px-2.5 py-1 text-xs border border-outline-variant rounded font-bold hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(rootCat.id, rootCat.name)}
                    className="px-2.5 py-1 text-xs border border-red-200 text-red-600 rounded font-bold hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
