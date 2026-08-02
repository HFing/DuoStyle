import React from 'react';
import { buildCategoryGroups, findCategoryGroup, firstSelectableCategory } from '../../services/categoryService';
import AdminProductTable from './products/AdminProductTable';
import AdminCreateProductModal from './products/AdminCreateProductModal';
import AdminStockEditModal from './products/AdminStockEditModal';
import AdminDetailEditModal from './products/AdminDetailEditModal';

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
  showToast?: (msg: string, type?: string) => void;
}

export default function AdminProductsTab(props: AdminProductsTabProps) {
  const categoryGroups = buildCategoryGroups(props.categoryTree || []);
  const selectedNewGroup = findCategoryGroup(categoryGroups, props.newProdSubCatId) || categoryGroups[0] || null;
  const selectedDetailGroup = findCategoryGroup(categoryGroups, props.detailSubCatId) || categoryGroups[0] || null;

  return (
    <div className="space-y-6">
      {/* 1. Main Inventory Table & Header */}
      <AdminProductTable
        products={props.products}
        inventorySearch={props.inventorySearch}
        setInventorySearch={props.setInventorySearch}
        inventoryPage={props.inventoryPage}
        setInventoryPage={props.setInventoryPage}
        setIsAddProductModalOpen={props.setIsAddProductModalOpen}
        handleOpenAdminDetail={props.handleOpenAdminDetail}
        handleOpenStockEdit={props.handleOpenStockEdit}
      />

      {/* 2. Add New Product Modal */}
      <AdminCreateProductModal
        isAddProductModalOpen={props.isAddProductModalOpen}
        setIsAddProductModalOpen={props.setIsAddProductModalOpen}
        handleCreateProductSubmit={props.handleCreateProductSubmit}
        newProdName={props.newProdName}
        setNewProdName={props.setNewProdName}
        setNewProdGender={props.setNewProdGender}
        newProdSubCatId={props.newProdSubCatId}
        setNewProdSubCatId={props.setNewProdSubCatId}
        newProdPrice={props.newProdPrice}
        setNewProdPrice={props.setNewProdPrice}
        newProdColor={props.newProdColor}
        setNewProdColor={props.setNewProdColor}
        newProdSku={props.newProdSku}
        setNewProdSku={props.setNewProdSku}
        newProdDesc={props.newProdDesc}
        setNewProdDesc={props.setNewProdDesc}
        newProdMaterial={props.newProdMaterial}
        setNewProdMaterial={props.setNewProdMaterial}
        primaryImage={props.primaryImage}
        setPrimaryImage={props.setPrimaryImage}
        galleryImages={props.galleryImages}
        setGalleryImages={props.setGalleryImages}
        uploadingPrimary={props.uploadingPrimary}
        setUploadingPrimary={props.setUploadingPrimary}
        uploadingGallery={props.uploadingGallery}
        setUploadingGallery={props.setUploadingGallery}
        handlePrimaryFileUpload={props.handlePrimaryFileUpload}
        handleGalleryFilesUpload={props.handleGalleryFilesUpload}
        handleRemoveGalleryImage={props.handleRemoveGalleryImage}
        newProdSizeS={props.newProdSizeS}
        setNewProdSizeS={props.setNewProdSizeS}
        newProdSizeM={props.newProdSizeM}
        setNewProdSizeM={props.setNewProdSizeM}
        newProdSizeL={props.newProdSizeL}
        setNewProdSizeL={props.setNewProdSizeL}
        newProdSizeXL={props.newProdSizeXL}
        setNewProdSizeXL={props.setNewProdSizeXL}
        categoryGroups={categoryGroups}
        selectedNewGroup={selectedNewGroup}
        firstSelectableCategory={firstSelectableCategory}
      />

      {/* 3. Stock Edit Modal */}
      <AdminStockEditModal
        editingStockProduct={props.editingStockProduct}
        setEditingStockProduct={props.setEditingStockProduct}
        newStockValues={props.newStockValues}
        setNewStockValues={props.setNewStockValues}
        handleDeleteSizeInStockEdit={props.handleDeleteSizeInStockEdit}
        addSizeName={props.addSizeName}
        setAddSizeName={props.setAddSizeName}
        addSizeStock={props.addSizeStock}
        setAddSizeStock={props.setAddSizeStock}
        handleAddNewSizeToStockEdit={props.handleAddNewSizeToStockEdit}
        handleSaveStock={props.handleSaveStock}
      />

      {/* 4. Product Detail Edit Modal */}
      <AdminDetailEditModal
        editingAdminDetailProduct={props.editingAdminDetailProduct}
        setEditingAdminDetailProduct={props.setEditingAdminDetailProduct}
        detailName={props.detailName}
        setDetailName={props.setDetailName}
        detailSlug={props.detailSlug}
        setDetailSlug={props.setDetailSlug}
        detailGender={props.detailGender}
        setDetailGender={props.setDetailGender}
        detailSubCatId={props.detailSubCatId}
        setDetailSubCatId={props.setDetailSubCatId}
        detailPrice={props.detailPrice}
        setDetailPrice={props.setDetailPrice}
        detailColor={props.detailColor}
        setDetailColor={props.setDetailColor}
        detailSku={props.detailSku}
        setDetailSku={props.setDetailSku}
        detailDesc={props.detailDesc}
        setDetailDesc={props.setDetailDesc}
        detailMaterial={props.detailMaterial}
        setDetailMaterial={props.setDetailMaterial}
        detailPrimaryImg={props.detailPrimaryImg}
        setDetailPrimaryImg={props.setDetailPrimaryImg}
        detailGalleryImgs={props.detailGalleryImgs}
        setDetailGalleryImgs={props.setDetailGalleryImgs}
        detailVariants={props.detailVariants}
        setDetailVariants={props.setDetailVariants}
        detailAddSize={props.detailAddSize}
        setDetailAddSize={props.setDetailAddSize}
        detailAddSizeStock={props.detailAddSizeStock}
        setDetailAddSizeStock={props.setDetailAddSizeStock}
        handleSaveAdminDetail={props.handleSaveAdminDetail}
        handlePrimaryFileUpload={props.handlePrimaryFileUpload}
        handleGalleryFilesUpload={props.handleGalleryFilesUpload}
        categoryGroups={categoryGroups}
        selectedDetailGroup={selectedDetailGroup}
        firstSelectableCategory={firstSelectableCategory}
        showToast={props.showToast}
      />
    </div>
  );
}
