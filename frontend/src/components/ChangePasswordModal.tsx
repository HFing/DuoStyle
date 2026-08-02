import React, { useState } from 'react';
import api from '../api/axios';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function ChangePasswordModal({ isOpen, onClose, showToast }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });

      showToast('Đổi mật khẩu thành công!', 'success');
      handleClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">lock_reset</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-lg font-bold text-primary">Đổi Mật Khẩu</h3>
              <p className="font-body-md text-xs text-on-surface-variant">Bảo mật tài khoản DuoStyle của bạn</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-1 rounded-full hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1.5 uppercase tracking-wider font-bold">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full border border-outline-variant px-4 py-3 pr-10 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  {showCurrentPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1.5 uppercase tracking-wider font-bold">
              Mật khẩu mới (Tối thiểu 6 ký tự)
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full border border-outline-variant px-4 py-3 pr-10 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  {showNewPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="font-label-caps text-[10px] text-on-surface-variant block mb-1.5 uppercase tracking-wider font-bold">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full border border-outline-variant px-4 py-3 pr-10 rounded-lg text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 border border-outline-variant text-xs font-label-caps uppercase rounded-lg hover:bg-surface-container transition-colors cursor-pointer font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-label-caps uppercase rounded-lg font-bold hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">lock_reset</span>
                  Cập Nhật Mật Khẩu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
