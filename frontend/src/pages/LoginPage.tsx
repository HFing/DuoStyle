import React, { useState } from 'react';
import api from '../api/axios';
import ToastNotification from '../components/ToastNotification';
import { getGoogleAuthorizationUrl } from '../utils/google-auth';

export default function LoginPage({ onNavigate, onLoginSuccess, initialMessage, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState(initialMessage || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      setLoading(false);
      if (response.data?.data) {
        const userData = response.data.data;
        await onLoginSuccess?.(userData);
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        const msg = err.response.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu!';
        setErrorMsg(msg);
      } else {
        setErrorMsg('Không thể kết nối đến máy chủ Backend (Spring Boot chưa được khởi chạy). Vui lòng kiểm tra lại!');
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.assign(getGoogleAuthorizationUrl());
  };

  return (
    <main className="min-h-screen flex bg-surface-container-lowest pt-20">
      {/* Toast Notification for instant transition from Registration */}
      <ToastNotification
        message={successToast}
        type="success"
        onClose={() => setSuccessToast('')}
        duration={5000}
      />

      {/* Editorial Image Side */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 z-10 bg-primary/10 mix-blend-overlay" />
        <img
          className="w-full h-full object-cover grayscale brightness-90 transition-transform duration-[3000ms] hover:scale-105"
          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=90"
          alt="DuoStyle Luxury Fashion"
        />
        <div className="absolute bottom-12 left-12 z-20">
          <span className="font-label-caps text-label-caps text-white uppercase tracking-widest opacity-80 mb-2 block">
            Bộ Sưu Tập Mới
          </span>
          <h2 className="font-display-lg text-display-lg text-white max-w-md leading-tight">
            Định Hình Phong Cách Thời Trang Hiện Đại
          </h2>
        </div>
      </div>

      {/* Login Form Side */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 lg:p-16 bg-surface-container-lowest">
        <div className="w-full max-w-md space-y-12">
          {/* Brand Identity */}
          <div className="text-center md:text-left">
            <h1 className="font-headline-md text-headline-md text-primary tracking-tighter mb-4">DuoStyle</h1>
            <p className="font-body-md text-on-surface-variant max-w-xs">
              Chào mừng bạn quay trở lại. Vui lòng đăng nhập để trải nghiệm không gian mua sắm cao cấp.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-error-container text-on-error-container p-4 font-label-caps text-label-caps border border-error/20 rounded font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="relative group">
                <label
                  className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-2 block transition-all group-focus-within:text-primary font-bold"
                  htmlFor="email"
                >
                  Địa Chỉ Email
                </label>
                <input
                  className="w-full py-3 bg-transparent border-b border-outline-variant focus:border-primary focus:outline-none font-body-md text-primary placeholder:text-outline-variant transition-colors"
                  id="email"
                  type="email"
                  placeholder="name@duostyle.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <div className="flex justify-between items-end mb-2">
                  <label
                    className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant transition-all group-focus-within:text-primary font-bold"
                    htmlFor="password"
                  >
                    Mật Khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast && showToast("Liên kết khôi phục mật khẩu sẽ được gửi đến email của bạn.", "success")}
                    className="font-label-caps text-label-caps text-outline hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                  >
                    Quên Mật Khẩu?
                  </button>
                </div>
                <div className="relative">
                  <input
                    className="w-full py-3 bg-transparent border-b border-outline-variant focus:border-primary focus:outline-none font-body-md text-primary placeholder:text-outline-variant transition-colors"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-3 text-on-surface-variant hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-[0.2em] font-bold active:scale-[0.98] transition-all hover:bg-secondary cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3 rounded"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>ĐANG ĐĂNG NHẬP...</span>
                  </>
                ) : (
                  'Đăng Nhập'
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white border border-outline-variant hover:border-primary font-label-caps text-label-caps text-primary tracking-wider font-bold transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xs hover:shadow-md rounded"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>ĐĂNG NHẬP VỚI GOOGLE</span>
              </button>

              <div className="flex items-center gap-4 py-1">
                <div className="h-[1px] flex-1 bg-outline-variant" />
                <span className="font-label-caps text-label-caps text-outline-variant">HOẶC</span>
                <div className="h-[1px] flex-1 bg-outline-variant" />
              </div>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('register')}
                className="w-full py-4 border border-primary text-primary font-label-caps text-label-caps uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer font-bold rounded"
              >
                Tạo Tài Khoản Mới
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="pt-12 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 opacity-50">
            <a className="font-label-caps text-[10px] uppercase tracking-widest hover:opacity-100 transition-opacity" href="#">Phát Triển Bền Vững</a>
            <a className="font-label-caps text-[10px] uppercase tracking-widest hover:opacity-100 transition-opacity" href="#">Bảo Mật</a>
            <a className="font-label-caps text-[10px] uppercase tracking-widest hover:opacity-100 transition-opacity" href="#">Điều Khoản</a>
            <a className="font-label-caps text-[10px] uppercase tracking-widest hover:opacity-100 transition-opacity" href="#">Liên Hệ</a>
          </div>
        </div>
      </div>
    </main>
  );
}
