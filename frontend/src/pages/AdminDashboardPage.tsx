import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/axios';
import OrderDetailModal from '../components/OrderDetailModal';
import AdminAiSettings from '../components/AdminAiSettings';
import AdminBannerModal, { BannerData } from '../components/AdminBannerModal';

// Modular Admin Tab Components
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminAnalyticsTab from '../components/admin/AdminAnalyticsTab';
import AdminOrdersTab from '../components/admin/AdminOrdersTab';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminCustomersTab from '../components/admin/AdminCustomersTab';
import AdminCategoriesTab from '../components/admin/AdminCategoriesTab';
import AdminVouchersTab from '../components/admin/AdminVouchersTab';
import AdminBannersTab from '../components/admin/AdminBannersTab';
import AdminReviewsTab from '../components/admin/AdminReviewsTab';
import { normalizeAdminOrders } from '../utils/admin-orders';
import { buildProductRequest, buildStockProductRequest, createAdminApi, validateProductDraft } from '../utils/admin-api';
import { buildCategoryGroups, findCategoryGroup, firstSelectableCategory } from '../utils/category-selection';

const adminApi = createAdminApi(api);

export default function AdminDashboardPage({ onNavigate, user, showToast, onLogout }: any) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [products, setProducts] = useState<any[]>([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryPage, setInventoryPage] = useState(1);

  // Admin Banner Management State
  const [adminBanners, setAdminBanners] = useState<BannerData[]>([]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);

  // User Management State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [usersPage, setUsersPage] = useState(1);

  // Analytics Dynamic State
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // Admin Vouchers State
  const [adminVouchers, setAdminVouchers] = useState<any[]>([]);
  const [isAddVoucherModalOpen, setIsAddVoucherModalOpen] = useState(false);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherTitle, setNewVoucherTitle] = useState('');
  const [newVoucherDesc, setNewVoucherDesc] = useState('');
  const [newVoucherDiscountType, setNewVoucherDiscountType] = useState('FIXED');
  const [newVoucherDiscountValue, setNewVoucherDiscountValue] = useState('100000');
  const [newVoucherMinOrder, setNewVoucherMinOrder] = useState('500000');
  const [newVoucherMaxDiscount, setNewVoucherMaxDiscount] = useState('');
  const [newVoucherExpiry, setNewVoucherExpiry] = useState('');

  // Admin Order Management State
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [adminOrderFilter, setAdminOrderFilter] = useState('ALL');
  const [adminOrderSearch, setAdminOrderSearch] = useState('');
  const [ordersPage, setOrdersPage] = useState(1);
  const [selectedOrderCode, setSelectedOrderCode] = useState<string | null>(null);

  // Admin Review Management State
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [adminReviewSearch, setAdminReviewSearch] = useState('');
  const [adminReviewRatingFilter, setAdminReviewRatingFilter] = useState('');
  const [reviewsPage, setReviewsPage] = useState(1);
  const [totalReviewsPages, setTotalReviewsPages] = useState(1);
  const [replyingReview, setReplyingReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modals state
  const [editingStockProduct, setEditingStockProduct] = useState<any>(null);
  const [editingAdminDetailProduct, setEditingAdminDetailProduct] = useState<any>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // New Size State for Edit Stock Modal
  const [addSizeName, setAddSizeName] = useState('S');
  const [addSizeCustom, setAddSizeCustom] = useState('');
  const [addSizeStock, setAddSizeStock] = useState<any>(0);
  const [newStockValues, setNewStockValues] = useState<Record<string, number>>({});

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdGender, setNewProdGender] = useState('MEN');
  const [newProdSubCatId, setNewProdSubCatId] = useState<any>('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdColor, setNewProdColor] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdMaterial, setNewProdMaterial] = useState('');

  // Image Upload States
  const [primaryImage, setPrimaryImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // New Product Size Stocks State
  const [newProdSizeS, setNewProdSizeS] = useState<any>(0);
  const [newProdSizeM, setNewProdSizeM] = useState<any>(0);
  const [newProdSizeL, setNewProdSizeL] = useState<any>(0);
  const [newProdSizeXL, setNewProdSizeXL] = useState<any>(0);

  // Admin Detail Edit Product State
  const [detailName, setDetailName] = useState('');
  const [detailGender, setDetailGender] = useState('MEN');
  const [detailSubCatId, setDetailSubCatId] = useState<any>(1);
  const [detailPrice, setDetailPrice] = useState('');
  const [detailColor, setDetailColor] = useState('');
  const [detailSku, setDetailSku] = useState('');
  const [detailDesc, setDetailDesc] = useState('');
  const [detailMaterial, setDetailMaterial] = useState('');
  const [detailPrimaryImg, setDetailPrimaryImg] = useState('');
  const [detailGalleryImgs, setDetailGalleryImgs] = useState<string[]>([]);
  const [detailVariants, setDetailVariants] = useState<any[]>([]);
  const [detailAddSize, setDetailAddSize] = useState('S');
  const [detailAddSizeStock, setDetailAddSizeStock] = useState<any>(0);

  // Category Management State
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [catEditId, setCatEditId] = useState<number | null>(null);
  const [catEditName, setCatEditName] = useState('');
  const [catEditSlug, setCatEditSlug] = useState('');
  const [catEditGender, setCatEditGender] = useState('MEN');
  const [catEditParentId, setCatEditParentId] = useState<number | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  const fetchCategories = () => {
    api
      .get('/categories/tree')
      .then((res) => {
        if (res.data?.data) {
          const tree = res.data.data;
          const groups = buildCategoryGroups(tree);
          setCategoryTree(tree);
          setNewProdSubCatId((current: any) => {
            if (findCategoryGroup(groups, current)) return current;
            const group = groups[0];
            const category = firstSelectableCategory(group);
            if (group) setNewProdGender(group.genderTarget);
            return category?.id ?? '';
          });
        }
      })
      .catch((err) => console.log('Error fetching categories'));
  };

  useEffect(() => {
    api
      .get('/products?size=50')
      .then((res) => {
        if (res.data?.data?.content) {
          setProducts(res.data.data.content);
        }
      })
      .catch(() => setProducts([]));

    api
      .get('/admin/users')
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setUsersList(res.data.data);
        }
      })
      .catch(() => setUsersList([]));

    fetchCategories();
  }, []);

  const fetchAdminOrders = () => {
    api
      .get('/admin/orders')
      .then((res) => {
        setAdminOrders(normalizeAdminOrders(res.data?.data));
      })
      .catch((err) => console.log('Admin orders load error'));
  };

  const fetchMonthlySales = () => {
    adminApi
      .getMonthlySales()
      .then(setMonthlySales)
      .catch((err) => console.log('Monthly sales load error'));
  };

  const fetchTopProducts = () => {
    adminApi
      .getTopProducts()
      .then(setTopProducts)
      .catch((err) => console.log('Top products load error'));
  };

  const fetchAdminVouchers = () => {
    api
      .get('/admin/vouchers')
      .then((res) => {
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setAdminVouchers(list);
      })
      .catch((err) => console.log('Admin vouchers load error'));
  };

  useEffect(() => {
    fetchMonthlySales();
    fetchTopProducts();
    fetchAdminVouchers();
    fetchAdminOrders();
    fetchAdminBanners();
  }, []);

  const fetchAdminBanners = () => {
    adminApi
      .getBanners()
      .then(setAdminBanners)
      .catch((err) => console.log('Admin banners load error'));
  };

  const fetchAdminReviews = useCallback(() => {
    adminApi
      .getReviews({
        page: reviewsPage - 1,
        size: 10,
        ...(adminReviewSearch.trim() ? { search: adminReviewSearch.trim() } : {}),
        ...(adminReviewRatingFilter ? { rating: Number(adminReviewRatingFilter) } : {}),
      })
      .then((page) => {
        setAdminReviews(page.content);
        setTotalReviewsPages(page.totalPages);
      })
      .catch((err) => console.log('Admin reviews load error'));
  }, [reviewsPage, adminReviewSearch, adminReviewRatingFilter]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchAdminReviews();
    }
  }, [activeTab, fetchAdminReviews]);

  const handleToggleReviewActive = async (review: any) => {
    try {
      const updated = await adminApi.toggleReview(review.id);
      if (updated) {
        if (showToast) showToast('Đã cập nhật trạng thái hiển thị đánh giá!', 'success');
        fetchAdminReviews();
      }
    } catch (err: any) {
      if (showToast)
        showToast(err.response?.data?.message || 'Lỗi cập nhật trạng thái đánh giá', 'error');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;
    try {
      const updated = await adminApi.replyToReview(replyingReview.id, replyText);
      if (updated) {
        if (showToast) showToast('Đã lưu phản hồi đánh giá thành công!', 'success');
        setReplyingReview(null);
        setReplyText('');
        fetchAdminReviews();
      }
    } catch (err: any) {
      if (showToast) showToast(err.response?.data?.message || 'Lỗi gửi phản hồi', 'error');
    }
  };

  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: BannerData) => {
    setEditingBanner(b);
    setIsBannerModalOpen(true);
  };

  const handleToggleBannerActive = async (b: BannerData) => {
    try {
      const updated = await adminApi.toggleBanner(Number(b.id));
      if (updated) {
        if (showToast) showToast('Đã cập nhật trạng thái Banner!', 'success');
        fetchAdminBanners();
      }
    } catch (err: any) {
      if (showToast) showToast('Không thể đổi trạng thái Banner!', 'error');
    }
  };

  const handleDeleteBanner = async (b: BannerData) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa Banner "${b.title || 'này'}" không?`)) return;
    try {
      await adminApi.deleteBanner(Number(b.id));
      if (showToast) showToast('Đã xóa Banner thành công!', 'success');
      fetchAdminBanners();
    } catch (err: any) {
      if (showToast) showToast('Không thể xóa Banner!', 'error');
    }
  };

  const handleSaveBanner = async (banner: BannerData) => {
    if (editingBanner?.id) {
      await adminApi.updateBanner(editingBanner.id, banner);
    } else {
      await adminApi.createBanner(banner);
    }
    if (showToast) showToast('Đã lưu Banner thành công!', 'success');
    fetchAdminBanners();
  };

  const handleCreateVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherCode.trim()) {
      if (showToast) showToast('Vui lòng nhập mã Voucher!', 'error');
      return;
    }

    const payload = {
      code: newVoucherCode.trim().toUpperCase(),
      title: newVoucherTitle || newVoucherCode.trim().toUpperCase(),
      description: newVoucherDesc,
      discountType: newVoucherDiscountType,
      discountValue: Number(newVoucherDiscountValue) || 0,
      minOrderAmount: Number(newVoucherMinOrder) || 0,
      maxDiscountAmount:
        newVoucherDiscountType === 'PERCENT' ? Number(newVoucherMaxDiscount) : null,
      expiryDate: newVoucherExpiry ? `${newVoucherExpiry}T23:59:59` : null,
      active: true,
    };

    api
      .post('/admin/vouchers', payload)
      .then((res) => {
        if (showToast) showToast('Tạo Voucher thành công!', 'success');
        setIsAddVoucherModalOpen(false);
        fetchAdminVouchers();
      })
      .catch((err) => {
        if (showToast)
          showToast(err.response?.data?.message || 'Không thể tạo Voucher!', 'error');
      });
  };

  const handleToggleVoucherStatus = (id: number) => {
    api
      .put(`/admin/vouchers/${id}/toggle`)
      .then((res) => {
        if (showToast) showToast('Cập nhật trạng thái Voucher thành công!', 'success');
        fetchAdminVouchers();
      })
      .catch((err) => {
        if (showToast) showToast('Lỗi cập nhật trạng thái Voucher', 'error');
      });
  };

  const handleDeleteVoucher = (id: number, code: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn mã Voucher [${code}] không?`)) return;
    api
      .delete(`/admin/vouchers/${id}`)
      .then(() => {
        if (showToast) showToast('Đã xóa Voucher!', 'success');
        fetchAdminVouchers();
      })
      .catch((err) => {
        if (showToast) showToast('Lỗi khi xóa Voucher', 'error');
      });
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const openCatModal = (category: any = null, parentId: number | null = null) => {
    if (category) {
      setCatEditId(category.id);
      setCatEditName(category.name || '');
      setCatEditSlug(category.slug || '');
      setCatEditGender(category.genderTarget || 'MEN');
      setCatEditParentId(parentId);
    } else {
      setCatEditId(null);
      setCatEditName('');
      setCatEditSlug('');
      setCatEditGender('MEN');
      setCatEditParentId(parentId);
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catEditName.trim()) {
      if (showToast) showToast('Vui lòng nhập tên danh mục!', 'error');
      return;
    }

    const payload = {
      name: catEditName.trim(),
      slug: catEditSlug.trim() || generateSlug(catEditName),
      genderTarget: catEditGender,
      parentId: catEditParentId,
    };

    if (catEditId) {
      adminApi
        .updateCategory(catEditId, payload)
        .then(() => {
          if (showToast) showToast('Cập nhật danh mục thành công!', 'success');
          setIsCatModalOpen(false);
          fetchCategories();
        })
        .catch((err) => {
          if (showToast)
            showToast(err.response?.data?.message || 'Không thể cập nhật danh mục!', 'error');
        });
    } else {
      adminApi
        .createCategory(payload)
        .then(() => {
          if (showToast) showToast('Tạo danh mục mới thành công!', 'success');
          setIsCatModalOpen(false);
          fetchCategories();
        })
        .catch((err) => {
          if (showToast)
            showToast(err.response?.data?.message || 'Không thể tạo danh mục!', 'error');
        });
    }
  };

  const handleDeleteCategory = (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}" không?`)) return;

    adminApi
      .deleteCategory(id)
      .then(() => {
        if (showToast) showToast(`Đã xóa danh mục "${name}"!`, 'success');
        fetchCategories();
      })
      .catch((err) => {
        if (showToast)
          showToast(err.response?.data?.message || 'Không thể xóa danh mục này!', 'error');
      });
  };

  const handleToggleUserStatus = async (targetUser: any) => {
    try {
      const res = await api.put(`/admin/users/${targetUser.id}/toggle-status`);
      if (res.data?.data) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, enabled: res.data.data.enabled } : u))
        );
        if (showToast)
          showToast(
            `Đã ${res.data.data.enabled ? 'kích hoạt' : 'khóa'} tài khoản ${targetUser.email}!`,
            'success'
          );
      }
    } catch (err: any) {
      if (showToast)
        showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái user', 'error');
    }
  };

  const handleOpenStockEdit = (prod: any) => {
    setEditingStockProduct(prod);
    const initialMap: Record<string, number> = {};
    if (prod.variants) {
      prod.variants.forEach((v: any) => {
        initialMap[v.id || v.size] = v.stockQuantity;
      });
    }
    setNewStockValues(initialMap);
  };

  const handleDeleteSizeInStockEdit = (variantIdOrSize: any) => {
    if (!editingStockProduct) return;
    const updatedVariants = editingStockProduct.variants.filter(
      (v: any) => (v.id || v.size) !== variantIdOrSize
    );
    setEditingStockProduct({
      ...editingStockProduct,
      variants: updatedVariants,
    });
    const copy = { ...newStockValues };
    delete copy[variantIdOrSize];
    setNewStockValues(copy);
  };

  const handleAddNewSizeToStockEdit = () => {
    if (!editingStockProduct) return;
    const finalSizeName = addSizeName === 'CUSTOM' ? addSizeCustom.trim().toUpperCase() : addSizeName;
    if (!finalSizeName) {
      if (showToast) showToast('Vui lòng nhập tên size tùy chỉnh!', 'error');
      return;
    }

    if (editingStockProduct.variants?.some((v: any) => v.size === finalSizeName)) {
      if (showToast) showToast(`Size ${finalSizeName} đã tồn tại!`, 'error');
      return;
    }

    const newVariantObj = {
      id: null,
      size: finalSizeName,
      stockQuantity: Number(addSizeStock) || 0,
      price: editingStockProduct.basePrice,
      color: editingStockProduct.color || 'Default',
      sku: `${editingStockProduct.slug || editingStockProduct.id}-${finalSizeName}`.toUpperCase(),
    };

    setEditingStockProduct({
      ...editingStockProduct,
      variants: [...(editingStockProduct.variants || []), newVariantObj],
    });

    setNewStockValues({
      ...newStockValues,
      [finalSizeName]: Number(addSizeStock) || 0,
    });

    if (showToast) showToast(`Đã thêm Size ${finalSizeName} thành công!`, 'success');
  };

  const handleSaveStock = async () => {
    if (!editingStockProduct) return;
    try {
      const updatePayload = buildStockProductRequest(editingStockProduct, newStockValues);
      const updated = await adminApi.updateProduct(editingStockProduct.id, updatePayload);
      if (updated) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingStockProduct.id ? updated : p))
        );
        setEditingStockProduct(null);
        if (showToast) showToast('Cập nhật tồn kho và Size thành công!', 'success');
      }
    } catch (err: any) {
      if (showToast) showToast('Không thể cập nhật tồn kho!', 'error');
    }
  };

  const handlePrimaryFileUpload = async (
    e: any,
    setImageUrlState: (url: string) => void,
    setLoadingState: (loading: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingState(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const imageUrl = await adminApi.uploadImage(formData);
      if (imageUrl) {
        setImageUrlState(imageUrl);
        if (showToast) showToast('Tải ảnh chính lên Cloudinary thành công!', 'success');
      }
    } catch (err: any) {
      if (showToast) showToast('Lỗi khi tải file ảnh lên máy chủ', 'error');
    } finally {
      setLoadingState(false);
    }
  };

  const handleGalleryFilesUpload = async (
    e: any,
    setGalleryState: any,
    setLoadingState: (loading: boolean) => void
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoadingState(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      try {
        const imageUrl = await adminApi.uploadImage(formData);
        if (imageUrl) uploadedUrls.push(imageUrl);
      } catch (err) {
        console.log('One gallery upload failed');
      }
    }

    setGalleryState((prev: string[]) => [...prev, ...uploadedUrls]);
    setLoadingState(false);
    if (showToast) showToast(`Đã tải lên ${uploadedUrls.length} ảnh gallery phụ!`, 'success');
  };

  const handleRemoveGalleryImage = (idxToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const initialVariants = [];
    if (Number(newProdSizeS) > 0)
      initialVariants.push({
        size: 'S',
        sku: `${newProdSku}-S`,
        stockQuantity: Number(newProdSizeS),
        price: Number(newProdPrice),
        color: newProdColor,
      });
    if (Number(newProdSizeM) > 0)
      initialVariants.push({
        size: 'M',
        sku: `${newProdSku}-M`,
        stockQuantity: Number(newProdSizeM),
        price: Number(newProdPrice),
        color: newProdColor,
      });
    if (Number(newProdSizeL) > 0)
      initialVariants.push({
        size: 'L',
        sku: `${newProdSku}-L`,
        stockQuantity: Number(newProdSizeL),
        price: Number(newProdPrice),
        color: newProdColor,
      });
    if (Number(newProdSizeXL) > 0)
      initialVariants.push({
        size: 'XL',
        sku: `${newProdSku}-XL`,
        stockQuantity: Number(newProdSizeXL),
        price: Number(newProdPrice),
        color: newProdColor,
      });

    const validationError = validateProductDraft({
      name: newProdName,
      skuPrefix: newProdSku,
      basePrice: newProdPrice,
      categoryId: newProdSubCatId,
      thumbnailUrl: primaryImage,
      variants: initialVariants,
    });
    if (validationError) {
      if (showToast) showToast(validationError, 'error');
      return;
    }

    const payload = buildProductRequest({
      name: newProdName,
      slug: generateSlug(newProdName),
      genderTarget: newProdGender,
      categoryId: Number(newProdSubCatId),
      basePrice: Number(newProdPrice),
      description: newProdDesc,
      thumbnailUrl: primaryImage,
      images: [primaryImage, ...galleryImages].filter(Boolean),
      variants: initialVariants,
    });

    try {
      const created = await adminApi.createProduct(payload);
      if (created) {
        setProducts((prev) => [created, ...prev]);
        setIsAddProductModalOpen(false);
        if (showToast) showToast('Tạo sản phẩm mới & Lưu kho thành công!', 'success');
      }
    } catch (err: any) {
      if (showToast)
        showToast(err.response?.data?.message || 'Không thể tạo sản phẩm mới!', 'error');
    }
  };

  const handleOpenAdminDetail = (prod: any) => {
    setEditingAdminDetailProduct(prod);
    setDetailName(prod.name || '');
    setDetailGender(prod.genderTarget || 'MEN');
    setDetailSubCatId(prod.categoryId || 1);
    setDetailPrice(prod.basePrice ? String(prod.basePrice) : '');
    setDetailColor(prod.color || '');
    setDetailSku(prod.sku || '');
    setDetailDesc(prod.description || '');
    setDetailMaterial(prod.materialCare || '');
    setDetailPrimaryImg(prod.thumbnailUrl || '');
    setDetailGalleryImgs((prod.images || []).filter((url: string) => url !== prod.thumbnailUrl));
    setDetailVariants(
      prod.variants ? prod.variants.map((v: any) => ({ ...v })) : []
    );
  };

  const handleSaveAdminDetail = async () => {
    if (!editingAdminDetailProduct) return;

    const payload = buildProductRequest({
      name: detailName,
      slug: editingAdminDetailProduct.slug || generateSlug(detailName),
      genderTarget: detailGender,
      categoryId: Number(detailSubCatId),
      basePrice: Number(detailPrice),
      description: detailDesc,
      thumbnailUrl: detailPrimaryImg,
      images: [detailPrimaryImg, ...detailGalleryImgs].filter(Boolean),
      variants: detailVariants.map((variant: any) => ({
        ...variant,
        color: variant.color || detailColor,
        sku: variant.sku || `${detailSku || editingAdminDetailProduct.slug}-${variant.size}`.toUpperCase(),
        price: variant.price ?? Number(detailPrice),
      })),
    });

    try {
      const updated = await adminApi.updateProduct(editingAdminDetailProduct.id, payload);
      if (updated) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingAdminDetailProduct.id ? updated : p))
        );
        setEditingAdminDetailProduct(null);
        if (showToast) showToast('Đã lưu toàn bộ thuộc tính sản phẩm!', 'success');
      }
    } catch (err: any) {
      if (showToast) showToast('Lỗi khi cập nhật chi tiết sản phẩm', 'error');
    }
  };

  const chartData = useMemo(() => {
    if (!monthlySales || monthlySales.length === 0) return [];

    if (chartPeriod === 'quarterly') {
      return [1, 2, 3, 4].map((quarter) => {
        const months = monthlySales.filter((item) => Math.ceil(Number(item.month) / 3) === quarter);
        return {
          label: `Q${quarter}`,
          revenue: months.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0),
          orderCount: months.reduce((sum, item) => sum + (Number(item.orderCount) || 0), 0),
        };
      });
    }

    return monthlySales.map((item) => ({
      label: item.monthName,
      revenue: Number(item.revenue) || 0,
      orderCount: Number(item.orderCount) || 0,
    }));
  }, [monthlySales, chartPeriod]);

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 10000000);
  const numPoints = chartData.length;

  const pointsCoords = chartData.map((d, i) => {
    const x = numPoints > 1 ? (i / (numPoints - 1)) * 920 + 40 : 500;
    const y = 250 - (d.revenue / maxRevenue) * 200;
    return { ...d, x, y };
  });

  const polylinePoints = pointsCoords.map((p) => `${p.x},${p.y}`).join(' ');

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status?status=${newStatus}`);
      if (res.data?.data) {
        setAdminOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (showToast)
          showToast(`Đã chuyển trạng thái đơn hàng sang ${newStatus}!`, 'success');
      }
    } catch (err: any) {
      if (showToast) showToast('Không thể đổi trạng thái đơn hàng!', 'error');
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex selection:bg-secondary-container">
      {/* SideNavBar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
        fetchAdminReviews={fetchAdminReviews}
      />

      {/* Main Content Area */}
      <main className="ml-64 flex flex-col min-h-screen flex-grow">
        {/* Content Section */}
        <section className="p-margin-desktop space-y-8 animate-fadeIn">
          {activeTab === 'ai-settings' && <AdminAiSettings showToast={showToast} />}

          {activeTab === 'analytics' && (
            <AdminAnalyticsTab
              adminOrders={adminOrders}
              usersList={usersList}
              topProducts={topProducts}
              chartPeriod={chartPeriod}
              setChartPeriod={setChartPeriod}
              polylinePoints={polylinePoints}
              pointsCoords={pointsCoords}
              hoveredPoint={hoveredPoint}
              setHoveredPoint={setHoveredPoint}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersTab
              adminOrders={adminOrders}
              adminOrderSearch={adminOrderSearch}
              setAdminOrderSearch={setAdminOrderSearch}
              adminOrderFilter={adminOrderFilter}
              setAdminOrderFilter={setAdminOrderFilter}
              ordersPage={ordersPage}
              setOrdersPage={setOrdersPage}
              handleUpdateOrderStatus={handleUpdateOrderStatus}
              setSelectedOrderCode={setSelectedOrderCode}
              setIsDetailModalOpen={setIsDetailModalOpen}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomersTab
              usersList={usersList}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userStatusFilter={userStatusFilter}
              setUserStatusFilter={setUserStatusFilter}
              usersPage={usersPage}
              setUsersPage={setUsersPage}
              handleToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsTab
              products={products}
              inventorySearch={inventorySearch}
              setInventorySearch={setInventorySearch}
              inventoryPage={inventoryPage}
              setInventoryPage={setInventoryPage}
              setIsAddProductModalOpen={setIsAddProductModalOpen}
              handleOpenAdminDetail={handleOpenAdminDetail}
              handleOpenStockEdit={handleOpenStockEdit}
              isAddProductModalOpen={isAddProductModalOpen}
              handleCreateProductSubmit={handleCreateProductSubmit}
              newProdName={newProdName}
              setNewProdName={setNewProdName}
              newProdGender={newProdGender}
              setNewProdGender={setNewProdGender}
              newProdSubCatId={newProdSubCatId}
              setNewProdSubCatId={setNewProdSubCatId}
              newProdPrice={newProdPrice}
              setNewProdPrice={setNewProdPrice}
              newProdColor={newProdColor}
              setNewProdColor={setNewProdColor}
              newProdSku={newProdSku}
              setNewProdSku={setNewProdSku}
              newProdDesc={newProdDesc}
              setNewProdDesc={setNewProdDesc}
              newProdMaterial={newProdMaterial}
              setNewProdMaterial={setNewProdMaterial}
              primaryImage={primaryImage}
              setPrimaryImage={setPrimaryImage}
              galleryImages={galleryImages}
              setGalleryImages={setGalleryImages}
              uploadingPrimary={uploadingPrimary}
              setUploadingPrimary={setUploadingPrimary}
              uploadingGallery={uploadingGallery}
              setUploadingGallery={setUploadingGallery}
              handlePrimaryFileUpload={handlePrimaryFileUpload}
              handleGalleryFilesUpload={handleGalleryFilesUpload}
              handleRemoveGalleryImage={handleRemoveGalleryImage}
              newProdSizeS={newProdSizeS}
              setNewProdSizeS={setNewProdSizeS}
              newProdSizeM={newProdSizeM}
              setNewProdSizeM={setNewProdSizeM}
              newProdSizeL={newProdSizeL}
              setNewProdSizeL={setNewProdSizeL}
              newProdSizeXL={newProdSizeXL}
              setNewProdSizeXL={setNewProdSizeXL}
              categoryTree={categoryTree}
              editingStockProduct={editingStockProduct}
              setEditingStockProduct={setEditingStockProduct}
              newStockValues={newStockValues}
              setNewStockValues={setNewStockValues}
              handleDeleteSizeInStockEdit={handleDeleteSizeInStockEdit}
              addSizeName={addSizeName}
              setAddSizeName={setAddSizeName}
              addSizeCustom={addSizeCustom}
              setAddSizeCustom={setAddSizeCustom}
              addSizeStock={addSizeStock}
              setAddSizeStock={setAddSizeStock}
              handleAddNewSizeToStockEdit={handleAddNewSizeToStockEdit}
              handleSaveStock={handleSaveStock}
              editingAdminDetailProduct={editingAdminDetailProduct}
              setEditingAdminDetailProduct={setEditingAdminDetailProduct}
              detailName={detailName}
              setDetailName={setDetailName}
              detailGender={detailGender}
              setDetailGender={setDetailGender}
              detailSubCatId={detailSubCatId}
              setDetailSubCatId={setDetailSubCatId}
              detailPrice={detailPrice}
              setDetailPrice={setDetailPrice}
              detailColor={detailColor}
              setDetailColor={setDetailColor}
              detailSku={detailSku}
              setDetailSku={setDetailSku}
              detailDesc={detailDesc}
              setDetailDesc={setDetailDesc}
              detailMaterial={detailMaterial}
              setDetailMaterial={setDetailMaterial}
              detailPrimaryImg={detailPrimaryImg}
              setDetailPrimaryImg={setDetailPrimaryImg}
              detailGalleryImgs={detailGalleryImgs}
              setDetailGalleryImgs={setDetailGalleryImgs}
              detailVariants={detailVariants}
              setDetailVariants={setDetailVariants}
              detailAddSize={detailAddSize}
              setDetailAddSize={setDetailAddSize}
              detailAddSizeStock={detailAddSizeStock}
              setDetailAddSizeStock={setDetailAddSizeStock}
              handleSaveAdminDetail={handleSaveAdminDetail}
              showToast={showToast}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategoriesTab
              categoryTree={categoryTree}
              openCatModal={openCatModal}
              handleDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'vouchers' && (
            <AdminVouchersTab
              adminVouchers={adminVouchers}
              isAddVoucherModalOpen={isAddVoucherModalOpen}
              setIsAddVoucherModalOpen={setIsAddVoucherModalOpen}
              newVoucherCode={newVoucherCode}
              setNewVoucherCode={setNewVoucherCode}
              newVoucherTitle={newVoucherTitle}
              setNewVoucherTitle={setNewVoucherTitle}
              newVoucherDesc={newVoucherDesc}
              setNewVoucherDesc={setNewVoucherDesc}
              newVoucherDiscountType={newVoucherDiscountType}
              setNewVoucherDiscountType={setNewVoucherDiscountType}
              newVoucherDiscountValue={newVoucherDiscountValue}
              setNewVoucherDiscountValue={setNewVoucherDiscountValue}
              newVoucherMinOrder={newVoucherMinOrder}
              setNewVoucherMinOrder={setNewVoucherMinOrder}
              newVoucherMaxDiscount={newVoucherMaxDiscount}
              setNewVoucherMaxDiscount={setNewVoucherMaxDiscount}
              newVoucherExpiry={newVoucherExpiry}
              setNewVoucherExpiry={setNewVoucherExpiry}
              handleCreateVoucherSubmit={handleCreateVoucherSubmit}
              handleToggleVoucherStatus={handleToggleVoucherStatus}
              handleDeleteVoucher={handleDeleteVoucher}
            />
          )}

          {activeTab === 'banners' && (
            <AdminBannersTab
              adminBanners={adminBanners}
              handleOpenAddBanner={handleOpenAddBanner}
              handleOpenEditBanner={handleOpenEditBanner}
              handleToggleBannerActive={handleToggleBannerActive}
              handleDeleteBanner={handleDeleteBanner}
            />
          )}

          {activeTab === 'reviews' && (
            <AdminReviewsTab
              adminReviews={adminReviews}
              adminReviewSearch={adminReviewSearch}
              setAdminReviewSearch={setAdminReviewSearch}
              adminReviewRatingFilter={adminReviewRatingFilter}
              setAdminReviewRatingFilter={setAdminReviewRatingFilter}
              reviewsPage={reviewsPage}
              setReviewsPage={setReviewsPage}
              totalReviewsPages={totalReviewsPages}
              handleToggleReviewActive={handleToggleReviewActive}
              setReplyingReview={setReplyingReview}
              setReplyText={setReplyText}
            />
          )}
        </section>

        {/* Footer */}
        <footer className="mt-auto p-margin-desktop pt-6 opacity-60 text-xs">
          <div className="border-t border-outline-variant py-6 flex justify-between items-center">
            <span className="font-label-caps text-label-caps">© 2026 DUOSTYLE GLOBAL MANAGEMENT</span>
            <div className="flex gap-6 font-label-caps text-label-caps">
              <a className="hover:text-primary" href="#">System Status</a>
              <a className="hover:text-primary" href="#">Documentation</a>
            </div>
          </div>
        </footer>
      </main>

      {/* CATEGORY EDIT/CREATE MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <h3 className="font-bold text-base text-primary">
                {catEditId
                  ? 'Chỉnh Sửa Danh Mục'
                  : catEditParentId
                  ? 'Thêm Danh Mục Con Mới'
                  : 'Thêm Danh Mục Gốc Mới'}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Áo Sơ Mi Nam, Vest Nữ..."
                  value={catEditName}
                  onChange={(e) => {
                    setCatEditName(e.target.value);
                    if (!catEditId) setCatEditSlug(generateSlug(e.target.value));
                  }}
                  className="w-full p-2.5 border border-outline-variant rounded focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Đường Dẫn (Slug)</label>
                <input
                  type="text"
                  placeholder="auto-generated-slug"
                  value={catEditSlug}
                  onChange={(e) => setCatEditSlug(e.target.value)}
                  className="w-full p-2.5 border border-outline-variant rounded focus:border-primary focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Đối Tượng Mua Sắm</label>
                <select
                  value={catEditGender}
                  onChange={(e) => setCatEditGender(e.target.value)}
                  className="w-full p-2.5 border border-outline-variant rounded focus:border-primary focus:outline-none bg-white font-medium"
                >
                  <option value="MEN">Nam (MEN)</option>
                  <option value="WOMEN">Nữ (WOMEN)</option>
                  <option value="UNISEX">Unisex (UNISEX)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Danh Mục Cha</label>
                <select
                  value={catEditParentId || ''}
                  onChange={(e) =>
                    setCatEditParentId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full p-2.5 border border-outline-variant rounded focus:border-primary focus:outline-none bg-white font-medium"
                >
                  <option value="">-- Không có (Danh Mục Gốc) --</option>
                  {categoryTree
                    .filter((c) => c.id !== catEditId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.genderTarget})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant font-label-caps uppercase rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white font-label-caps uppercase font-bold rounded hover:bg-secondary transition-colors cursor-pointer"
                >
                  {catEditId ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Order Detail Modal */}
      <OrderDetailModal
        orderCode={selectedOrderCode}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrderCode(null);
        }}
      />

      {/* Admin Banner Add/Edit Modal */}
      {isBannerModalOpen && (
        <AdminBannerModal
          isOpen={isBannerModalOpen}
          onClose={() => setIsBannerModalOpen(false)}
          bannerToEdit={editingBanner}
          onSave={handleSaveBanner}
        />
      )}

      {/* Admin Review Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <div>
                <h3 className="font-bold text-base text-primary">Phản Hồi Đánh Giá Khách Hàng</h3>
                <p className="text-xs text-on-surface-variant">
                  {replyingReview.userFullName} - Product: #{replyingReview.productId}
                </p>
              </div>
              <button
                onClick={() => setReplyingReview(null)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-4 text-xs">
              <div className="bg-surface-container/40 p-3 rounded border border-outline-variant/50">
                <p className="font-bold text-primary mb-1">
                  Nhận xét của KH ({replyingReview.rating}★):
                </p>
                <p className="text-on-surface italic">
                  "{replyingReview.comment || 'Không có nhận xét'}"
                </p>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">
                  Nội dung phản hồi chính thức từ DuoStyle Admin *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Cảm ơn bạn đã tin tưởng và ủng hộ sản phẩm của DuoStyle..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2.5 border border-outline-variant rounded focus:border-primary focus:outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 border border-outline-variant font-label-caps uppercase rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white font-label-caps uppercase font-bold rounded hover:bg-secondary transition-colors cursor-pointer"
                >
                  Lưu Phản Hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
