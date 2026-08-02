import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { createAdminApi } from '../services/adminService';

const adminApi = createAdminApi(api);

export interface BannerData {
  id?: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  displayOrder: number;
  active: boolean;
}

interface AdminBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannerToEdit?: BannerData | null;
  onSave: (banner: BannerData) => Promise<void>;
}

export default function AdminBannerModal({
  isOpen,
  onClose,
  bannerToEdit,
  onSave
}: AdminBannerModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('#products');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [active, setActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bannerToEdit) {
      setTitle(bannerToEdit.title || '');
      setSubtitle(bannerToEdit.subtitle || '');
      setImageUrl(bannerToEdit.imageUrl || '');
      setLinkUrl(bannerToEdit.linkUrl || '#products');
      setDisplayOrder(bannerToEdit.displayOrder ?? 1);
      setActive(bannerToEdit.active ?? true);
    } else {
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setLinkUrl('#products');
      setDisplayOrder(1);
      setActive(true);
    }
    setError('');
  }, [bannerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadedUrl = await adminApi.uploadImage(formData);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Tải ảnh lên Cloudinary thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setError('Vui lòng tải ảnh banner hoặc nhập URL ảnh');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave({
        id: bannerToEdit?.id,
        title,
        subtitle,
        imageUrl,
        linkUrl,
        displayOrder,
        active
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không thể lưu Banner');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-outline-variant w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container/40">
          <h3 className="font-display text-xl font-bold uppercase tracking-wider text-primary">
            {bannerToEdit ? 'Chỉnh Sửa Banner' : 'Thêm Banner Mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-2">
              Hình Ảnh Banner (Cloudinary) *
            </label>
            
            {imageUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-outline-variant bg-black/40 h-44 mb-3 flex items-center justify-center shadow-inner">
                <img
                  src={imageUrl}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-3">
                  <label className="px-4 py-2 bg-white text-black text-xs uppercase font-bold rounded-lg cursor-pointer hover:bg-gray-100 transition-colors shadow">
                    Đổi Ảnh Mới
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface-container/20 hover:bg-surface-container/50 mb-3 h-44">
                {isUploading ? (
                  <div className="flex flex-col items-center text-primary">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-xs uppercase tracking-wider font-semibold">Đang up ảnh lên Cloudinary...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-on-surface-variant">
                    <Upload className="w-8 h-8 mb-2 text-primary/80" />
                    <span className="text-sm font-semibold text-primary mb-1">Click để upload ảnh Banner</span>
                    <span className="text-xs text-on-surface-variant/70">Hỗ trợ JPG, PNG, WEBP (Tự động tải lên Cloudinary)</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}

            {/* Direct Image URL input */}
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Hoặc dán URL ảnh trực tiếp (https://...)"
              className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-primary focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
                Tiêu Đề (Quản lý)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Wavemotion Collection"
                className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-primary focus:outline-none focus:border-primary shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
                Mô Tả / Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="VD: New Arrival - Giảm 40K"
                className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-primary focus:outline-none focus:border-primary shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
                Liên Kết Khi Click (linkUrl)
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="VD: #products hoặc /collection/nam"
                className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-primary focus:outline-none focus:border-primary shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
                Thứ Tự Hiển Thị (displayOrder)
              </label>
              <input
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-primary focus:outline-none focus:border-primary shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="activeToggle"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary cursor-pointer"
            />
            <label htmlFor="activeToggle" className="text-sm font-semibold text-primary cursor-pointer select-none">
              Hiển thị Banner này trên Trang chủ (Active)
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary hover:bg-surface-container/60 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-secondary transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {bannerToEdit ? 'Cập Nhật' : 'Tạo Banner Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
