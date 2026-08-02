import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatVND } from '../components/ProductCard';
import { resolveProfileTabIntent } from '../utils/checkout';
import OrderDetailModal from '../components/OrderDetailModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import Pagination from '../components/Pagination';

export default function ProfilePage({ user, initialTab, autoOpenOrderCode, onNavigate, onLogout, showToast, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState(() => (autoOpenOrderCode ? 'orders' : resolveProfileTabIntent({ profileTab: initialTab })));
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [editingStockProduct, setEditingStockProduct] = useState(null);
  const [newStockValues, setNewStockValues] = useState({});
  const [selectedOrderCode, setSelectedOrderCode] = useState(autoOpenOrderCode || null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(Boolean(autoOpenOrderCode));
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    gender: '',
    address: ''
  });

  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r?.name === 'ROLE_ADMIN') || user?.email?.includes('admin');

  useEffect(() => {
    if (autoOpenOrderCode) {
      setActiveTab('orders');
      setSelectedOrderCode(autoOpenOrderCode);
      setIsDetailModalOpen(true);
    } else {
      setActiveTab(resolveProfileTabIntent({ profileTab: initialTab }));
    }
  }, [initialTab, autoOpenOrderCode]);

  const userProfile = {
    name: user?.fullName || 'Người Dùng',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || '',
    tier: isAdmin ? 'System Administrator' : 'Gold Member',
    initials: user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
  };

  const fetchMyOrders = () => {
    api.get('/orders/my-orders?page=0&size=20')
      .then(res => {
        if (res.data?.data?.content) {
          const apiOrders = res.data.data.content.map(o => ({
            id: o.id,
            orderCode: o.orderCode,
            createdAt: new Date(o.createdAt).toLocaleDateString('vi-VN'),
            status: o.status,
            totalAmount: o.totalAmount
          }));
          setOrders(apiOrders);
        }
      })
      .catch(err => console.log("No orders found"));
  };

  useEffect(() => {
    // Initialize edit form from user data
    setEditForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      address: user?.address || ''
    });

    // Fetch order history initially
    fetchMyOrders();

    // Fetch wishlist
    api.get('/wishlist')
      .then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          const apiWishlist = res.data.data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.categoryName || 'Thời Trang',
            price: p.basePrice,
            image: p.thumbnailUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'
          }));
          setWishlist(apiWishlist);
        }
      })
      .catch(err => console.log("No wishlist items found"));

    // Fetch Inventory data from backend (admin only)
    if (isAdmin) {
      fetchInventory();
    }
  }, [user]);

  // Auto poll order updates every 5s when active tab is orders or profile
  useEffect(() => {
    fetchMyOrders();
    const interval = setInterval(() => {
      fetchMyOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchInventory = () => {
    api.get('/products?size=50')
      .then(res => {
        if (res.data?.data?.content) {
          setInventoryProducts(res.data.data.content);
        }
      })
      .catch(err => console.log("Inventory load error"));
  };

  const removeFromWishlist = (id) => {
    setWishlist(wishlist.filter(item => item.id !== id));
    api.delete(`/wishlist/${id}`).catch(err => console.log("Removed from local wishlist"));
  };

  const handleSignOut = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.log("Logged out session");
    }
    if (onLogout) {
      onLogout();
    } else if (onNavigate) {
      onNavigate('login', '', null, 'Đã đăng xuất tài khoản thành công!');
    }
  };

  const handleOpenStockEdit = (product) => {
    setEditingStockProduct(product);
    const initialStocks = {};
    if (product.variants) {
      product.variants.forEach(v => {
        initialStocks[v.id || v.size] = v.stockQuantity;
      });
    }
    setNewStockValues(initialStocks);
  };

  const handleSaveStock = () => {
    if (!editingStockProduct) return;

    // Send stock updates to backend for each variant
    const variantUpdates = Object.entries(newStockValues).map(([key, val]) => {
      return api.put(`/products/variants/${key}/stock`, { stockQuantity: Number(val) })
        .catch(err => console.log(`Failed to update variant ${key}`));
    });
    Promise.all(variantUpdates).then(() => {
      // Update local state
      setInventoryProducts(prev => prev.map(p => {
        if (p.id === editingStockProduct.id) {
          const updatedVariants = p.variants.map(v => ({
            ...v,
            stockQuantity: Number(newStockValues[v.id || v.size] ?? v.stockQuantity)
          }));
          return { ...p, variants: updatedVariants };
        }
        return p;
      }));
      if (showToast) showToast(`Đã cập nhật tồn kho "${editingStockProduct.name}" thành công!`, 'success');
      setEditingStockProduct(null);
    });
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.put('/auth/profile', editForm);
      if (res.data?.data) {
        // Update parent user state
        if (onUpdateUser) onUpdateUser(res.data.data);
        if (showToast) showToast('Cập nhật thông tin cá nhân thành công!', 'success');
        setIsEditing(false);
      }
    } catch (err) {
      if (showToast) showToast('Lỗi khi cập nhật thông tin!', 'error');
    }
  };

  const triggerToast = (msg, type = 'success') => {
    if (showToast) showToast(msg, type);
  };

  // Tab definitions based on role
  const userTabs = [
    { key: 'profile', label: 'Trang Cá Nhân', icon: 'person' },
    { key: 'orders', label: 'Lịch Sử Đơn Hàng', icon: 'receipt_long' },
    { key: 'wishlist', label: `Yêu Thích (${wishlist.length})`, icon: 'favorite' }
  ];

  const adminTabs = [
    { key: 'profile', label: 'Trang Cá Nhân', icon: 'person' },
    { key: 'inventory', label: 'Quản Lý Tồn Kho (Stock)', icon: 'inventory_2' },
    { key: 'orders', label: 'Lịch Sử Đơn Hàng', icon: 'receipt_long' },
    { key: 'wishlist', label: `Yêu Thích (${wishlist.length})`, icon: 'favorite' }
  ];

  const tabs = isAdmin ? adminTabs : userTabs;

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-12 mt-20 flex flex-col md:flex-row gap-16">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24">
          <div className="mb-10">
            <div className="w-20 h-20 bg-primary mb-4 flex items-center justify-center rounded-lg shadow-sm">
              <span className="text-white font-headline-sm">{userProfile.initials}</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm mb-1">{userProfile.name}</h2>
            <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase font-bold">{userProfile.tier}</p>
          </div>

          <nav className="flex flex-col gap-1">
            {isAdmin && (
              <button 
                onClick={() => onNavigate && onNavigate('admin')}
                className="group flex items-center py-3 px-4 font-label-caps text-label-caps transition-all duration-300 w-full text-left cursor-pointer rounded bg-primary text-white font-bold hover:bg-secondary mb-2 shadow-xs"
              >
                <span className="mr-3 material-symbols-outlined text-[20px]">dashboard</span>
                Mở Admin Dashboard
              </button>
            )}

            {tabs.map(tab => (
              <button 
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`group flex items-center py-3 px-4 font-label-caps text-label-caps transition-all duration-300 w-full text-left cursor-pointer rounded ${
                  activeTab === tab.key 
                    ? 'sidebar-active border-l-4 border-primary bg-primary/5 font-bold text-primary' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
              >
                <span className={`mr-3 material-symbols-outlined text-[20px] ${tab.key === 'inventory' ? 'text-secondary' : ''}`}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-20 pt-8 border-t border-outline-variant">
            <button 
              onClick={handleSignOut}
              className="flex items-center text-error font-label-caps text-label-caps font-bold hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent"
            >
              <span className="mr-2 material-symbols-outlined text-[18px]">logout</span>
              Đăng Xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <section className="flex-grow">
        {/* INVENTORY TAB (Admin Only) */}
        {activeTab === 'inventory' && isAdmin ? (
          <div>
            <div className="flex justify-between items-end pb-6 border-b border-outline-variant mb-8">
              <div>
                <span className="font-label-caps text-label-caps text-secondary mb-2 block uppercase tracking-widest font-bold">QUẢN LÝ TỒN KHO</span>
                <h3 className="font-display-lg text-[40px] leading-tight text-primary">Quản Lý Tồn Kho Theo Size</h3>
              </div>
              <button 
                onClick={fetchInventory}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 font-label-caps text-xs rounded hover:bg-secondary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Cập Nhật Dữ Liệu
              </button>
            </div>

            {/* Inventory List Table */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container/60 border-b border-outline-variant">
                    <th className="p-4 font-label-caps text-xs text-primary font-bold">Sản Phẩm</th>
                    <th className="p-4 font-label-caps text-xs text-primary font-bold">Danh Mục</th>
                    <th className="p-4 font-label-caps text-xs text-primary font-bold">Giá Niêm Yết</th>
                    <th className="p-4 font-label-caps text-xs text-primary font-bold">Tồn Kho Theo Size</th>
                    <th className="p-4 font-label-caps text-xs text-primary font-bold text-center">Trạng Thái</th>
                    <th className="p-4 font-label-caps text-xs text-primary font-bold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {inventoryProducts.map((prod) => {
                    const totalStock = prod.variants ? prod.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0) : 0;
                    const isLow = prod.variants?.some(v => v.stockQuantity > 0 && v.stockQuantity <= 5);
                    const isOut = totalStock === 0;

                    return (
                      <tr key={prod.id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={prod.thumbnailUrl} alt={prod.name} className="w-12 h-14 object-cover rounded bg-surface-container" />
                            <div>
                              <p className="font-body-md font-bold text-primary text-sm">{prod.name}</p>
                              <p className="font-label-caps text-[10px] text-on-surface-variant">ID: #{prod.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-body-md text-xs text-on-surface-variant font-medium">
                          {prod.categoryName || 'Thời Trang'}
                        </td>
                        <td className="p-4 font-body-md text-xs text-primary font-bold">
                          {formatVND(prod.basePrice)}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {prod.variants && prod.variants.length > 0 ? (
                              prod.variants.map((v, idx) => (
                                <span 
                                  key={idx} 
                                  className={`px-2 py-0.5 rounded text-[10px] font-label-caps font-bold border ${
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
                              <span className="text-xs text-on-surface-variant">Chưa tạo variant</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {isOut ? (
                            <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-label-caps font-bold">HẾT HÀNG</span>
                          ) : isLow ? (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-label-caps font-bold">SẮP HẾT</span>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-label-caps font-bold">CÒN HÀNG ({totalStock})</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleOpenStockEdit(prod)}
                            className="bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-secondary transition-colors cursor-pointer font-label-caps"
                          >
                            Sửa Kho
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Stock Edit Modal */}
            {editingStockProduct && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl w-full max-w-md shadow-2xl animate-fadeIn">
                  <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
                    <h4 className="font-headline-sm text-lg font-bold text-primary">Cập Nhật Tồn Kho</h4>
                    <button onClick={() => setEditingStockProduct(null)} className="text-on-surface-variant hover:text-primary cursor-pointer">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  
                  <div className="py-4">
                    <p className="font-body-md text-sm font-bold text-primary mb-1">{editingStockProduct.name}</p>
                    <p className="font-label-caps text-xs text-on-surface-variant mb-4">Điều chỉnh số lượng từng Size trực tiếp:</p>

                    <div className="space-y-3">
                      {editingStockProduct.variants?.map((v) => (
                        <div key={v.id || v.size} className="flex items-center justify-between bg-surface-container/50 p-3 rounded border border-outline-variant/60">
                          <div className="flex items-center gap-2">
                            <span className="font-label-caps font-bold text-primary bg-primary/10 px-2 py-1 rounded text-xs">
                              Size {v.size === 'FREE_SIZE' ? 'FREE' : v.size}
                            </span>
                            {v.color && <span className="text-xs text-on-surface-variant">({v.color})</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-on-surface-variant">Số lượng:</span>
                            <input 
                              type="number"
                              min="0"
                              max="999"
                              value={newStockValues[v.id || v.size] ?? v.stockQuantity}
                              onChange={(e) => setNewStockValues({
                                ...newStockValues,
                                [v.id || v.size]: Number(e.target.value)
                              })}
                              className="w-20 py-1 px-2 border border-outline-variant rounded text-sm text-center font-bold bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                    <button 
                      onClick={() => setEditingStockProduct(null)}
                      className="px-4 py-2 border border-outline-variant text-xs font-label-caps uppercase rounded hover:bg-surface-container cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={handleSaveStock}
                      className="px-5 py-2 bg-primary text-white text-xs font-label-caps uppercase rounded font-bold hover:bg-secondary transition-colors cursor-pointer"
                    >
                      Lưu Số Lượng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'wishlist' ? (
          <div>
            <div className="flex justify-between items-end pb-6 border-b border-outline-variant mb-8">
              <div>
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">SẢN PHẨM ĐÃ LƯU</span>
                <h3 className="font-display-lg text-[48px] leading-tight text-primary">Danh Sách Yêu Thích</h3>
              </div>
              <p className="font-body-md text-on-surface-variant">{wishlist.length} sản phẩm</p>
            </div>

            {wishlist.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">favorite_border</span>
                <p className="font-body-md text-on-surface-variant">Chưa có sản phẩm yêu thích nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <div key={item.id} className="bg-surface-container border border-outline-variant p-4 relative group">
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-error transition-all z-10 cursor-pointer shadow-sm"
                      title="Xóa khỏi yêu thích"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>

                    <div className="aspect-[4/5] overflow-hidden mb-4 bg-surface-container-low">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">{item.category}</p>
                    <h4 className="font-body-md font-medium text-primary mb-2">{item.name}</h4>
                    <p className="font-label-caps text-primary font-bold mb-4">{formatVND(item.price)}</p>

                    <button 
                      onClick={() => onNavigate?.('product-detail', '', item.id)}
                      className="w-full bg-primary text-on-primary py-3 font-label-caps text-label-caps tracking-widest uppercase hover:bg-secondary transition-colors cursor-pointer"
                    >
                      Xem & Chọn Phiên Bản
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'orders' ? (
          <div>
            <div className="flex justify-between items-end pb-6 border-b border-outline-variant mb-8">
              <div>
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">LỊCH SỬ MUA HÀNG</span>
                <h3 className="font-display-lg text-[48px] leading-tight text-primary">Đơn Hàng Của Bạn</h3>
              </div>
              <p className="font-body-md text-on-surface-variant">{orders.length} đơn hàng</p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">shopping_bag</span>
                <p className="font-body-md text-on-surface-variant">Bạn chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-4 font-label-caps text-label-caps text-on-surface-variant">Mã Đơn Hàng</th>
                        <th className="py-4 font-label-caps text-label-caps text-on-surface-variant">Ngày Đặt</th>
                        <th className="py-4 font-label-caps text-label-caps text-on-surface-variant">Trạng Thái</th>
                        <th className="py-4 font-label-caps text-label-caps text-on-surface-variant text-right">Tổng Tiền</th>
                        <th className="py-4 font-label-caps text-label-caps text-on-surface-variant text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {orders.slice((ordersPage - 1) * 5, ordersPage * 5).map((order) => (
                        <tr key={order.id} className="order-row-hover transition-colors hover:bg-black/5">
                          <td className="py-6 font-body-md font-medium text-primary">#{order.orderCode}</td>
                          <td className="py-6 font-body-md text-on-surface-variant">{order.createdAt}</td>
                          <td className="py-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                order.status === 'SHIPPED' ? 'bg-secondary' : order.status === 'DELIVERED' ? 'bg-outline' : 'bg-primary animate-pulse'
                              }`} />
                              <span className="font-label-caps text-[10px] tracking-widest text-primary uppercase">{order.status}</span>
                            </div>
                          </td>
                          <td className="py-6 text-right font-body-md text-primary font-bold">{formatVND(order.totalAmount)}</td>
                          <td className="py-6 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrderCode(order.orderCode);
                                setIsDetailModalOpen(true);
                              }}
                              className="bg-primary text-white text-xs px-3.5 py-1.5 rounded hover:bg-secondary transition-colors cursor-pointer font-label-caps font-bold"
                            >
                              Xem Chi Tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={ordersPage}
                  totalPages={Math.ceil(orders.length / 5) || 1}
                  totalItems={orders.length}
                  onPageChange={(p) => setOrdersPage(p)}
                />
              </div>
            )}
          </div>
        ) : (
          /* PROFILE TAB */
          <div>
            <div className="mb-12">
              <div className="flex justify-between items-end pb-6 border-b border-outline-variant">
                <div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">THÔNG TIN CÁ NHÂN</span>
                  <h3 className="font-display-lg text-[48px] leading-tight text-primary">Trang Cá Nhân</h3>
                </div>
                <div className="text-right">
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 font-label-caps text-xs rounded hover:bg-secondary transition-colors cursor-pointer font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Chỉnh Sửa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2.5 border border-outline-variant text-xs font-label-caps uppercase rounded hover:bg-surface-container cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button 
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 font-label-caps text-xs rounded hover:bg-secondary transition-colors cursor-pointer font-bold"
                      >
                        <span className="material-symbols-outlined text-sm">save</span>
                        Lưu Thay Đổi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Basic Info */}
              <div className="bg-surface-container p-8 rounded-lg border border-outline-variant/60">
                <h4 className="font-label-caps text-xs text-secondary font-bold mb-6 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Thông Tin Cơ Bản
                </h4>
                <div className="space-y-5">
                  <div>
                    <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1.5 uppercase tracking-wider">Họ Và Tên</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full border border-outline-variant px-4 py-3 rounded text-sm font-medium bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    ) : (
                      <p className="font-body-md text-primary font-medium text-lg">{userProfile.name || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1.5 uppercase tracking-wider">Email</label>
                    <p className="font-body-md text-primary font-medium text-lg">{userProfile.email}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Email không thể thay đổi</p>
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1.5 uppercase tracking-wider">Số Điện Thoại</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        placeholder="Ví dụ: 0901234567"
                        className="w-full border border-outline-variant px-4 py-3 rounded text-sm font-medium bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    ) : (
                      <p className="font-body-md text-primary font-medium text-lg">{userProfile.phone || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1.5 uppercase tracking-wider">Giới Tính</label>
                    {isEditing ? (
                      <select 
                        value={editForm.gender}
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                        className="w-full border border-outline-variant px-4 py-3 rounded text-sm font-medium bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    ) : (
                      <p className="font-body-md text-primary font-medium text-lg">
                        {userProfile.gender === 'MALE' ? 'Nam' : userProfile.gender === 'FEMALE' ? 'Nữ' : userProfile.gender === 'OTHER' ? 'Khác' : '—'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-surface-container p-8 rounded-lg border border-outline-variant/60">
                <h4 className="font-label-caps text-xs text-secondary font-bold mb-6 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Địa Chỉ Nhận Hàng
                </h4>
                <div className="space-y-5">
                  <div>
                    <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1.5 uppercase tracking-wider">Địa Chỉ Giao Hàng Mặc Định</label>
                    {isEditing ? (
                      <textarea 
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        rows={4}
                        className="w-full border border-outline-variant px-4 py-3 rounded text-sm font-medium bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                      />
                    ) : (
                      <div className="bg-surface-container-low p-5 rounded border border-outline-variant/40">
                        {userProfile.address ? (
                          <p className="font-body-md text-primary font-medium leading-relaxed">{userProfile.address}</p>
                        ) : (
                          <div className="text-center py-4">
                            <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">add_location</span>
                            <p className="text-sm text-on-surface-variant">Chưa có địa chỉ nhận hàng</p>
                            <button 
                              onClick={() => setIsEditing(true)}
                              className="mt-3 text-xs font-label-caps text-primary font-bold underline underline-offset-4 cursor-pointer"
                            >
                              Thêm Địa Chỉ Ngay
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                <div className="mt-8 pt-6 border-t border-outline-variant/40">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-label-caps text-xs text-on-surface-variant font-bold uppercase tracking-widest">Thông Tin Tài Khoản</h4>
                    <button
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-label-caps text-primary font-bold hover:text-secondary transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                      Đổi Mật Khẩu
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant">Hạng Thành Viên</span>
                      <span className="text-xs font-bold text-secondary">{userProfile.tier}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant">Vai Trò</span>
                      <span className="text-xs font-bold text-primary">{isAdmin ? 'Quản Trị Viên' : 'Người Dùng'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant">Đơn Hàng</span>
                      <span className="text-xs font-bold text-primary">{orders.length} đơn</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant">Yêu Thích</span>
                      <span className="text-xs font-bold text-primary">{wishlist.length} sản phẩm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            {orders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-headline-sm text-headline-sm">Đơn Hàng Gần Đây</h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="font-label-caps text-label-caps text-secondary hover:underline transition-all cursor-pointer border-none bg-transparent"
                  >
                    Xem Tất Cả Đơn Hàng
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-4 font-label-caps text-label-caps text-on-surface-variant">Mã Đơn Hàng</th>
                        <th className="py-4 font-label-caps text-label-caps text-on-surface-variant">Ngày Đặt</th>
                        <th className="py-4 font-label-caps text-label-caps text-on-surface-variant">Trạng Thái</th>
                        <th className="py-4 font-label-caps text-label-caps text-on-surface-variant text-right">Tổng Tiền</th>
                        <th className="py-4 font-label-caps text-label-caps text-on-surface-variant text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {orders.slice(0, 3).map((order) => (
                        <tr key={order.id} className="order-row-hover transition-colors hover:bg-black/5">
                          <td className="py-6 font-body-md font-medium text-primary">#{order.orderCode}</td>
                          <td className="py-6 font-body-md text-on-surface-variant">{order.createdAt}</td>
                          <td className="py-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                order.status === 'SHIPPED' ? 'bg-secondary' : order.status === 'DELIVERED' ? 'bg-outline' : 'bg-primary animate-pulse'
                              }`} />
                              <span className="font-label-caps text-[10px] tracking-widest text-primary uppercase">{order.status}</span>
                            </div>
                          </td>
                          <td className="py-6 text-right font-body-md text-primary font-bold">{formatVND(order.totalAmount)}</td>
                          <td className="py-6 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrderCode(order.orderCode);
                                setIsDetailModalOpen(true);
                              }}
                              className="bg-primary text-white text-xs px-3.5 py-1.5 rounded hover:bg-secondary transition-colors cursor-pointer font-label-caps font-bold"
                            >
                              Xem Chi Tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Order Detail Modal */}
      <OrderDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        orderCode={selectedOrderCode}
        showToast={showToast}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        showToast={showToast}
      />
    </main>
  );
}
