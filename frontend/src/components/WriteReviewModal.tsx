import React, { useState } from 'react';
import api from '../api/axios';

export default function WriteReviewModal({ isOpen, onClose, product, orderId, onSuccess, showToast }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.data) {
        setImageUrl(response.data.data);
        showToast?.('Đã tải ảnh nhận xét lên Cloudinary!', 'success');
      }
    } catch {
      showToast?.('Không thể tải ảnh lên. Vui lòng thử lại!', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      showToast?.('Vui lòng chọn số sao đánh giá (1 - 5 sao)!', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        productId: product.id,
        orderId: orderId || null,
        rating,
        comment,
        imageUrl,
      });
      showToast?.('Gửi đánh giá sản phẩm thành công!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-surface-container hover:bg-outline-variant/40 flex items-center justify-center text-primary transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <h3 className="font-headline-sm text-xl font-bold text-primary mb-2">Đánh Giá Sản Phẩm</h3>
        <p className="text-xs text-on-surface-variant mb-6 font-medium">Chia sẻ trải nghiệm thực tế của bạn với DuoStyle</p>

        {/* Product Preview Card */}
        <div className="flex items-center gap-4 p-3 bg-surface-container/40 rounded-lg border border-outline-variant/40 mb-6">
          <div className="w-14 h-16 rounded overflow-hidden bg-surface-container flex-shrink-0">
            <img src={product.thumbnailUrl || product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-primary truncate">{product.name}</h4>
            <p className="text-xs text-on-surface-variant font-label-caps uppercase">{product.categoryName || product.category || 'Thời Trang DuoStyle'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-primary uppercase font-label-caps tracking-wider mb-2">
              Chấm Điểm Sản Phẩm *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-3xl ${isFilled ? 'text-amber-400 fill-1' : 'text-gray-300'}`}>
                      star
                    </span>
                  </button>
                );
              })}
              <span className="ml-2 font-bold text-sm text-amber-600 font-label-caps">
                {rating === 5 ? 'Rất tuyệt vời (5★)' : rating === 4 ? 'Hài lòng (4★)' : rating === 3 ? 'Bình thường (3★)' : rating === 2 ? 'Không hài lòng (2★)' : 'Rất tệ (1★)'}
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="block text-xs font-bold text-primary uppercase font-label-caps tracking-wider mb-1.5">
              Nội Dung Nhận Xét
            </label>
            <textarea
              rows={4}
              placeholder="Hãy chia sẻ cảm nhận về chất liệu, phom dáng và trải nghiệm mặc thực tế..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 text-xs border border-outline-variant rounded-lg focus:border-primary focus:outline-none bg-surface"
            ></textarea>
          </div>

          {/* Cloudinary Image Upload */}
          <div>
            <label className="block text-xs font-bold text-primary uppercase font-label-caps tracking-wider mb-1.5">
              Hình Ảnh Thực Tế (Tùy chọn)
            </label>
            {imageUrl ? (
              <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-outline-variant group">
                <img src={imageUrl} alt="Review attachment" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-outline-variant rounded-lg hover:bg-surface-container cursor-pointer transition-colors text-xs text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-sm">add_a_photo</span>
                <span>{uploading ? 'Đang tải lên Cloudinary...' : 'Tải Ảnh Thực Tế'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-label-caps uppercase font-bold text-on-surface-variant hover:bg-surface-container rounded transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary text-white text-xs font-label-caps uppercase font-bold rounded hover:bg-secondary transition-colors shadow-md disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
