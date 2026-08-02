import { classifyPaymentResult, getPaymentResultActions, readPaymentResult } from '../utils/checkout';

const RESULT_CONTENT = {
  'order-placed': {
    icon: 'inventory_2',
    iconClass: 'text-emerald-600',
    eyebrow: 'Đơn hàng đã được ghi nhận',
    title: 'Đặt Hàng Thành Công',
    description: 'Đơn hàng đã được tạo. Bạn sẽ thanh toán khi nhận hàng từ đơn vị vận chuyển.',
  },
  'payment-success': {
    icon: 'check_circle',
    iconClass: 'text-emerald-600',
    eyebrow: 'Đơn hàng đã được ghi nhận',
    title: 'Thanh Toán Thành Công',
    description: 'Cảm ơn bạn đã mua sắm tại DuoStyle. Đơn hàng đang được chuẩn bị để giao đến bạn.',
  },
  'payment-cancelled': {
    icon: 'cancel',
    iconClass: 'text-secondary',
    eyebrow: 'Giao dịch chưa hoàn tất',
    title: 'Đã Hủy Thanh Toán',
    description: 'Bạn đã hủy giao dịch VNPay. Giỏ hàng và tồn kho chưa bị thay đổi, bạn có thể thanh toán lại khi sẵn sàng.',
  },
  'payment-failed': {
    icon: 'error',
    iconClass: 'text-error',
    eyebrow: 'Không thể hoàn tất giao dịch',
    title: 'Thanh Toán Thất Bại',
    description: 'Giao dịch không được xác nhận. Vui lòng kiểm tra lại thông tin hoặc chọn phương thức thanh toán khác.',
  },
};

export default function PaymentResultPage({ result, onNavigate }) {
  const paymentResult = result || readPaymentResult(window.location.search);
  const resultKind = classifyPaymentResult(paymentResult);
  const content = RESULT_CONTENT[resultKind];
  const actions = getPaymentResultActions();

  return (
    <main className="min-h-[70vh] pt-36 pb-section-gap px-margin-mobile md:px-margin-desktop flex items-center justify-center">
      <section className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/40 rounded p-8 md:p-12 text-center shadow-sm">
        <span className={`material-symbols-outlined text-7xl mb-5 ${content.iconClass}`}>{content.icon}</span>
        <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant font-bold mb-3">
          {content.eyebrow}
        </p>
        <h1 className="font-headline-md text-headline-md text-primary mb-5">{content.title}</h1>
        <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">{content.description}</p>

        {paymentResult.orderCode && (
          <div className="inline-flex flex-col bg-surface-container-low rounded px-8 py-4 mt-8">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">Mã đơn hàng</span>
            <strong className="font-body-md text-lg mt-1">{paymentResult.orderCode}</strong>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <button
            type="button"
            onClick={() => onNavigate?.(actions.primary.page)}
            className="bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest font-bold hover:bg-secondary transition-colors rounded"
          >
            Về Trang Chủ
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.(
              actions.secondary.page,
              '',
              null,
              '',
              '',
              null,
              { profileTab: actions.secondary.profileTab },
            )}
            className="border border-primary text-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest font-bold hover:bg-primary hover:text-on-primary transition-colors rounded"
          >
            Xem Đơn Hàng
          </button>
        </div>
      </section>
    </main>
  );
}
