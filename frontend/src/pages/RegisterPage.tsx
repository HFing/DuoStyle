import React, { useState } from 'react';
import api from '../api/axios';
import { getGoogleAuthorizationUrl } from '../utils/google-auth';

export default function RegisterPage({ onNavigate }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    if (!terms) {
      setErrorMsg('Bạn cần đồng ý với Điều khoản & Điều kiện dịch vụ.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        fullName,
        email,
        password
      });

      setLoading(false);
      if (response.data) {
        // Chuyển trang lập tức tới trang Đăng nhập theo yêu cầu của bạn!
        if (onNavigate) onNavigate('login', '', null, 'Tạo tài khoản thành công! Vui lòng đăng nhập bằng tài khoản mới của bạn.');
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        // Lấy thông báo tiếng Việt trực tiếp từ backend (Ví dụ: "Địa chỉ Email này đã được sử dụng...")
        const msg = err.response.data?.message || 'Đăng ký thất bại. Email này có thể đã được sử dụng!';
        setErrorMsg(msg);
      } else {
        setErrorMsg('Không thể kết nối đến máy chủ Backend (Spring Boot chưa được khởi chạy hoặc bị lỗi mạng). Vui lòng thử lại!');
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface pt-20">
      {/* Left Side: Editorial Content */}
      <section className="relative w-full md:w-1/2 lg:w-3/5 h-[40vh] md:h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center scale-105 hover:scale-100 transition-transform duration-[3000ms] ease-out"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=90')` }}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between p-margin-mobile md:p-margin-desktop text-on-primary">
          <div>
            <h1 className="font-headline-md text-headline-md tracking-tighter drop-shadow-md">DuoStyle</h1>
          </div>
          <div className="max-w-md">
            <p className="font-label-caps text-label-caps uppercase mb-4 opacity-80 drop-shadow">Bộ Sưu Tập 2026</p>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-tight mb-6 drop-shadow-md">
              Định Hình Phong Cách Thời Trang Hiện Đại.
            </h2>
            <p className="font-body-lg text-body-lg opacity-90 drop-shadow">
              Tham gia cộng đồng thời trang độc quyền DuoStyle để nhận trải nghiệm mua sắm tinh tế nhất.
            </p>
          </div>
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <section className="w-full md:w-1/2 lg:w-2/5 min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <header className="mb-12">
            <h3 className="font-headline-md text-headline-md mb-2">Tạo Tài Khoản</h3>
            <p className="font-body-md text-on-surface-variant">Nhập thông tin cá nhân của bạn để bắt đầu trải nghiệm DuoStyle.</p>
          </header>

          {errorMsg && (
            <div className="bg-error-container text-on-error-container p-4 font-label-caps text-label-caps mb-6 border border-error/20 rounded font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name */}
            <div className="relative group">
              <label
                className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-2 transition-colors group-focus-within:text-primary font-bold"
                htmlFor="fullName"
              >
                Họ Và Tên
              </label>
              <input
                className="w-full bg-transparent border-b border-outline-variant py-3 font-body-md focus:border-primary focus:outline-none transition-all duration-300 placeholder:opacity-40"
                id="fullName"
                type="text"
                placeholder="Full Nam"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <label
                className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-2 transition-colors group-focus-within:text-primary font-bold"
                htmlFor="email"
              >
                Địa Chỉ Email
              </label>
              <input
                className="w-full bg-transparent border-b border-outline-variant py-3 font-body-md focus:border-primary focus:outline-none transition-all duration-300 placeholder:opacity-40"
                id="email"
                type="email"
                placeholder="name@duostyle.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <label
                  className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-2 transition-colors group-focus-within:text-primary font-bold"
                  htmlFor="password"
                >
                  Mật Khẩu
                </label>
                <input
                  className="w-full bg-transparent border-b border-outline-variant py-3 font-body-md focus:border-primary focus:outline-none transition-all duration-300 placeholder:opacity-40"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <label
                  className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-2 transition-colors group-focus-within:text-primary font-bold"
                  htmlFor="confirmPassword"
                >
                  Xác Nhận Mật Khẩu
                </label>
                <input
                  className="w-full bg-transparent border-b border-outline-variant py-3 font-body-md focus:border-primary focus:outline-none transition-all duration-300 placeholder:opacity-40"
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    id="newsletter"
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="h-4 w-4 rounded-none border-outline text-primary focus:ring-0 cursor-pointer"
                  />
                </div>
                <label className="font-body-md text-on-surface-variant cursor-pointer select-none text-sm" htmlFor="newsletter">
                  Đăng ký nhận bản tin thời trang độc quyền và các bộ sưu tập mới nhất.
                </label>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    className="h-4 w-4 rounded-none border-outline text-primary focus:ring-0 cursor-pointer"
                    required
                  />
                </div>
                <label className="font-body-md text-on-surface-variant cursor-pointer select-none text-sm" htmlFor="terms">
                  Tôi đồng ý với <a className="text-primary underline underline-offset-4 hover:opacity-70 transition-opacity font-bold" href="#">Điều Khoản Dịch Vụ</a> & <a className="text-primary underline underline-offset-4 hover:opacity-70 transition-opacity font-bold" href="#">Chính Sách Bảo Mật</a>.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-label-caps text-label-caps uppercase py-4 tracking-widest hover:bg-secondary active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50 font-bold flex items-center justify-center gap-3 rounded"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>ĐANG TẠO TÀI KHOẢN...</span>
                  </>
                ) : (
                  'Đăng Ký Tài Khoản'
                )}
              </button>

              <button
                type="button"
                onClick={() => window.location.assign(getGoogleAuthorizationUrl())}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white border border-outline-variant hover:border-primary font-label-caps text-label-caps text-primary tracking-wider font-bold transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xs hover:shadow-md rounded"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>ĐĂNG KÝ / ĐĂNG NHẬP BẰNG GOOGLE</span>
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <footer className="mt-12 pt-8 border-t border-outline-variant flex flex-col items-center gap-4">
            <p className="font-body-md text-on-surface-variant">Bạn đã có tài khoản?</p>
            <button
              onClick={() => onNavigate && onNavigate('login')}
              className="flex items-center gap-2 group cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest border-b border-transparent group-hover:border-primary transition-all font-bold">
                Quay Lại Đăng Nhập
              </span>
            </button>
          </footer>
        </div>
      </section>
    </main>
  );
}
