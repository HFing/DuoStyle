import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Cảm ơn bạn đã đăng ký nhận bản tin DuoStyle với email: ${email}! Mã giảm giá 10% đã gửi tới hòm thư của bạn.`);
    setEmail('');
  };

  return (
    <section className="py-section-gap border-t border-outline-variant/30">
      <div className="max-w-container-max mx-auto px-margin-desktop text-center">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-6 italic uppercase">Gia Nhập Cộng Đồng DuoStyle</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-12 max-w-lg mx-auto leading-relaxed">
          Đăng ký ngay để nhận quyền truy cập sớm nhất vào các bộ sưu tập mới, câu chuyện thương hiệu và ưu đãi độc quyền 10%.
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col md:flex-row gap-4 items-center">
          <input 
            className="w-full bg-transparent border-none border-b border-outline focus:ring-0 focus:border-primary font-label-caps text-label-caps py-4 transition-all uppercase tracking-widest text-center md:text-left" 
            placeholder="NHẬP ĐỊA CHỈ EMAIL CỦA BẠN" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button 
            className="w-full md:w-auto bg-primary text-on-primary font-label-caps text-label-caps px-12 py-4 uppercase tracking-widest border border-primary hover:bg-white hover:text-black transition-all duration-300 cursor-pointer font-bold" 
            type="submit"
          >
            Đăng Ký
          </button>
        </form>
      </div>
    </section>
  );
}
