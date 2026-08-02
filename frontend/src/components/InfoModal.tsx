import { useState, useEffect } from 'react';
import { X, HelpCircle, Truck, RefreshCw, Mail, ShieldCheck, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

export type InfoModalTab = 'help' | 'shipping' | 'returns' | 'newsletter' | 'terms' | 'privacy' | 'story';

interface InfoModalProps {
  isOpen: boolean;
  activeTab: InfoModalTab | null;
  onClose: () => void;
  showToast?: (msg: string, type?: string) => void;
}

export default function InfoModal({ isOpen, activeTab, onClose, showToast }: InfoModalProps) {
  const [currentTab, setCurrentTab] = useState<InfoModalTab>('help');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      if (showToast) showToast('Vui lòng nhập địa chỉ Email hợp lệ!', 'error');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (showToast) showToast('Đăng ký nhận bản tin DuoStyle thành công! Mã giảm giá 10% đã gửi tới Email của bạn.', 'success');
      setNewsletterEmail('');
    }, 600);
  };

  const navItems: { id: InfoModalTab; label: string; icon: any }[] = [
    { id: 'story', label: 'Our Story', icon: Sparkles },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'returns', label: 'Returns', icon: RefreshCw },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'terms', label: 'Terms', icon: FileText },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-outline-variant w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container/30">
          <div className="flex items-center gap-3">
            <span className="font-headline-sm text-xl font-bold uppercase tracking-tighter text-primary">DuoStyle</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold uppercase tracking-wider">
              Information & Policies
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Sidebar and Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 bg-surface-container/20 border-r border-outline-variant/60 p-4 space-y-1 overflow-y-auto shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content View Area */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white space-y-6 text-on-surface">
            {/* TAB: STORY */}
            {currentTab === 'story' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/40 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">Our Philosophy</span>
                  <h3 className="font-headline-md text-2xl font-bold text-primary">Triết Lý Của Chúng Tôi</h3>
                </div>
                <div className="p-5 bg-surface-container/30 border border-outline-variant/40 rounded-xl space-y-3">
                  <h4 className="font-bold text-lg text-primary italic">"Khai mở không gian giao thoa giữa chất liệu và tâm hồn."</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    DuoStyle được sáng lập dựa trên triết lý <span className="font-semibold text-primary font-mono text-xs">"sang trọng tinh giản" (reductive luxury)</span>. Chúng tôi tin rằng sự thanh lịch đích thực không nằm ở sự phô trương hay dư thừa, mà hiện hữu trong sự tỉ mỉ của phom dáng, chất lượng hảo hạng của từng sợi vải và sự đồng điệu đầy tĩnh lặng. Mỗi thiết kế là một minh chứng cho bàn tay tài hoa của người thợ thủ công và góc nhìn tầm vóc của nhà thiết kế.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 border border-outline-variant/40 rounded-xl bg-surface-container/10">
                    <p className="font-bold text-sm text-primary mb-1">Tinh Tế Trên Từng Đường Kim</p>
                    <p className="text-xs text-on-surface-variant/80">Tất cả sản phẩm đều trải qua 40 bước kiểm duyệt chất lượng khắt khe.</p>
                  </div>
                  <div className="p-4 border border-outline-variant/40 rounded-xl bg-surface-container/10">
                    <p className="font-bold text-sm text-primary mb-1">Sợi Vải Hữu Cơ Cao Cấp</p>
                    <p className="text-xs text-on-surface-variant/80">Sử dụng Cotton Supima, Linen tự nhiên và vải dệt kháng khuẩn thoáng khí.</p>
                  </div>
                  <div className="p-4 border border-outline-variant/40 rounded-xl bg-surface-container/10">
                    <p className="font-bold text-sm text-primary mb-1">Thiết Kế Vượt Thời Gian</p>
                    <p className="text-xs text-on-surface-variant/80">Kiểu dáng tối giản Quiet Luxury phù hợp cho mọi sự kiện sang trọng.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: HELP */}
            {currentTab === 'help' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/40 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">Customer Support</span>
                  <h3 className="font-headline-md text-2xl font-bold text-primary">Trung Tâm Trợ Giúp & Hướng Dẫn</h3>
                </div>
                <div className="space-y-4 text-sm text-on-surface-variant">
                  <div className="border border-outline-variant/40 rounded-xl p-4 space-y-2">
                    <p className="font-bold text-primary text-base">1. Hướng dẫn chọn Size sản phẩm chuẩn xác</p>
                    <p className="text-xs leading-relaxed">
                      DuoStyle cung cấp bảng thông số Size chuẩn người Việt (S, M, L, XL, FREE_SIZE). Bạn có thể bấm vào mục <strong>"Bảng Thông Số Size"</strong> tại trang chi tiết từng sản phẩm hoặc liên hệ CSKH để được tư vấn chiều cao - cân nặng.
                    </p>
                  </div>
                  <div className="border border-outline-variant/40 rounded-xl p-4 space-y-2">
                    <p className="font-bold text-primary text-base">2. Hướng dẫn Đặt hàng & Thanh toán</p>
                    <ul className="text-xs space-y-1.5 list-disc pl-5">
                      <li>Chọn sản phẩm ➔ Chọn Màu sắc, Size ➔ Bấm <strong>Thêm vào giỏ hàng</strong>.</li>
                      <li>Vào Giỏ hàng ➔ Kiểm tra danh mục & Nhập mã Voucher giảm giá (nếu có).</li>
                      <li>Bấm <strong>Thanh toán</strong> ➔ Điền địa chỉ giao nhận ➔ Chọn phương thức thanh toán (COD hoặc VNPAY / Chuyển khoản QR).</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-emerald-900 text-sm">Cần hỗ trợ trực tiếp từ nhân viên?</p>
                      <p className="text-xs text-emerald-700">Tổng đài hỗ trợ DuoStyle hoạt động từ 8h00 - 22h00 hàng ngày.</p>
                    </div>
                    <span className="font-bold text-primary font-mono text-sm px-4 py-2 bg-white rounded-lg border border-emerald-200 shadow-2xs">
                      Hotline: 0988 888 888
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SHIPPING */}
            {currentTab === 'shipping' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/40 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">Delivery Policy</span>
                  <h3 className="font-headline-md text-2xl font-bold text-primary">Chính Sách Giao Hàng & Vận Chuyển</h3>
                </div>
                <div className="space-y-4 text-sm text-on-surface-variant">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border border-outline-variant/40 rounded-xl bg-surface-container/10">
                      <p className="font-bold text-primary mb-1">Giao Hàng Hỏa Tốc (2H)</p>
                      <p className="text-xs">Áp dụng tại nội thành TP. Hồ Chí Minh và Hà Nội. Nhận hàng ngay trong ngày sau khi chốt đơn.</p>
                    </div>
                    <div className="p-4 border border-outline-variant/40 rounded-xl bg-surface-container/10">
                      <p className="font-bold text-primary mb-1">Giao Hàng Tiêu Chuẩn</p>
                      <p className="text-xs">Từ 2 - 4 ngày làm việc đối với các tỉnh thành còn lại trên toàn quốc.</p>
                    </div>
                  </div>
                  <div className="p-4 border border-outline-variant/40 rounded-xl space-y-2">
                    <p className="font-bold text-primary">Biểu Phí Vận Chuyển & Ưu Đãi:</p>
                    <ul className="text-xs space-y-2">
                      <li className="flex items-center gap-2 text-emerald-800 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <strong>MIỄN PHÍ VẬN CHUYỂN</strong> cho tất cả đơn hàng từ 499.000đ.
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Đơn hàng dưới 499.000đ: Đồng giá phí ship 30.000đ toàn quốc.
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Khách hàng được quyền <strong>ĐỒNG KIỂM</strong> (kiểm tra sản phẩm trước khi thanh toán tiền cho shipper).
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RETURNS */}
            {currentTab === 'returns' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/40 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">Return & Refund</span>
                  <h3 className="font-headline-md text-2xl font-bold text-primary">Chính Sách Đổi Trả Miễn Phí 30 Ngày</h3>
                </div>
                <div className="space-y-4 text-sm text-on-surface-variant">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <p className="font-bold text-amber-900 text-sm">Đổi trả tận nhà miễn phí 100%</p>
                    <p className="text-xs text-amber-800">
                      DuoStyle hỗ trợ nhân viên đến lấy hàng tận nhà để đổi Size hoặc đổi Mẫu mới cho bạn trong vòng 30 ngày kể từ ngày nhận hàng.
                    </p>
                  </div>
                  <div className="border border-outline-variant/40 rounded-xl p-4 space-y-3">
                    <p className="font-bold text-primary">Điều kiện đổi trả sản phẩm:</p>
                    <ul className="text-xs space-y-2 list-disc pl-5">
                      <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng, chưa qua giặt tẩy.</li>
                      <li>Sản phẩm bị lỗi sản xuất, giao nhầm Size hoặc nhầm Màu sắc.</li>
                      <li>Hoàn tiền 100% nếu khách hàng không hài lòng về chất lượng sản phẩm trong vòng 7 ngày đầu.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NEWSLETTER */}
            {currentTab === 'newsletter' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/40 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">Exclusive Offers</span>
                  <h3 className="font-headline-md text-2xl font-bold text-primary">Đăng Ký Nhận Bản Tin DuoStyle</h3>
                </div>
                <div className="space-y-5 text-sm text-on-surface-variant">
                  <p className="text-xs leading-relaxed">
                    Trở thành thành viên VIP của DuoStyle để nhận sớm nhất thông tin về các bộ sưu tập giới hạn (Limited Edition), mã giảm giá <strong>10%</strong> cho đơn hàng tiếp theo và lời mời tham dự sự kiện thời trang.
                  </p>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3 max-w-md">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
                        Địa chỉ Email cá nhân *
                      </label>
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="VD: name@domain.com"
                        className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary shadow-2xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-secondary transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      {isSubmitting ? 'Đang gửi...' : 'Đăng Ký Nhận Mã 10% ngay'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: TERMS */}
            {currentTab === 'terms' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/40 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">Legal Notice</span>
                  <h3 className="font-headline-md text-2xl font-bold text-primary">Điều Khoản Sử Dụng Dịch Vụ</h3>
                </div>
                <div className="space-y-4 text-xs text-on-surface-variant leading-relaxed">
                  <p>
                    Chào mừng bạn đến với hệ thống DuoStyle Global. Khi truy cập và thực hiện giao dịch trên website, đồng nghĩa với việc bạn chấp thuận các điều khoản giao dịch được quy định bởi DuoStyle Management.
                  </p>
                  <div className="p-4 border border-outline-variant/40 rounded-xl space-y-2">
                    <p className="font-bold text-primary text-sm">1. Bản quyền & Thương hiệu</p>
                    <p>Tất cả hình ảnh, thiết kế bộ sưu tập, logo và nội dung trên hệ thống đều thuộc quyền sở hữu trí tuệ của DuoStyle.</p>
                  </div>
                  <div className="p-4 border border-outline-variant/40 rounded-xl space-y-2">
                    <p className="font-bold text-primary text-sm">2. Cam kết chất lượng sản phẩm</p>
                    <p>DuoStyle cam kết 100% sản phẩm phân phối là hàng chính hãng. Mọi hành vi làm giả, nhái thương hiệu sẽ bị xử lý theo pháp luật hiện hành.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRIVACY */}
            {currentTab === 'privacy' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-outline-variant/40 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">Data Protection</span>
                  <h3 className="font-headline-md text-2xl font-bold text-primary">Chính Sách Bảo Mật Thông Tin</h3>
                </div>
                <div className="space-y-4 text-xs text-on-surface-variant leading-relaxed">
                  <p className="font-semibold text-primary text-sm">DuoStyle cam kết bảo vệ tuyệt đối thông tin riêng tư của khách hàng.</p>
                  <ul className="space-y-2 list-disc pl-5">
                    <li><strong>Mục đích thu thập:</strong> Xử lý đơn hàng, giao hàng tận nhà, chăm sóc khách hàng và gửi mã ưu đãi cá nhân hóa.</li>
                    <li><strong>Mã hóa dữ liệu:</strong> Mật khẩu và thông tin thẻ thanh toán được mã hóa theo chuẩn SSL / TLS bảo mật ngân hàng.</li>
                    <li><strong>Bảo mật thông tin:</strong> DuoStyle không bao giờ bán hoặc chia sẻ thông tin cá nhân cho bên thứ ba ngoại trừ đối tác vận chuyển để thực hiện giao nhận đơn hàng.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-secondary transition-colors cursor-pointer shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
